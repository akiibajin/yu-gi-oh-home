import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { recordDiceRoll, getDiceRolls, type DiceRoll } from "@/lib/lobby";
import { Dice6Icon } from "lucide-react";

interface DiceRollerProps {
	lobbyId: string;
	playerId: string | null;
	playerName: string | null;
	showHistory?: boolean;
}

export function DiceRoller({
	lobbyId,
	playerId,
	playerName,
	showHistory = true,
}: DiceRollerProps) {
	const [rolling, setRolling] = useState(false);
	const [lastResult, setLastResult] = useState<string | null>(null);
	const [history, setHistory] = useState<DiceRoll[]>([]);

	const refreshHistory = async () => {
		const rolls = await getDiceRolls(lobbyId);
		setHistory(rolls);
	};

	const rollDice = async (type: "coin" | "d6" | "d20") => {
		setRolling(true);
		setLastResult(null);

		// Simulate rolling animation
		await new Promise((resolve) => setTimeout(resolve, 500));

		let result: string;
		if (type === "coin") {
			result = Math.random() < 0.5 ? "Heads" : "Tails";
		} else if (type === "d6") {
			result = String(Math.floor(Math.random() * 6) + 1);
		} else {
			result = String(Math.floor(Math.random() * 20) + 1);
		}

		setLastResult(result);
		setRolling(false);

		await recordDiceRoll(lobbyId, playerId, playerName, type, result);
		await refreshHistory();
	};

	return (
		<Card>
			<CardContent className="p-4 md:p-6">
				<CardHeader className="px-0 pt-0 pb-4">
					<div className="flex items-center gap-3">
						<Dice6Icon className="w-5 h-5 text-amber-400" />
						<CardTitle className="text-lg">Dice & Coin Flip</CardTitle>
					</div>
				</CardHeader>

				{lastResult && (
					<div className="mb-4 p-4 bg-amber-950/30 border border-amber-900/50 rounded-lg text-center">
						<p className="text-sm text-amber-200 mb-1">Result:</p>
						<p className="text-3xl font-bold text-amber-100">{lastResult}</p>
					</div>
				)}

				<div className="grid grid-cols-3 gap-2 mb-4">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => rollDice("coin")}
						disabled={rolling}
						className="flex flex-col items-center py-3 h-auto"
					>
						<span className="text-2xl mb-1">🪙</span>
						<span className="text-xs">Coin Flip</span>
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => rollDice("d6")}
						disabled={rolling}
						className="flex flex-col items-center py-3 h-auto"
					>
						<span className="text-2xl mb-1">🎲</span>
						<span className="text-xs">Roll D6</span>
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => rollDice("d20")}
						disabled={rolling}
						className="flex flex-col items-center py-3 h-auto"
					>
						<span className="text-2xl mb-1">🎲</span>
						<span className="text-xs">Roll D20</span>
					</Button>
				</div>

				{showHistory && history.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium text-amber-200">Recent Rolls</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={refreshHistory}
								className="h-6 px-2 text-xs"
							>
								Refresh
							</Button>
						</div>
						<div className="space-y-1 max-h-40 overflow-y-auto">
							{history.slice(0, 5).map((roll) => (
								<div
									key={roll.id}
									className="flex items-center justify-between p-2 bg-slate-950/30 rounded text-xs"
								>
									<div className="flex items-center gap-2">
										<Badge variant="secondary" size="sm">
											{roll.roll_type === "coin"
												? "🪙"
												: roll.roll_type === "d6"
													? "D6"
													: "D20"}
										</Badge>
										<span className="text-amber-100">
											{roll.player_name || "Unknown"}
										</span>
									</div>
									<span className="font-bold text-amber-200">
										{roll.result}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
