import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Input } from "@/components/ui/warcraftcn/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocation, useRoute } from "preact-iso";
import { useEffect, useMemo, useState } from "preact/hooks";
import { PLAYERS_NAMES } from "@/lib/avatars";

function defaultNames(count: number) {
	return Array.from({ length: count }, (_, index) => {
		return PLAYERS_NAMES[index % PLAYERS_NAMES.length] ?? `Player ${index + 1}`;
	});
}

function buildCalcUrl(count: number, names: string[]) {
	const params = new URLSearchParams();
	for (const name of names) params.append("p", name.trim());
	return `/calc/${count}?${params.toString()}`;
}

function firstAvailablePresetName(taken: Set<string>, fallback: string) {
	return PLAYERS_NAMES.find((n) => !taken.has(n)) ?? fallback;
}

function normalizeNames(names: string[]) {
	return names.map((n) => n.trim()).filter(Boolean);
}

function CalcSetup() {
	const { route } = useLocation();
	const { params } = useRoute();
	const numRaw = (params as Record<string, string | undefined>).num;
	const num = numRaw ? Number.parseInt(numRaw, 10) : NaN;

	const isValidNum = Number.isFinite(num) && num > 0;
	const initial = useMemo(
		() => (isValidNum ? defaultNames(num) : []),
		[isValidNum, num],
	);
	const [names, setNames] = useState<string[]>(initial);
	const [useCustom, setUseCustom] = useState<boolean[]>(
		Array.from({ length: initial.length }, () => false),
	);

	useEffect(() => {
		setNames(initial);
		setUseCustom(Array.from({ length: initial.length }, () => false));
	}, [initial]);

	const normalized = useMemo(() => normalizeNames(names), [names]);
	const hasAllNames = isValidNum && normalized.length >= num;
	const isUnique = useMemo(() => {
		if (!hasAllNames) return false;
		return new Set(normalized).size === normalized.length;
	}, [hasAllNames, normalized]);
	const canStart = hasAllNames && isUnique;

	if (!isValidNum) {
		return (
			<div className="mx-auto w-full max-w-lg">
				<Card>
					<CardHeader>
						<CardTitle>Setup</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm">Invalid player count.</div>
						<div className="mt-4">
							<Button type="button" variant="frame" onClick={() => route("/")}>
								Back
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-lg">
			<Card>
				<CardHeader>
					<CardTitle>Choose players</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						{Array.from({ length: num }, (_, index) => {
							const current = names[index] ?? "";
							const currentTrimmed = current.trim();
							const isCustom = useCustom[index] ?? false;
							const takenTrimmed = new Set(
								names
									.filter((_, i) => i !== index)
									.map((n) => n.trim())
									.filter(Boolean),
							);
							const isDuplicate =
								!!currentTrimmed && takenTrimmed.has(currentTrimmed);

							return (
								<div key={String(index)} className="flex items-center gap-3">
									<div className="w-20 text-sm text-muted-foreground">
										P{index + 1}
									</div>
									<div className="flex flex-1 items-center gap-2">
										{isCustom ? (
											<Input
												className={
													isDuplicate ? "border-destructive" : undefined
												}
												placeholder="Custom name"
												value={current}
												onInput={(event) => {
													const value = event.currentTarget.value;
													setNames((prev) => {
														const next = [...prev];
														next[index] = value;
														return next;
													});
												}}
											/>
										) : (
											<Select
												value={current}
												onValueChange={(value: string) => {
													setNames((prev) => {
														const next = [...prev];
														next[index] = value;
														return next;
													});
												}}
											>
												<SelectTrigger className="w-full flex-1">
													<SelectValue placeholder="Select" />
												</SelectTrigger>
												<SelectContent>
													{PLAYERS_NAMES.map((name) => (
														<SelectItem
															key={name}
															value={name}
															disabled={
																takenTrimmed.has(name) &&
																name !== currentTrimmed
															}
														>
															{name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}

										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-xs">
												Custom
											</span>
											<Switch
												checked={isCustom}
												aria-label={`Use custom name for player ${index + 1}`}
												onCheckedChange={(checked: boolean) => {
													setUseCustom((prev) => {
														const next = [...prev];
														next[index] = checked;
														return next;
													});

													if (!checked) {
														setNames((prev) => {
															const next = [...prev];
															const taken = new Set(
																next
																	.filter((_, i) => i !== index)
																	.map((n) => n.trim())
																	.filter(Boolean),
															);
															next[index] = firstAvailablePresetName(
																taken,
																`Player ${index + 1}`,
															);
															return next;
														});
													}
												}}
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{!isUnique && hasAllNames ? (
						<div className="text-destructive text-sm">
							Names must be unique.
						</div>
					) : null}

					<div className="flex items-center justify-between gap-2">
						<Button type="button" variant="frame" onClick={() => route("/")}>
							Back
						</Button>
						<Button
							type="button"
							disabled={!canStart}
							onClick={() => {
								if (!canStart) return;
								route(buildCalcUrl(num, names));
							}}
						>
							Start
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default CalcSetup;
