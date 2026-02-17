import { useEffect, useState } from "preact/hooks";
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
	closeLobby,
	getActiveLobbies,
	getHostPlayer,
	type Lobby,
} from "@/lib/lobby";
import { RefreshCwIcon, ShieldIcon, UsersIcon, CrownIcon } from "lucide-react";

export default function LobbyIndex() {
	const { route } = useLocation();
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

	const handleEnterAsHost = async (lobby: Lobby) => {
		// Get the host player for this lobby
		const hostPlayer = await getHostPlayer(lobby.id);
		if (!hostPlayer) {
			setError("Could not find host player for this lobby.");
			return;
		}

		// Navigate to host display
		const url = `/lobby/host/${lobby.id}?code=${lobby.lobby_code}&playerId=${hostPlayer.id}`;
		route(url);
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<CardContent className="p-6 md:p-8">
					<CardHeader className="px-0 pt-0 pb-6">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div className="flex items-center gap-3">
								<ShieldIcon className="w-6 h-6 text-amber-400" />
								<CardTitle>Active Lobbies</CardTitle>
								{!loading && lobbies.length > 0 && (
									<Badge size="sm">{lobbies.length}</Badge>
								)}
							</div>
							<Button variant="frame" onClick={loadLobbies} disabled={loading}>
								<RefreshCwIcon
									className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
								/>
								Refresh
							</Button>
						</div>
					</CardHeader>
					<div className="space-y-4">
						{error && (
							<div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
								<Badge variant="destructive" size="sm" className="mb-2">
									Error
								</Badge>
								<p className="text-sm text-red-200">{error}</p>
							</div>
						)}
						{loading && (
							<div className="space-y-3">
								{[...Array(3)].map((_, i) => (
									<Skeleton key={i} className="w-full h-32" />
								))}
							</div>
						)}
						{!loading && lobbies.length === 0 && (
							<div className="text-center py-12 px-4 bg-black/20 rounded-lg border border-amber-900/20">
								<UsersIcon className="w-12 h-12 mx-auto mb-3 text-amber-700/50" />
								<p className="text-muted-foreground">No active lobbies found</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									Create or join a new lobby to get started
								</p>
							</div>
						)}
						{lobbies.map((lobby) => (
							<div
								key={lobby.id}
								className="flex flex-col gap-4 rounded-lg border border-amber-900/30 bg-black/20 p-4 md:flex-row md:items-center md:justify-between hover:border-amber-800/50 transition-colors"
							>
								<div className="space-y-2 flex-1">
									<div className="flex items-center gap-2">
										<Badge variant="default" size="sm">
											Active
										</Badge>
										<span className="text-sm text-amber-200/70">
											Lobby Code
										</span>
									</div>
									<div className="text-2xl md:text-3xl font-bold tracking-widest text-amber-100">
										{lobby.lobby_code}
									</div>
									<div className="text-xs text-muted-foreground flex items-center gap-2">
										<span>
											Created {new Date(lobby.created_at).toLocaleString()}
										</span>
									</div>
								</div>
								<div className="flex flex-col gap-2 w-full md:w-auto">
									<Button
										variant="default"
										className="w-full"
										onClick={() => handleEnterAsHost(lobby)}
									>
										<CrownIcon className="w-4 h-4 mr-2" />
										Enter as Host
									</Button>
									<Button
										variant="frame"
										className="w-full"
										onClick={() => handleCloseLobby(lobby.id)}
									>
										Shut Down Lobby
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
