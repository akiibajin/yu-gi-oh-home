import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifePointsCounter } from "@/components/life-points-counter";
import { PLAYERS_IMAGES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LobbyPlayer } from "@/lib/lobby";

interface LobbyPlayerCardProps {
	player: LobbyPlayer;
	showControls?: boolean;
	maxLifePoints?: number;
}

export function LobbyPlayerCard({
	player,
	maxLifePoints = 8000,
}: LobbyPlayerCardProps) {
	const isMobile = useIsMobile();
	const clamped = Math.max(0, player.life_points);
	const isEliminated = clamped === 0;
	const isEmergency = clamped > 0 && clamped <= 2000;

	// Get avatar image
	const playerImage = player.avatar_url || PLAYERS_IMAGES.defaultAvatar;

	return (
		<Card
			className={`bg-transparent h-fit max-w-95 ${
				isEliminated ? "opacity-60 grayscale" : ""
			} ${player.is_host ? "border-blue-500 border-2" : ""}`}
		>
			<CardHeader className="space-y-1 p-3">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="min-w-0 truncate flex items-center gap-2">
						<img
							src={playerImage}
							alt={player.player_name}
							className={`size-35 object-contain ${
								isEmergency ? "emergency-animation" : ""
							}`}
						/>
						<div className="flex flex-col">
							<span className="text-lg">{player.player_name}</span>
							{player.is_host && (
								<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded w-fit">
									HOST
								</span>
							)}
						</div>
					</CardTitle>
					<div>
						<LifePointsCounter
							strokeWidth={isMobile ? 12 : 18}
							size={isMobile ? 120 : 150}
							value={clamped}
							isEmergency={isEmergency}
							max={maxLifePoints}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-3 pt-0">
				<div className="text-center">
					<div className="text-3xl font-bold">{clamped}</div>
					<div className="text-sm text-muted-foreground">Life Points</div>
				</div>
			</CardContent>
		</Card>
	);
}
