import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	getDuelHistory,
	getLobbyPlayers,
	type DuelHistory,
	type LobbyPlayer,
} from "@/lib/lobby";
import {
	HistoryIcon,
	TrophyIcon,
	ClockIcon,
	RefreshCwIcon,
} from "lucide-react";

interface DuelHistoryViewerProps {
	lobbyId: string;
	showRefresh?: boolean;
}

export function DuelHistoryViewer({
	lobbyId,
	showRefresh = true,
}: DuelHistoryViewerProps) {
	const [history, setHistory] = useState<DuelHistory[]>([]);
	const [players, setPlayers] = useState<LobbyPlayer[]>([]);
	const [loading, setLoading] = useState(true);

	const loadHistory = async () => {
		setLoading(true);
		const [historyData, playersData] = await Promise.all([
			getDuelHistory(lobbyId),
			getLobbyPlayers(lobbyId),
		]);
		setHistory(historyData);
		setPlayers(playersData);
		setLoading(false);
	};

	useEffect(() => {
		void loadHistory();
	}, [lobbyId]);

	const getPlayerName = (playerId: string | null): string => {
		if (!playerId) return "Unknown";
		const player = players.find((p) => p.id === playerId);
		return player?.player_name || "Unknown";
	};

	const formatDuration = (seconds: number | null): string => {
		if (!seconds) return "N/A";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${String(secs).padStart(2, "0")}`;
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="p-4 md:p-6">
					<CardHeader className="px-0 pt-0 pb-4">
						<div className="flex items-center gap-3">
							<HistoryIcon className="w-5 h-5 text-amber-400" />
							<CardTitle className="text-lg">Duel History</CardTitle>
						</div>
					</CardHeader>
					<p className="text-sm text-amber-200/70">Loading history...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="p-4 md:p-6">
				<CardHeader className="px-0 pt-0 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<HistoryIcon className="w-5 h-5 text-amber-400" />
							<CardTitle className="text-lg">Duel History</CardTitle>
							{history.length > 0 && (
								<Badge variant="secondary" size="sm">
									{history.length} {history.length === 1 ? "Game" : "Games"}
								</Badge>
							)}
						</div>
						{showRefresh && (
							<Button
								variant="ghost"
								size="sm"
								onClick={loadHistory}
								className="h-8 px-2"
							>
								<RefreshCwIcon className="w-4 h-4" />
							</Button>
						)}
					</div>
				</CardHeader>

				{history.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-sm text-amber-200/70">
							No games recorded yet. Complete a game to see it here!
						</p>
					</div>
				) : (
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{history.map((game) => {
							const winnerName = getPlayerName(game.winner_player_id);
							return (
								<div
									key={game.id}
									className="p-4 bg-slate-950/30 border border-slate-800 rounded-lg"
								>
									<div className="flex items-start justify-between mb-2">
										<div className="flex items-center gap-2">
											<Badge variant="secondary" size="sm">
												Game {game.game_number}
											</Badge>
											<span className="text-xs text-amber-200/70">
												{formatDate(game.completed_at)}
											</span>
										</div>
										{game.duration_seconds !== null && (
											<div className="flex items-center gap-1 text-xs text-amber-200/70">
												<ClockIcon className="w-3 h-3" />
												{formatDuration(game.duration_seconds)}
											</div>
										)}
									</div>

									<div className="flex items-center gap-2 mb-2">
										<TrophyIcon className="w-4 h-4 text-amber-400" />
										<span className="text-sm font-medium text-amber-100">
											Winner: {winnerName}
										</span>
									</div>

									{(game.host_final_lp !== null ||
										game.guest_final_lp !== null) && (
										<div className="grid grid-cols-2 gap-2 text-xs">
											{game.host_final_lp !== null && (
												<div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
													<span className="text-amber-200/70">Host LP</span>
													<span className="font-medium text-amber-100">
														{game.host_final_lp}
													</span>
												</div>
											)}
											{game.guest_final_lp !== null && (
												<div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
													<span className="text-amber-200/70">Guest LP</span>
													<span className="font-medium text-amber-100">
														{game.guest_final_lp}
													</span>
												</div>
											)}
										</div>
									)}

									{game.notes && (
										<p className="text-xs text-amber-200/70 mt-2 italic">
											{game.notes}
										</p>
									)}
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
