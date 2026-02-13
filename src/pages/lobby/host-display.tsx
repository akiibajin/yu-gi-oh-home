import { useState, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getLobbyPlayers,
	subscribeLobbyPlayers,
	closeLobby,
	type LobbyPlayer,
} from "@/lib/lobby";
import { LobbyPlayerCard } from "@/components/lobby-player-card";
import QRCodeReact from "react-qr-code";
import { initDuelSfx } from "@/lib/sfx";

// biome-ignore lint/suspicious/noExplicitAny: React component used in Preact
const QRCode = QRCodeReact as any;

export default function HostDisplay({ lobbyId }: { lobbyId: string }) {
	const { route, query } = useLocation();
	const code = query.code as string | undefined;
	const [players, setPlayers] = useState<LobbyPlayer[]>([]);
	const [loading, setLoading] = useState(true);

	const playersWithoutHost = players.filter((player) => !player.is_host);

	const handleCloseLobby = async () => {
		if (confirm("Are you sure you want to close this lobby?")) {
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

	useEffect(() => {
		initDuelSfx();
	}, []);

	useEffect(() => {
		let channel: unknown = null;
		let pollId: number | undefined;

		const refreshPlayers = async () => {
			const updatedPlayers = await getLobbyPlayers(lobbyId);
			setPlayers(updatedPlayers);
		};

		const initializeLobby = async () => {
			await refreshPlayers();
			setLoading(false);
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				setPlayers(updatedPlayers);
			});
			if (typeof window !== "undefined") {
				pollId = window.setInterval(() => {
					void refreshPlayers();
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
		};
	}, [lobbyId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading lobby...</div>
			</div>
		);
	}
	return (
		<div className="p-2 space-y-6">
			<Card className="py-2">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>Lobby Host</span>
						<Button variant="outline" size="sm" onClick={handleCloseLobby}>
							Close Lobby
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-6 items-center">
						<div className="flex-1 space-y-2">
							<div className="text-sm text-muted-foreground">
								Share this code with players:
							</div>
							<div className="flex items-center gap-2">
								<div className="text-4xl font-bold tracking-wider">{code}</div>
								<Button variant="outline" size="sm" onClick={copyLobbyCode}>
									Copy
								</Button>
							</div>
							<div className="text-sm text-muted-foreground">
								{players.length} player{players.length !== 1 ? "s" : ""}{" "}
								connected
							</div>
						</div>
						{code && (
							<div className="bg-white p-4 rounded-lg">
								<QRCode value={code} size={120} />
								<div className="text-xs text-center text-muted-foreground mt-2">
									Scan to join
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
			<div className="flex size-full relative z-10 bg-transparent flex-1 flex-wrap justify-center gap-4">
				{playersWithoutHost.map((player) => (
					<LobbyPlayerCard
						key={player.id}
						player={player}
						maxLifePoints={8000}
					/>
				))}
			</div>

			{players.length === 0 && (
				<div className="text-center text-muted-foreground py-12">
					No players in lobby yet
				</div>
			)}
		</div>
	);
}
