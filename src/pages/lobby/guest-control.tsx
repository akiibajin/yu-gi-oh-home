import { useState, useEffect, useRef } from "preact/hooks";
import { useLocation, useRoute } from "preact-iso";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getLobbyPlayers,
	updatePlayerLifePoints,
	subscribeLobbyPlayers,
	type LobbyPlayer,
} from "@/lib/lobby";
import { initDuelSfx, playLifePointsChangeSfx } from "@/lib/sfx";

export default function GuestControl() {
	const { route, query } = useLocation();
	const { params } = useRoute();
	const lobbyId = params.lobbyId as string;
	const playerId = query.playerId as string | undefined;
	const [player, setPlayer] = useState<LobbyPlayer | null>(null);
	const [allPlayers, setAllPlayers] = useState<LobbyPlayer[]>([]);
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
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				const updatedPlayer = updatedPlayers.find((p) => p.id === playerId);
				if (updatedPlayer) {
					setPlayer(updatedPlayer);
				}
				setAllPlayers(updatedPlayers);
			});
			if (typeof window !== "undefined") {
				pollId = window.setInterval(() => {
					void refreshPlayers();
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
		};
	}, [lobbyId, playerId]);
	if (loading || !player) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Welcome, {player.player_name}!</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">
						{allPlayers.length} player{allPlayers.length !== 1 ? "s" : ""} in
						lobby
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Your Life Points</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center">
						<div className="text-7xl font-bold">{player.life_points}</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-2000)}
							className="text-lg"
						>
							-2000
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-1000)}
							className="text-lg"
						>
							-1000
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-500)}
							className="text-lg"
						>
							-500
						</Button>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-100)}
							className="text-lg"
						>
							-100
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-50)}
							className="text-lg"
						>
							-50
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => setLifePoints(Math.floor(player.life_points / 2))}
							className="text-lg"
						>
							Halve
						</Button>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(50)}
							className="text-lg"
						>
							+50
						</Button>
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(100)}
							className="text-lg"
						>
							+100
						</Button>
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(500)}
							className="text-lg"
						>
							+500
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(1000)}
							className="text-lg"
						>
							+1000
						</Button>
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(2000)}
							className="text-lg"
						>
							+2000
						</Button>
					</div>
					<Button
						variant="secondary"
						onClick={() => setLifePoints(8000)}
						className="w-full"
					>
						Reset to 8000
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
