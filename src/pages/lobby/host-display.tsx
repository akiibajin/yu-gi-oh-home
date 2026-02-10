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

// Cast React component for Preact compatibility
// biome-ignore lint/suspicious/noExplicitAny: React component used in Preact
const QRCode = QRCodeReact as any;

export default function HostDisplay({
	lobbyId,
}: {
	lobbyId: string;
}) {
	const { route, query } = useLocation();
	const code = query.code as string | undefined;
	const [players, setPlayers] = useState<LobbyPlayer[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let channel: unknown = null;

		const initializeLobby = async () => {
			// Fetch initial players
			const initialPlayers = await getLobbyPlayers(lobbyId);
			setPlayers(initialPlayers);
			setLoading(false);

			// Subscribe to real-time updates
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				setPlayers(updatedPlayers);
			});
		};

		void initializeLobby();

		return () => {
			if (channel && typeof channel === "object" && "unsubscribe" in channel) {
				(channel as { unsubscribe: () => void }).unsubscribe();
			}
		};
	}, [lobbyId]);

	const handleCloseLobby = async () => {
		if (confirm("Are you sure you want to close this lobby?")) {
			await closeLobby(lobbyId);
			route("/");
		}
	};

	const copyLobbyCode = () => {
		if (code) {
			navigator.clipboard.writeText(code);
		}
	};

	if (loading) {
		return (
			<div class="flex items-center justify-center min-h-screen">
				<div class="text-lg">Loading lobby...</div>
			</div>
		);
	}
	console.log({ code });
	return (
		<div class="p-4 space-y-6">
			{/* Header with lobby code */}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center justify-between">
						<span>Lobby Host</span>
						<Button variant="outline" size="sm" onClick={handleCloseLobby}>
							Close Lobby
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-col md:flex-row gap-6 items-center">
						<div class="flex-1 space-y-2">
							<div class="text-sm text-muted-foreground">
								Share this code with players:
							</div>
							<div class="flex items-center gap-2">
								<div class="text-4xl font-bold tracking-wider">{code}</div>
								<Button variant="outline" size="sm" onClick={copyLobbyCode}>
									Copy
								</Button>
							</div>
							<div class="text-sm text-muted-foreground">
								{players.length} player{players.length !== 1 ? "s" : ""}{" "}
								connected
							</div>
						</div>
						{code && (
							<div class="bg-white p-4 rounded-lg">
								<QRCode value={code} size={160} />
								<div class="text-xs text-center text-muted-foreground mt-2">
									Scan to join
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Players Grid */}
			<div class="flex size-full relative z-10 bg-transparent flex-1 flex-wrap justify-center gap-4">
				{players.map((player) => (
					<LobbyPlayerCard
						key={player.id}
						player={player}
						maxLifePoints={8000}
					/>
				))}
			</div>

			{players.length === 0 && (
				<div class="text-center text-muted-foreground py-12">
					No players in lobby yet
				</div>
			)}
		</div>
	);
}
