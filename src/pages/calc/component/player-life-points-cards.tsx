import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifePointsCounter } from "@/components/life-points-counter";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "preact/hooks";
import { PLAYERS_IMAGES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

export type PlayerLifePoints = {
	id: string;
	name: string;
	lifePoints: number;
	maxLifePoints?: number;
};

type PlayerLifePointsCardProps = {
	player: PlayerLifePoints;
	onLifePointsChange: (next: number) => void;
	step?: number;
};

function PlayerLifePointsCard({
	player,
	onLifePointsChange,
	step = 500,
}: PlayerLifePointsCardProps) {
	const [valueToIterate, setValueToIterate] = useState<number>(step);
	const isMobile = useIsMobile();
	const max = player.maxLifePoints ?? 8000;
	const clamped = Math.max(0, player.lifePoints);
	const inCreaseLifePoints = () => {
		onLifePointsChange(clamped + valueToIterate);
	};
	const playerImage =
		PLAYERS_IMAGES?.[player.name as keyof typeof PLAYERS_IMAGES] ||
		PLAYERS_IMAGES.defaultAvatar;
	const decreaseLifePoints = () => {
		onLifePointsChange(
			clamped - valueToIterate < 0 ? 0 : clamped - valueToIterate,
		);
	};
	const halveLp = () => {
		onLifePointsChange(Math.floor(clamped / 2));
	};
	const isEliminated = clamped === 0;
	const isEmergency = clamped > 0 && clamped <= 2000;

	return (
		<Card
			className={`bg-transparent h-fit max-w-95 ${
				isEliminated ? "opacity-60 grayscale" : ""
			}`}
		>
			<CardHeader className="space-y-1 p-3">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="min-w-0 truncate">
						<img
							src={playerImage}
							alt={player.name}
							className={`size-35 object-contain ${
								isEmergency ? "emergency-animation" : ""
							}`}
						/>
					</CardTitle>
					<div>
						<LifePointsCounter
							strokeWidth={isMobile ? 12 : 18}
							size={isMobile ? 120 : 150}
							value={clamped}
							isEmergency={isEmergency}
							max={max}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-2 p-3 pt-0">
				<div className="flex items-center gap-2">
					<div className="">
						<InputGroup className="bg-white w-40">
							<InputGroupAddon align="inline-start">
								<InputGroupButton
									aria-label={`plus life points`}
									onClick={() => decreaseLifePoints()}
								>
									<MinusIcon />
								</InputGroupButton>
							</InputGroupAddon>
							<InputGroupInput
								type="number"
								inputMode="numeric"
								min={0}
								value={valueToIterate}
								onInput={(event) =>
									setValueToIterate(+event.currentTarget.value)
								}
							/>

							<InputGroupAddon align="inline-end">
								<InputGroupButton
									aria-label={`plus life points`}
									onClick={() => inCreaseLifePoints()}
								>
									<PlusIcon />
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => onLifePointsChange(max)}
					>
						<RotateCcwIcon />
					</Button>
					<Button onClick={halveLp}>Halve</Button>
				</div>
			</CardContent>
		</Card>
	);
}

type PlayerLifePointsCardsProps = {
	players: PlayerLifePoints[];
	onUpdatePlayer: (id: string, nextLifePoints: number) => void;
	step?: number;
};

export function PlayerLifePointsCards({
	players,
	onUpdatePlayer,
	step,
}: PlayerLifePointsCardsProps) {
	return (
		<div className="flex size-full relative z-10 bg-transparent flex-1 flex-wrap justify-center gap-4">
			{players.map((player) => (
				<PlayerLifePointsCard
					key={player.id}
					player={player}
					step={step}
					onLifePointsChange={(next) => onUpdatePlayer(player.id, next)}
				/>
			))}
		</div>
	);
}
