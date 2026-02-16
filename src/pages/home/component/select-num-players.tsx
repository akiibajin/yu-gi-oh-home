import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Input } from "@/components/ui/warcraftcn/input";
import { useLocation } from "preact-iso";
import { useMemo, useState } from "preact/hooks";

const PRESET_PLAYER_COUNTS = [1, 2, 3, 4, 5] as const;

export function SelectNumPlayers() {
	const { route } = useLocation();
	const [custom, setCustom] = useState<string>("");

	const parsedCustom = useMemo(() => {
		const n = Number.parseInt(custom, 10);
		return Number.isFinite(n) ? n : undefined;
	}, [custom]);

	const canGoCustom = !!parsedCustom && parsedCustom > 0;

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle>Select number of players</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{PRESET_PLAYER_COUNTS.map((n) => (
						<Button key={n} onClick={() => route(`/calc/${n}/setup`)}>
							{n} player{n === 1 ? "" : "s"}
						</Button>
					))}
				</div>

				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="number"
							min={1}
							inputMode="numeric"
							placeholder="Custom players"
							value={custom}
							onInput={(event) => setCustom(event.currentTarget.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && canGoCustom) {
									route(`/calc/${parsedCustom}/setup`);
								}
							}}
						/>
					</div>
					<Button
						type="button"
						disabled={!canGoCustom}
						onClick={() => {
							if (!canGoCustom) return;
							route(`/calc/${parsedCustom}/setup`);
						}}
					>
						Go
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
