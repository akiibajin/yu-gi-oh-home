import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { LifePointsCounter } from "@/components/life-points-counter";
import { useIsMobile } from "@/hooks/use-mobile";
import { playLifePointsChangeSfx } from "@/lib/sfx";
import type { LobbyPlayer } from "@/lib/lobby";
import { useEffect, useRef } from "preact/hooks";
import { getSafeAvatarImages } from "@/lib/avatars";

interface LobbyPlayerCardProps {
	player: LobbyPlayer;
	showControls?: boolean;
	maxLifePoints?: number;
}

export function LobbyPlayerCard({
	player,
	maxLifePoints = 8000,
}: LobbyPlayerCardProps) {
	const prevLifePointsRef = useRef<number | null>(null);
	const isMobile = useIsMobile();
	const clamped = Math.max(0, player.life_points);
	const isEliminated = clamped === 0;
	const isEmergency = clamped > 0 && clamped <= 2000;

	useEffect(() => {
		if (prevLifePointsRef.current === null) {
			prevLifePointsRef.current = player.life_points;
			return;
		}
		if (prevLifePointsRef.current !== player.life_points) {
			playLifePointsChangeSfx(player.life_points);
		}
		prevLifePointsRef.current = player.life_points;
	}, [player.life_points]);

	// The guest flow stores the avatar name as `player_name`. For backwards
	// compatibility (or old lobbies), we also try `avatar_url`.
	const avatar = getSafeAvatarImages(player.player_name || player.avatar_url);
	const currentPlayerImage =
		clamped > 2000
			? avatar.standing
			: isEmergency
				? (avatar.risk ?? avatar.standing)
				: (avatar.lost ?? avatar.risk ?? avatar.standing);
	return (
		<Card
			className={`bg-transparent h-fit max-w-95 gap-0 ${
				isEliminated ? "" : ""
			} ${player.is_host ? "border-blue-500 border-2" : ""}`}
		>
			<CardHeader className="space-y-1 pt-8">
				<div className="flex justify-between gap-2">
					<CardTitle className="min-w-0 flex-col truncate flex items-center p-0 gap-2">
						<img
							src={currentPlayerImage}
							alt={player.player_name}
							className={`size-45 object-cover ${
								isEmergency ? "emergency-animation" : ""
							}`}
						/>
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-3 pt-0">
				<div>
					<LifePointsCounter
						strokeWidth={isMobile ? 12 : 18}
						size={isMobile ? 120 : 150}
						value={clamped}
						isEmergency={isEmergency}
						max={maxLifePoints}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
