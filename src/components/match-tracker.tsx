import { Button } from "@/components/ui/warcraftcn/button";
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
import {
	resetMatch,
	updateMatchFormat,
	type Lobby,
	type LobbyPlayer,
} from "@/lib/lobby";
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
	const activePlayers = players.filter((p) => p.active !== false);
	const guestPlayers = activePlayers.filter((p) => !p.is_host);

	// Provide default values if match fields are missing (migration not run yet)
	const safeBestOf = lobby?.best_of ?? 1;
	const safeCurrentGame = lobby?.current_game ?? 1;

	const handleFormatChange = async (value: string) => {
		const bestOf = Number.parseInt(value, 10);
		await updateMatchFormat(lobby.id, bestOf);
		onUpdate?.();
	};

	const handleResetMatch = async () => {
		await resetMatch(lobby.id);
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
							<CardTitle className="text-lg">Partidas ganadas</CardTitle>
						</div>
						{isHost && (
							<div className="flex items-center gap-2">
								<Select
									value={String(safeBestOf)}
									onValueChange={handleFormatChange}
								>
									<SelectTrigger className="w-32 h-8 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">Solo uno</SelectItem>
										<SelectItem value="3">Mejor de 3</SelectItem>
										<SelectItem value="5">Mejor de 5</SelectItem>
									</SelectContent>
								</Select>
								<Button
									variant="frame"
									onClick={handleResetMatch}
									className="h-8 text-xs"
									type="button"
								>
									Reiniciar partida
								</Button>
							</div>
						)}
					</div>
				</CardHeader>

				<div className="space-y-3">
					{guestPlayers.map((guestPlayer) => (
						<div
							key={guestPlayer.id}
							className="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg"
						>
							<div className="flex items-center gap-3">
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
					))}

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
