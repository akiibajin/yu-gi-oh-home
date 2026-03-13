import { useState, useEffect, useRef } from "preact/hooks";
import { useLocation, useRoute } from "preact-iso";
import { Button } from "@/components/ui/warcraftcn/button";
import { Skeleton } from "@/components/ui/warcraftcn/skeleton";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	getLobbyPlayers,
	updatePlayerLifePoints,
	subscribeLobbyPlayers,
	subscribeLobby,
	getLobby,
	recordGameResult,
	type LobbyPlayer,
	type Lobby,
} from "@/lib/lobby";
import { initDuelSfx, playLifePointsChangeSfx } from "@/lib/sfx";
import { Timer } from "@/components/timer";
import { MatchTracker } from "@/components/match-tracker";
import { DiceRoller } from "@/components/dice-roller";
import { RefreshCwIcon, TrophyIcon, XCircleIcon } from "lucide-react";
import halveIcon from "@/assets/images/Halve.webp";

export default function GuestControl() {
	const { route, query } = useLocation();
	const { params } = useRoute();
	const lobbyId = params.lobbyId as string;
	const playerId = query.playerId as string | undefined;
	const [player, setPlayer] = useState<LobbyPlayer | null>(null);
	const [allPlayers, setAllPlayers] = useState<LobbyPlayer[]>([]);
	const [lobby, setLobby] = useState<Lobby | null>(null);
	const [loading, setLoading] = useState(true);
	const prevLifePointsRef = useRef<number | null>(null);

	const updateLifePoints = async (change: number) => {
		if (!player) return;

		const newLifePoints = Math.max(0, player.life_points + change);
		setPlayer({ ...player, life_points: newLifePoints });
		setAllPlayers((prev) =>
			prev.map((p) =>
				p.id === player.id ? { ...p, life_points: newLifePoints } : p,
			),
		);
		await updatePlayerLifePoints(player.id, newLifePoints);
	};

	const setLifePoints = async (value: number) => {
		if (!player) return;
		const newLifePoints = Math.max(0, value);
		setPlayer({ ...player, life_points: newLifePoints });
		setAllPlayers((prev) =>
			prev.map((p) =>
				p.id === player.id ? { ...p, life_points: newLifePoints } : p,
			),
		);
		await updatePlayerLifePoints(player.id, newLifePoints);
	};

	const recordWin = async (iWon: boolean) => {
		if (!player || !lobby) return;

		const hostPlayer = allPlayers.find((p) => p.is_host);
		if (!hostPlayer) return;

		const winnerId = iWon ? player.id : hostPlayer.id;
		const durationSeconds = lobby.timer_seconds ?? 0;

		await recordGameResult(
			lobbyId,
			winnerId,
			hostPlayer.life_points,
			player.life_points,
			durationSeconds,
		);

		// Refresh data
		const updatedLobby = await getLobby(lobbyId);
		if (updatedLobby) setLobby(updatedLobby);

		const updatedPlayers = await getLobbyPlayers(lobbyId);
		setAllPlayers(updatedPlayers);
		const updatedPlayer = updatedPlayers.find((p) => p.id === playerId);
		if (updatedPlayer) setPlayer(updatedPlayer);
	};

	const refreshLobby = async () => {
		const updated = await getLobby(lobbyId);
		if (updated) setLobby(updated);
	};
	useEffect(() => {
		initDuelSfx();
	}, []);

	useEffect(() => {
		if (!player) return;
		if (prevLifePointsRef.current === null) {
			prevLifePointsRef.current = player.life_points;
			return;
		}
		if (prevLifePointsRef.current !== player.life_points) {
			playLifePointsChangeSfx(player.life_points);
		}
		prevLifePointsRef.current = player.life_points;
	}, [player?.life_points]);
	useEffect(() => {
		let channel: unknown = null;
		let lobbyChannel: unknown = null;
		let pollId: number | undefined;

		const refreshPlayers = async () => {
			const players = await getLobbyPlayers(lobbyId);
			setAllPlayers(players);
			const currentPlayer = players.find((p) => p.id === playerId);
			if (currentPlayer) {
				setPlayer(currentPlayer);
			}
		};

		const initializePlayer = async () => {
			console.log({ lobbyId, playerId });
			if (!playerId) {
				console.log("No playerId, redirecting to join");
				route("/lobby/join");
				return;
			}

			// Load lobby data
			const lobbyData = await getLobby(lobbyId);
			if (lobbyData) setLobby(lobbyData);

			const players = await getLobbyPlayers(lobbyId);
			const currentPlayer = players.find((p) => p.id === playerId);
			if (!currentPlayer) {
				console.log("Player not found, redirecting to join");
				route("/lobby/join");
				return;
			}

			setPlayer(currentPlayer);
			setAllPlayers(players);
			setLoading(false);

			// Subscribe to player changes
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				const updatedPlayer = updatedPlayers.find((p) => p.id === playerId);
				if (updatedPlayer) {
					setPlayer(updatedPlayer);
				}
				setAllPlayers(updatedPlayers);
			});

			// Subscribe to lobby changes (for timer and match tracking)
			lobbyChannel = await subscribeLobby(lobbyId, (updatedLobby) => {
				setLobby(updatedLobby);
			});

			if (typeof window !== "undefined") {
				pollId = window.setInterval(() => {
					void refreshPlayers();
					void refreshLobby();
				}, 3000);
			}
		};

		void initializePlayer();

		return () => {
			if (pollId && typeof window !== "undefined") {
				window.clearInterval(pollId);
			}
			if (channel && typeof channel === "object" && "unsubscribe" in channel) {
				(channel as { unsubscribe: () => void }).unsubscribe();
			}
			if (
				lobbyChannel &&
				typeof lobbyChannel === "object" &&
				"unsubscribe" in lobbyChannel
			) {
				(lobbyChannel as { unsubscribe: () => void }).unsubscribe();
			}
		};
	}, [lobbyId, playerId]);
	if (loading || !player || !lobby) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="text-center space-y-4">
					<Skeleton className="w-64 h-64 mx-auto" />
					<p className="text-lg text-amber-100">
						Cargando datos del jugador...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="md:p-6 space-y-6 max-w-2xl mx-auto pb-[env(safe-area-inset-bottom)]">
			<Card>
				<CardContent className="px-0 py-4 md:p-8">
					<CardHeader className="px-0 pt-0 pb-6">
						<div className="flex items-center gap-3">
							<CardTitle>Tus Puntos de Vida</CardTitle>
						</div>
					</CardHeader>
					<div className="space-y-6">
						<div className="text-center p-8 bg-black/20 rounded-lg border-2 border-amber-900/30">
							<div className="text-5xl md:text-8xl font-bold text-amber-100 [text-shadow:0_0_20px_rgba(251,191,36,0.5)]">
								{player.life_points}
							</div>
						</div>
						<div className="space-y-3">
							<div className="grid grid-cols-3 gap-3">
								<Button
									variant="frame"
									onClick={() => updateLifePoints(-2000)}
									className="md:text-lg h-16"
								>
									-2k
								</Button>
								<Button
									variant="frame"
									onClick={() => updateLifePoints(-1000)}
									className="md:text-lg h-16"
								>
									-1k
								</Button>
								<Button
									variant="frame"
									onClick={() => updateLifePoints(-500)}
									className="md:text-lg h-16"
								>
									-500
								</Button>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Button
									variant="frame"
									onClick={() => updateLifePoints(-100)}
									className="md:text-lg h-16"
								>
									-100
								</Button>
								<Button
									variant="frame"
									onClick={() => updateLifePoints(-50)}
									className="md:text-lg h-16"
								>
									-50
								</Button>
								<Button
									variant="frame"
									onClick={() =>
										setLifePoints(Math.floor(player.life_points / 2))
									}
									className="md:text-lg h-16"
								>
									<img src={halveIcon} alt="Mitad" className="w-5 h-5" />
								</Button>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Button
									variant="default"
									onClick={() => updateLifePoints(50)}
									className="md:text-lg h-16"
								>
									+50
								</Button>
								<Button
									variant="default"
									onClick={() => updateLifePoints(100)}
									className="md:text-lg h-16"
								>
									+100
								</Button>
								<Button
									variant="default"
									onClick={() => updateLifePoints(500)}
									className="md:text-lg h-16"
								>
									+500
								</Button>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="default"
									onClick={() => updateLifePoints(1000)}
									className="md:text-lg h-16"
								>
									+1k
								</Button>
								<Button
									variant="default"
									onClick={() => updateLifePoints(2000)}
									className="md:text-lg h-16"
								>
									+2k
								</Button>
							</div>
							<Button
								variant="frame"
								onClick={() => setLifePoints(8000)}
								className="w-full h-14"
							>
								<RefreshCwIcon className="w-5 h-5 mr-2" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 gap-6">
				<Timer lobbyId={lobbyId} lobby={lobby} onLobbyUpdate={setLobby} />
				<MatchTracker
					lobby={lobby}
					players={allPlayers}
					isHost={false}
					onUpdate={refreshLobby}
				/>
			</div>

			{(lobby?.best_of ?? 1) > 1 && (
				<Card>
					<CardContent className="p-4 md:p-6">
						<CardHeader className="px-0 pt-0 pb-4">
							<div className="flex items-center gap-3">
								<TrophyIcon className="w-5 h-5 text-amber-400" />
								<CardTitle className="text-lg">
									Reportar resultado del duelo
								</CardTitle>
							</div>
						</CardHeader>
						<p className="text-sm text-amber-200/70 mb-4">
							Indica quién ganó este duelo:
						</p>
						<div className="grid grid-cols-2 gap-3">
							<Button
								variant="default"
								onClick={() => recordWin(true)}
								className="h-16 flex flex-col gap-1"
							>
								<TrophyIcon className="w-5 h-5" />
								<span>Gané</span>
							</Button>
							<Button
								variant="frame"
								onClick={() => recordWin(false)}
								className="h-16 flex flex-col gap-1"
							>
								<XCircleIcon className="w-5 h-5" />
								<span>Perdí</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<DiceRoller
				lobbyId={lobbyId}
				playerId={player.id}
				playerName={player.player_name}
			/>
		</div>
	);
}
