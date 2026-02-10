import { useState, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLobbyPlayers, updatePlayerLifePoints, subscribeLobbyPlayers, type LobbyPlayer } from "@/lib/lobby";
import { LobbyPlayerCard } from "@/components/lobby-player-card";

interface GuestControlProps {
	lobbyId: string;
	playerId?: string;
}

export default function GuestControl({ lobbyId, playerId }: GuestControlProps) {
	const { route } = useLocation();
	const [player, setPlayer] = useState<LobbyPlayer | null>(null);
	const [allPlayers, setAllPlayers] = useState<LobbyPlayer[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let channel: unknown = null;

		const initializePlayer = async () => {
			if (!playerId) {
				route("/lobby/join");
				return;
			}

			const players = await getLobbyPlayers(lobbyId);
			const currentPlayer = players.find((p) => p.id === playerId);
			
			if (!currentPlayer) {
				route("/lobby/join");
				return;
			}

			setPlayer(currentPlayer);
			setAllPlayers(players);
			setLoading(false);

			// Subscribe to real-time updates
			channel = await subscribeLobbyPlayers(lobbyId, (updatedPlayers) => {
				const updatedPlayer = updatedPlayers.find((p) => p.id === playerId);
				if (updatedPlayer) {
					setPlayer(updatedPlayer);
				}
				setAllPlayers(updatedPlayers);
			});
		};

		void initializePlayer();

		return () => {
			if (channel && typeof channel === "object" && "unsubscribe" in channel) {
				(channel as { unsubscribe: () => void }).unsubscribe();
			}
		};
	}, [lobbyId, playerId]);

	const updateLifePoints = async (change: number) => {
		if (!player) return;

		const newLifePoints = Math.max(0, player.life_points + change);
		await updatePlayerLifePoints(player.id, newLifePoints);
	};

	const setLifePoints = async (value: number) => {
		if (!player) return;
		await updatePlayerLifePoints(player.id, Math.max(0, value));
	};

	if (loading || !player) {
		return (
			<div class="flex items-center justify-center min-h-screen">
				<div class="text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div class="p-4 space-y-6">
			{/* Player Info */}
			<Card>
				<CardHeader>
					<CardTitle>Welcome, {player.player_name}!</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-sm text-muted-foreground">
						{allPlayers.length} player{allPlayers.length !== 1 ? "s" : ""} in lobby
					</div>
				</CardContent>
			</Card>

			{/* Life Points Counter */}
			<Card>
				<CardHeader>
					<CardTitle>Your Life Points</CardTitle>
				</CardHeader>
				<CardContent class="space-y-6">
					{/* Display */}
					<div class="text-center">
						<div class="text-7xl font-bold">{player.life_points}</div>
					</div>

					{/* Quick buttons */}
					<div class="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-1000)}
							class="text-lg"
						>
							-1000
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-500)}
							class="text-lg"
						>
							-500
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => updateLifePoints(-100)}
							class="text-lg"
						>
							-100
						</Button>
					</div>

					<div class="grid grid-cols-3 gap-2">
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(100)}
							class="text-lg"
						>
							+100
						</Button>
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(500)}
							class="text-lg"
						>
							+500
						</Button>
						<Button
							variant="default"
							size="lg"
							onClick={() => updateLifePoints(1000)}
							class="text-lg"
						>
							+1000
						</Button>
					</div>

					{/* Reset button */}
					<Button
						variant="secondary"
						onClick={() => setLifePoints(8000)}
						class="w-full"
					>
						Reset to 8000
					</Button>
				</CardContent>
			</Card>

			{/* Other Players */}
			<div>
				<h3 class="text-lg font-semibold mb-3">Other Players</h3>
				<div class="flex flex-wrap gap-4">
					{allPlayers
						.filter((p) => p.id !== player.id)
						.map((p) => (
							<LobbyPlayerCard
								key={p.id}
								player={p}
								maxLifePoints={8000}
							/>
						))}
					{allPlayers.length === 1 && (
						<div class="text-sm text-muted-foreground text-center py-4 w-full">
							No other players yet
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
