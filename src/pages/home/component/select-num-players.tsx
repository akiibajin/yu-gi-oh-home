import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Input } from "@/components/ui/warcraftcn/input";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

const PRESET_PLAYER_COUNTS = [1, 2, 3, 4, 5] as const;

export function SelectNumPlayers() {
	const navigate = useNavigate();
	const [custom, setCustom] = useState<string>("");

	const parsedCustom = useMemo(() => {
		const n = Number.parseInt(custom, 10);
		return Number.isFinite(n) ? n : undefined;
	}, [custom]);

	const canGoCustom = !!parsedCustom && parsedCustom > 0;

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle>Selecciona el número de jugadores</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{PRESET_PLAYER_COUNTS.map((n) => (
						<Button key={n} onClick={() => navigate(`/calc/${n}/setup`)}>
							{n} {n === 1 ? "jugador" : "jugadores"}
						</Button>
					))}
				</div>

				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="number"
							min={1}
							inputMode="numeric"
							placeholder="Jugadores personalizados"
							value={custom}
							onInput={(event) => setCustom(event.currentTarget.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && canGoCustom) {
									navigate(`/calc/${parsedCustom}/setup`);
								}
							}}
						/>
					</div>
					<Button
						type="button"
						disabled={!canGoCustom}
						onClick={() => {
							if (!canGoCustom) return;
							navigate(`/calc/${parsedCustom}/setup`);
						}}
					>
						Ir
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
