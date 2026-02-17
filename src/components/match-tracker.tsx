import { Badge } from "@/components/ui/warcraftcn/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateMatchFormat, type Lobby, type LobbyPlayer } from "@/lib/lobby";
import { TrophyIcon } from "lucide-react";

interface MatchTrackerProps {
	lobby: Lobby;
	players: LobbyPlayer[];
	isHost?: boolean;
	onUpdate?: () => void;
}

export function MatchTracker({
	lobby,
	players,
	isHost = false,
	onUpdate,
}: MatchTrackerProps) {
	const hostPlayer = players.find((p) => p.is_host);
	const guestPlayer = players.find((p) => !p.is_host);

	// Provide default values if match fields are missing (migration not run yet)
	const safeBestOf = lobby?.best_of ?? 1;
	const safeCurrentGame = lobby?.current_game ?? 1;

	const handleFormatChange = async (value: string) => {
		const bestOf = Number.parseInt(value, 10);
		await updateMatchFormat(lobby.id, bestOf);
		onUpdate?.();
	};

	const getWinsNeeded = () => Math.ceil(safeBestOf / 2);

	return (
		<Card>
			<CardContent className="p-4 md:p-6">
				<CardHeader className="px-0 pt-0 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<TrophyIcon className="w-5 h-5 text-amber-400" />
							<CardTitle className="text-lg">Match Tracker</CardTitle>
						</div>
						{isHost && (
							<Select
								value={String(safeBestOf)}
								onValueChange={handleFormatChange}
							>
								<SelectTrigger className="w-32 h-8 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">Single Game</SelectItem>
									<SelectItem value="3">Best of 3</SelectItem>
									<SelectItem value="5">Best of 5</SelectItem>
								</SelectContent>
							</Select>
						)}
					</div>
				</CardHeader>

				<div className="space-y-3">
					<div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg">
						<div className="flex items-center gap-3">
							<Badge variant="default" size="sm">
								HOST
							</Badge>
							<span className="font-medium text-amber-100">
								{hostPlayer?.player_name || "Host"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							{Array.from({ length: getWinsNeeded() }).map((_, i) => (
								<div
									key={i}
									className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
										i < (hostPlayer?.games_won || 0)
											? "bg-amber-500 border-amber-400 text-slate-900"
											: "border-slate-600 text-slate-600"
									}`}
								>
									{i < (hostPlayer?.games_won || 0) ? "✓" : ""}
								</div>
							))}
							<span className="ml-2 text-2xl font-bold text-amber-100">
								{hostPlayer?.games_won || 0}
							</span>
						</div>
					</div>

					{guestPlayer && (
						<div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg">
							<div className="flex items-center gap-3">
								<Badge variant="secondary" size="sm">
									GUEST
								</Badge>
								<span className="font-medium text-amber-100">
									{guestPlayer.player_name}
								</span>
							</div>
							<div className="flex items-center gap-2">
								{Array.from({ length: getWinsNeeded() }).map((_, i) => (
									<div
										key={i}
										className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
											i < (guestPlayer.games_won || 0)
												? "bg-amber-500 border-amber-400 text-slate-900"
												: "border-slate-600 text-slate-600"
										}`}
									>
										{i < (guestPlayer.games_won || 0) ? "✓" : ""}
									</div>
								))}
								<span className="ml-2 text-2xl font-bold text-amber-100">
									{guestPlayer.games_won || 0}
								</span>
							</div>
						</div>
					)}

					{safeBestOf > 1 && (
						<div className="text-center py-2">
							<p className="text-sm text-amber-200">
								Game {Math.min(safeCurrentGame, safeBestOf)} of {safeBestOf}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
