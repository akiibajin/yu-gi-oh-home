import { useState, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Skeleton } from "@/components/ui/warcraftcn/skeleton";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	getLobbyPlayers,
	subscribeLobbyPlayers,
	subscribeLobby,
	closeLobby,
	getLobby,
	type LobbyPlayer,
	type Lobby,
} from "@/lib/lobby";
import { LobbyPlayerCard } from "@/components/lobby-player-card";
import { Timer } from "@/components/timer";
import { MatchTracker } from "@/components/match-tracker";
import { DiceRoller } from "@/components/dice-roller";
import { DuelHistoryViewer } from "@/components/duel-history-viewer";
import QRCodeReact from "react-qr-code";
import { initDuelSfx } from "@/lib/sfx";
import { CopyIcon, CrownIcon, UsersIcon, QrCodeIcon } from "lucide-react";

// biome-ignore lint/suspicious/noExplicitAny: React component used in Preact
const QRCode = QRCodeReact as any;

export default function HostDisplay({ lobbyId }: { lobbyId: string }) {
	const { route, query } = useLocation();
	const code = query.code as string | undefined;
	const [players, setPlayers] = useState<LobbyPlayer[]>([]);
	const [lobby, setLobby] = useState<Lobby | null>(null);
	const [loading, setLoading] = useState(true);

	const playersWithoutHost = players.filter((player) => !player.is_host);
	const hostPlayer = players.find((player) => player.is_host);

	const handleCloseLobby = async () => {
		if (confirm("¿Seguro que quieres cerrar esta sala?")) {
			await closeLobby(lobbyId);
			console.log("Closing lobby and navigating to home");
			route("/");
		}
	};

	const copyLobbyCode = () => {
		if (code) {
			navigator.clipboard.writeText(code);
		}
	};

	const refreshLobby = async () => {
		const updated = await getLobby(lobbyId);
		if (updated) setLobby(updated);
	};

	useEffect(() => {
		initDuelSfx();
	}, []);

	useEffect(() => {
		let channel: unknown = null;
		let lobbyChannel: unknown = null;
		let pollId: number | undefined;

		const refreshPlayers = async () => {
			const updatedPlayers = await getLobbyPlayers(lobbyId);
			setPlayers(updatedPlayers);
		};

		const initializeLobby = async () => {
			// Load initial lobby data
			const lobbyData = await getLobby(lobbyId);
			if (lobbyData) setLobby(lobbyData);

			await refreshPlayers();
			setLoading(false);

			// Subscribe to player changes
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				setPlayers(updatedPlayers);
			});

			// Subscribe to lobby changes (for timer)
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

		void initializeLobby();

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
	}, [lobbyId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="text-center space-y-4">
					<Skeleton className="w-64 h-32 mx-auto" />
					<p className="text-lg text-amber-100">Cargando sala...</p>
				</div>
			</div>
		);
	}

	if (!lobby) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="text-center space-y-4">
					<p className="text-lg text-red-400">Sala no encontrada</p>
					<Button onClick={() => route("/lobby")}>Volver a salas</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<CardContent className="p-6 md:p-8">
					<CardHeader className="px-0 pt-0 pb-6">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-3">
								<CrownIcon className="w-6 h-6 text-amber-400" />
								<CardTitle>Anfitrión de la sala</CardTitle>
								<Badge variant="default" size="sm">
									Activa
								</Badge>
							</div>
							<Button variant="frame" onClick={handleCloseLobby}>
								Cerrar sala
							</Button>
						</div>
					</CardHeader>
					<div className="flex flex-col lg:flex-row gap-6 items-center">
						<div className="flex-1 space-y-4 w-full">
							<div className="flex items-center gap-2">
								<QrCodeIcon className="w-5 h-5 text-amber-400" />
								<span className="text-sm text-amber-200/70">
									Comparte este código con los jugadores:
								</span>
							</div>
							<div className="flex items-center gap-3 flex-wrap">
								<div className="text-4xl md:text-5xl font-bold tracking-widest text-amber-100">
									{code}
								</div>
								<Button variant="frame" onClick={copyLobbyCode}>
									<CopyIcon className="w-4 h-4 mr-2" />
									Copiar
								</Button>
							</div>
							<div className="flex items-center gap-2">
								<UsersIcon className="w-5 h-5 text-amber-400" />
								<Badge variant="secondary" size="sm">
									{playersWithoutHost.length}{" "}
									{playersWithoutHost.length !== 1 ? "Jugadores" : "Jugador"}
								</Badge>
							</div>
						</div>
						{code && (
							<div className="bg-white p-5 rounded-lg shadow-lg">
								<QRCode value={code} size={140} />
								<div className="text-xs text-center text-gray-700 font-medium mt-3">
									Escanea para unirte
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Timer lobbyId={lobbyId} lobby={lobby} onLobbyUpdate={setLobby} />
				<MatchTracker
					lobby={lobby}
					players={players}
					isHost={true}
					onUpdate={refreshLobby}
				/>
			</div>

			<DiceRoller
				lobbyId={lobbyId}
				playerId={hostPlayer?.id || null}
				playerName={hostPlayer?.player_name || null}
			/>
			<DuelHistoryViewer lobbyId={lobbyId} />
			<div className="flex size-full relative z-10 bg-transparent flex-1 flex-wrap justify-center gap-4">
				{playersWithoutHost.map((player) => (
					<LobbyPlayerCard
						key={player.id}
						player={player}
						maxLifePoints={8000}
					/>
				))}
			</div>

			{playersWithoutHost.length === 0 && (
				<Card>
					<CardContent className="p-12">
						<div className="text-center space-y-3">
							<UsersIcon className="w-16 h-16 mx-auto text-amber-700/50" />
							<p className="text-muted-foreground">
								Esperando a que se unan los jugadores...
							</p>
							<p className="text-sm text-muted-foreground/70">
								Comparte el código de la sala de arriba
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
