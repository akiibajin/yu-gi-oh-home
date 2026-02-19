import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Input } from "@/components/ui/warcraftcn/input";
import { Textarea } from "@/components/ui/warcraftcn/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	YUGIOH_ATTRIBUTES,
	YUGIOH_CARD_TYPES,
	YUGIOH_MAX_STAT,
	YUGIOH_MAX_STARS,
	YUGIOH_MONSTER_TYPES,
	SPELL_TYPES,
	TRAP_TYPES,
	MONSTER_TYPES,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_DESCRIPTION_STATS_BOX_COLORS,
} from "@/lib/constants";
import type {
	LinkMarker,
	MonsterType,
	YugiohCardAttribute,
	YugiohCardDraft,
	YugiohCardType,
	YugiohDescriptionStatsBoxColor,
	YugiohMonsterType,
	YugiohSpellType,
	YugiohTrapType,
} from "@/lib/types";
import { splitPendulumDescription } from "@/lib/split-pendulum-description";
import { cardDraftSignal, resetCardDraft } from "@/pages/card-maker/state";
import { Switch } from "@/components/ui/switch";
// import { storeYugiohCardDraft } from "@/lib/tauri/store-card";
import { useState } from "preact/hooks";
import { exportPreview } from "@/lib/export-card";

function clampInt(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, Math.trunc(value)));
}

function parseBattleStatInput(
	value: string,
	currentValue: number | string,
): number | string {
	const trimmed = value.trim();
	if (!trimmed) return 0;
	if (trimmed === "?") return "?";
	if (trimmed === "∞") return "∞";
	if (/^x\d+$/i.test(trimmed)) {
		return `x${trimmed.slice(1)}`;
	}
	if (/^\d+$/.test(trimmed)) {
		return clampInt(Number.parseInt(trimmed, 10), 0, YUGIOH_MAX_STAT);
	}
	return currentValue;
}

export function CardMakerForm() {
	const draft = cardDraftSignal.value;
	const isMonster = draft.cardType === "Monster";
	const isFieldSpell = draft.cardType === "Field";
	const isPendulum = isMonster && draft.monsterType?.includes("Pendulum");
	const isLink = isMonster && draft.monsterType?.includes("Link");
	const [saveStatus, setSaveStatus] = useState<string>("");
	// const [saving, setSaving] = useState(false);
	const [exporting, setExporting] = useState(false);
	const setDraftField = <K extends keyof YugiohCardDraft>(
		key: K,
		value: YugiohCardDraft[K],
	) => {
		cardDraftSignal.value = {
			...cardDraftSignal.value,
			[key]: value,
		};
	};
	const onPendulumEffectInput = (value: string) => {
		setDraftField("pendulumDescription", value);
		const currentDescription = draft.description;
		if (!currentDescription) return;
		const split = splitPendulumDescription(currentDescription);
		if (!split.didSplit) return;
		setDraftField("description", split.monsterDescription);
	};

	const applySplitIfPresent = (value: string) => {
		if (!isPendulum) return false;
		const split = splitPendulumDescription(value);
		if (!split.didSplit) return false;
		setDraftField("pendulumDescription", split.pendulumDescription);
		setDraftField("description", split.monsterDescription);
		return true;
	};

	const onMonsterEffectInput = (value: string) => {
		if (applySplitIfPresent(value)) return;
		setDraftField("description", value);
	};

	const LINK_MARKERS: LinkMarker[] = [
		"Top-left",
		"Top",
		"Top-right",
		"Left",
		"Right",
		"Bottom-left",
		"Bottom",
		"Bottom-right",
	];

	const toggleLinkMarker = (marker: LinkMarker, checked: boolean) => {
		const current = new Set<LinkMarker>(draft.linkMarkers ?? []);
		if (checked) current.add(marker);
		else current.delete(marker);
		setDraftField("linkMarkers", Array.from(current));
	};

	const handleImageUpload = (file: File | null) => {
		setDraftField("img", file);
	};

	// const saveToDb = async () => {
	// 	if (!draft.name.trim()) {
	// 		setSaveStatus("Add a name before saving.");
	// 		return;
	// 	}

	// 	setSaving(true);
	// 	setSaveStatus("Saving...");
	// 	try {
	// 		// user is optional; omit for now
	// 		const res = await storeYugiohCardDraft(draft);
	// 		if (!res) {
	// 			setSaveStatus("Save only works in Tauri (not web mode).");
	// 			return;
	// 		}
	// 		setSaveStatus(`Saved (id: ${res.id}).`);
	// 	} catch (err) {
	// 		setSaveStatus(err instanceof Error ? err.message : "Failed to save.");
	// 	} finally {
	// 		setSaving(false);
	// 	}
	// };

	const onExport = async () => {
		setExporting(true);
		setSaveStatus("Exporting...");
		try {
			const res = await exportPreview(draft);
			const shownPath =
				res.dir && res.filename ? `${res.dir}/${res.filename}` : res.path;
			setSaveStatus(`exported to: ${shownPath}`);
		} catch (err) {
			console.error(err);
			setSaveStatus(err instanceof Error ? err.message : "Failed to export.");
		} finally {
			setExporting(false);
		}
	};
	return (
		<Card className="w-full min-w-0">
			<CardHeader>
				<CardTitle>Card Options</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5 min-w-0 **:data-[slot=select-trigger]:max-w-full **:data-[slot=select-trigger]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full">
				<div className="space-y-4 rounded-md border p-3 sm:p-4">
					<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
						<div className="space-y-2 min-w-0">
							<label className="text-sm font-medium" htmlFor="cm-name">
								Name
							</label>
							<Input
								id="cm-name"
								className="w-full"
								value={draft.name}
								onInput={(e) => setDraftField("name", e.currentTarget.value)}
								placeholder="Dark Magician"
							/>
						</div>

						<div className="space-y-2 min-w-0">
							<label className="text-sm font-medium" htmlFor="cm-card-type">
								Card Type
							</label>
							<Select
								value={draft.cardType}
								onValueChange={(value: string) =>
									setDraftField("cardType", value as YugiohCardType)
								}
							>
								<SelectTrigger id="cm-card-type" className="w-full">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									{YUGIOH_CARD_TYPES.map((t) => (
										<SelectItem key={t} value={t}>
											{t}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{!isFieldSpell && !isMonster ? (
							<div className="space-y-2 min-w-0 md:col-span-2">
								<label
									className="text-sm font-medium"
									htmlFor="cm-spell-trap-type"
								>
									Spell/Trap Type
								</label>
								<Select
									value={
										draft.cardType === "Spell"
											? draft.spellType
											: draft.trapType
									}
									onValueChange={(value: string) =>
										setDraftField(
											draft.cardType === "Spell" ? "spellType" : "trapType",
											value as YugiohSpellType | YugiohTrapType,
										)
									}
								>
									<SelectTrigger id="cm-spell-trap-type" className="w-full">
										<SelectValue placeholder="Select Spell/Trap Type" />
									</SelectTrigger>
									<SelectContent>
										{draft.cardType === "Spell"
											? SPELL_TYPES.map((t) => (
													<SelectItem key={t} value={t}>
														<img
															src={SPELL_ICONS[t]}
															alt={t}
															className="size-4"
														/>
														{t}
													</SelectItem>
												))
											: TRAP_TYPES.map((t) => (
													<SelectItem key={t} value={t}>
														<img
															src={TRAP_ICONS[t]}
															alt={t}
															className="size-4"
														/>
														{t}
													</SelectItem>
												))}
									</SelectContent>
								</Select>
							</div>
						) : null}
					</div>
				</div>

				<div className="space-y-3 rounded-md border p-3 sm:p-4">
					<label className="text-sm font-medium" htmlFor="cm-image">
						Card Image
					</label>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center *:min-w-0">
						<Input
							id="cm-image"
							type="file"
							className="w-full max-w-full"
							accept="image/*"
							onChange={(e) => {
								const file = e.currentTarget.files?.[0] ?? null;
								handleImageUpload(file);
							}}
						/>
						<div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_minmax(10rem,1fr)]">
							<Button
								type="button"
								variant="frame"
								onClick={() => handleImageUpload(null)}
								disabled={!draft.img}
							>
								Clear
							</Button>
							<Select
								value={draft.objectFit}
								onValueChange={(value: string) =>
									setDraftField(
										"objectFit",
										value as
											| "cover"
											| "contain"
											| "fill"
											| "none"
											| "scale-down",
									)
								}
							>
								<SelectTrigger className="h-8 w-full">
									<SelectValue placeholder="Object Fit" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="contain">Contain</SelectItem>
									<SelectItem value="cover">Cover</SelectItem>
									<SelectItem value="fill">Fill</SelectItem>
									<SelectItem value="scale-down">Scale-down</SelectItem>
									<SelectItem value="none">None</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					{draft.img ? (
						<div className="text-xs text-muted-foreground">
							Selected:{" "}
							{typeof draft.img === "object" && "name" in draft.img
								? (draft.img as File).name
								: "image"}
						</div>
					) : null}
				</div>
				{isMonster ? (
					<fieldset className="space-y-4 rounded-md border p-3 sm:p-4">
						<legend className="px-1 text-sm font-medium">
							Monster Options
						</legend>

						<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
							<div className="space-y-2 min-w-0">
								<label className="text-sm font-medium" htmlFor="cm-attribute">
									Attribute
								</label>
								<Select
									value={draft.attribute}
									onValueChange={(value: string) =>
										setDraftField("attribute", value as YugiohCardAttribute)
									}
								>
									<SelectTrigger id="cm-attribute" className="w-full">
										<SelectValue placeholder="Select an attribute" />
									</SelectTrigger>
									<SelectContent>
										{YUGIOH_ATTRIBUTES.map((a) => (
											<SelectItem key={a.title} value={a.title}>
												<img className="size-4" src={a.img} alt={a.title} />
												{a.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2 min-w-0">
								<label
									className="text-sm font-medium"
									htmlFor="cm-monster-type"
								>
									Monster Type
								</label>
								<Select
									value={draft.monsterType}
									onValueChange={(value: string) =>
										setDraftField("monsterType", value as YugiohMonsterType)
									}
								>
									<SelectTrigger id="cm-monster-type" className="w-full">
										<SelectValue placeholder="Select a type" />
									</SelectTrigger>
									<SelectContent>
										{YUGIOH_MONSTER_TYPES.map((t) => (
											<SelectItem key={t} value={t}>
												{t}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2 min-w-0">
								<label className="text-sm font-medium" htmlFor="cm-sub-type">
									Type
								</label>
								<Select
									value={draft.subType}
									onValueChange={(value: string) =>
										setDraftField("subType", value as MonsterType)
									}
								>
									<SelectTrigger id="cm-sub-type" className="w-full">
										<SelectValue placeholder="Select an attribute" />
									</SelectTrigger>
									<SelectContent>
										{MONSTER_TYPES.map((a) => (
											<SelectItem key={a.title} value={a.title}>
												<img className="size-4" src={a.img} alt={a.title} />
												{a.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-3 min-w-0">
								<div className="flex items-center justify-between rounded-md border px-3 py-2">
									<label className="text-sm font-medium" htmlFor="cm-is-tuner">
										Is Tuner?
									</label>
									<Switch
										id="cm-is-tuner"
										type="checkbox"
										checked={draft.isTuner}
										onCheckedChange={(checked: boolean) =>
											setDraftField("isTuner", checked)
										}
									/>
								</div>
								{isPendulum ? (
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="cm-scale">
											Pendulum Scale
										</label>
										<Input
											id="cm-scale"
											className="w-full"
											type="number"
											min={0}
											max={13}
											value={String(draft.scale ?? 0)}
											onInput={(e) => {
												const parsed = Number.parseInt(
													e.currentTarget.value,
													10,
												);
												const next = Number.isFinite(parsed)
													? clampInt(parsed, 0, 13)
													: 0;
												setDraftField("scale", next);
											}}
										/>
									</div>
								) : null}
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 *:min-w-0">
							{!isLink ? (
								<div className="space-y-2 min-w-0">
									<label className="text-sm font-medium" htmlFor="cm-level">
										Stars (Level)
									</label>
									<Input
										id="cm-level"
										className="w-full"
										type="number"
										min={1}
										max={YUGIOH_MAX_STARS}
										value={String(draft.stats.level)}
										onInput={(e) => {
											const parsed = Number.parseInt(e.currentTarget.value, 10);
											cardDraftSignal.value = {
												...cardDraftSignal.value,
												stats: {
													...cardDraftSignal.value.stats,
													level: Number.isFinite(parsed)
														? clampInt(parsed, 1, YUGIOH_MAX_STARS)
														: 1,
												},
											};
										}}
									/>
								</div>
							) : null}

							<div className="space-y-2 min-w-0">
								<label className="text-sm font-medium" htmlFor="cm-atk">
									ATK
								</label>
								<Input
									id="cm-atk"
									className="w-full"
									type="text"
									value={String(draft.stats.atk)}
									onInput={(e) => {
										const parsed = parseBattleStatInput(
											e.currentTarget.value,
											cardDraftSignal.value.stats.atk,
										);
										cardDraftSignal.value = {
											...cardDraftSignal.value,
											stats: {
												...cardDraftSignal.value.stats,
												atk: parsed,
											},
										};
									}}
									placeholder="0, ?, ∞, x0000"
								/>
							</div>

							{!isLink ? (
								<div className="space-y-2 min-w-0">
									<label className="text-sm font-medium" htmlFor="cm-def">
										DEF
									</label>
									<Input
										id="cm-def"
										className="w-full"
										type="text"
										value={String(draft.stats.def)}
										onInput={(e) => {
											const parsed = parseBattleStatInput(
												e.currentTarget.value,
												cardDraftSignal.value.stats.def,
											);
											cardDraftSignal.value = {
												...cardDraftSignal.value,
												stats: {
													...cardDraftSignal.value.stats,
													def: parsed,
												},
											};
										}}
										placeholder="0, ?, ∞, x0000"
									/>
								</div>
							) : null}
						</div>
					</fieldset>
				) : null}

				{isMonster && isLink ? (
					<fieldset className="space-y-4 rounded-md border p-3 sm:p-4">
						<legend className="px-1 text-sm font-medium">Link Markers</legend>
						<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
							<div className="space-y-2 min-w-0">
								<label className="text-sm font-medium" htmlFor="cm-link-rating">
									Link Rating
								</label>
								<Input
									id="cm-link-rating"
									className="w-full"
									type="number"
									min={1}
									max={8}
									value={String(draft.linkRating ?? 1)}
									onInput={(e) => {
										const parsed = Number.parseInt(e.currentTarget.value, 10);
										const next = Number.isFinite(parsed)
											? clampInt(parsed, 1, 8)
											: 1;
										setDraftField("linkRating", next);
									}}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{LINK_MARKERS.map((marker) => {
								const checked = (draft.linkMarkers ?? []).includes(marker);
								return (
									<div key={marker} className="flex items-center gap-2">
										<Switch
											checked={checked}
											onCheckedChange={(v: boolean) =>
												toggleLinkMarker(marker, v)
											}
										/>
										<span className="text-sm">{marker}</span>
									</div>
								);
							})}
						</div>
					</fieldset>
				) : null}
				{isPendulum ? (
					<div className="space-y-2 rounded-md border p-3 sm:p-4">
						<label
							className="text-sm font-medium"
							htmlFor="cm-pendulum-description"
						>
							Pendulum Effect
						</label>
						<Textarea
							id="cm-pendulum-description"
							value={draft.pendulumDescription ?? ""}
							onInput={(e) => onPendulumEffectInput(e.currentTarget.value)}
							placeholder="Pendulum effect text..."
							rows={4}
						/>
					</div>
				) : null}
				{isMonster ? (
					<div className="space-y-2 rounded-md border p-3 sm:p-4">
						<label className="text-sm font-medium" htmlFor="cm-box-color">
							Description/Stats Box Color
						</label>
						<Select
							value={draft.descriptionStatsBoxColor ?? "auto"}
							onValueChange={(value: string) =>
								setDraftField(
									"descriptionStatsBoxColor",
									value as YugiohDescriptionStatsBoxColor,
								)
							}
						>
							<SelectTrigger id="cm-box-color" className="w-full">
								<SelectValue placeholder="Select box color" />
							</SelectTrigger>
							<SelectContent>
								{YUGIOH_DESCRIPTION_STATS_BOX_COLORS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				) : null}
				<div className="space-y-2 rounded-md border p-3 sm:p-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<label
							className="text-sm font-medium"
							htmlFor="cm-show-description"
						>
							Show Description in Preview
						</label>
						<Switch
							id="cm-show-description"
							checked={draft.showDescription ?? true}
							onCheckedChange={(checked: boolean) =>
								setDraftField("showDescription", checked)
							}
						/>
					</div>
					<label className="text-sm font-medium" htmlFor="cm-description">
						{isPendulum ? "Monster Effect" : "Description"}
					</label>
					<Textarea
						id="cm-description"
						value={draft.description}
						onInput={(e) => onMonsterEffectInput(e.currentTarget.value)}
						placeholder={
							isPendulum ? "Monster effect text..." : "Card effect text..."
						}
						rows={5}
					/>
				</div>

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="frame"
						onClick={resetCardDraft}
						className="w-full sm:w-auto"
					>
						Reset
					</Button>
					<Button
						type="button"
						onClick={onExport}
						disabled={exporting}
						className="w-full sm:w-auto"
					>
						{exporting ? "Exporting..." : "Export"}
					</Button>
				</div>

				{saveStatus ? (
					<div className="text-sm text-muted-foreground">{saveStatus}</div>
				) : null}
			</CardContent>
		</Card>
	);
}
