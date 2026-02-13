import { useEffect, useState } from "preact/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { closeLobby, getActiveLobbies, type Lobby } from "@/lib/lobby";

export default function LobbyIndex() {
	const [lobbies, setLobbies] = useState<Lobby[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadLobbies = async () => {
		setLoading(true);
		setError("");
		const data = await getActiveLobbies();
		setLobbies(data);
		setLoading(false);
	};

	useEffect(() => {
		void loadLobbies();
	}, []);

	const handleCloseLobby = async (lobbyId: string) => {
		const confirmed = confirm("Close this lobby for everyone?");
		if (!confirmed) return;

		const ok = await closeLobby(lobbyId);
		if (!ok) {
			setError("Failed to close lobby. Please try again.");
			return;
		}

		setLobbies((prev) => prev.filter((lobby) => lobby.id !== lobbyId));
	};

	return (
		<div className="p-4 space-y-4">
			<Card>
				<CardHeader className="flex items-center justify-between gap-2 md:flex-row">
					<CardTitle>Active Lobbies</CardTitle>
					<Button variant="outline" onClick={loadLobbies}>
						Refresh
					</Button>
				</CardHeader>
				<CardContent className="space-y-3">
					{error && <div className="text-sm text-red-500">{error}</div>}
					{loading && (
						<div className="text-sm text-muted-foreground">Loading...</div>
					)}
					{!loading && lobbies.length === 0 && (
						<div className="text-sm text-muted-foreground">
							No active lobbies.
						</div>
					)}
					{lobbies.map((lobby) => (
						<div
							key={lobby.id}
							className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
						>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">Lobby Code</div>
								<div className="text-lg font-semibold tracking-wider">
									{lobby.lobby_code}
								</div>
								<div className="text-xs text-muted-foreground">
									Created {new Date(lobby.created_at).toLocaleString()}
								</div>
							</div>
							<Button
								variant="destructive"
								onClick={() => handleCloseLobby(lobby.id)}
							>
								Shut Lobby
							</Button>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
