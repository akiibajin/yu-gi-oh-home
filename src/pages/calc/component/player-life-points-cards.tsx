import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifePointsCounter } from "@/components/life-points-counter";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "preact/hooks";

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
	const max = player.maxLifePoints ?? 8000;
	const clamped = Math.max(0, player.lifePoints);
	const inCreaseLifePoints = () => {
		onLifePointsChange(clamped + valueToIterate);
	};
	const decreaseLifePoints = () => {
		onLifePointsChange(
			clamped - valueToIterate < 0 ? 0 : clamped - valueToIterate,
		);
	};
	const halveLp = () => {
		onLifePointsChange(Math.floor(clamped / 2));
	};

	return (
		<Card>
			<CardHeader className="space-y-1">
				<div className="flex items-center justify-between gap-3">
					<CardTitle className="min-w-0 flex-1 truncate">
						{player.name}
					</CardTitle>
					<LifePointsCounter
						strokeWidth={25}
						size={250}
						value={clamped}
						max={max}
					/>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center gap-2">
					<div className="flex-1">
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<InputGroupText>LP</InputGroupText>
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
								<InputGroupText>LP</InputGroupText>
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
		<div className="flex size-full flex-1 flex-wrap gap-4">
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
