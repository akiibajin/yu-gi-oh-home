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
} from "@/lib/constants";
import type {
	LinkMarker,
	MonsterType,
	YugiohCardAttribute,
	YugiohCardDraft,
	YugiohCardType,
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

	const applySplitIfPresent = (value: string) => {
		if (!isPendulum) return false;
		const split = splitPendulumDescription(value);
		if (!split.didSplit) return false;
		setDraftField("pendulumDescription", split.pendulumDescription);
		setDraftField("description", split.monsterDescription);
		return true;
	};

	const onPendulumEffectInput = (value: string) => {
		if (applySplitIfPresent(value)) return;
		setDraftField("pendulumDescription", value);
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
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Card Options</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="cm-image">
						Image
					</label>
					<div className="flex items-center gap-2">
						<Input
							id="cm-image"
							type="file"
							accept="image/*"
							onChange={(e) => {
								const file = e.currentTarget.files?.[0] ?? null;
								handleImageUpload(file);
							}}
						/>

						<Button
							type="button"
							variant="frame"
							onClick={() => handleImageUpload(null)}
							disabled={!draft.img}
						>
							Clear
						</Button>
					</div>
					{draft.img ? (
						<div className="text-xs text-muted-foreground">
							Selected:{" "}
							{"name" in draft.img ? (draft.img as File).name : "image"}
						</div>
					) : null}
				</div>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
					<div className="min-w-0 flex-1 space-y-2">
						<label className="text-sm font-medium" htmlFor="cm-name">
							Name
						</label>
						<Input
							id="cm-name"
							value={draft.name}
							onInput={(e) => setDraftField("name", e.currentTarget.value)}
							placeholder="Dark Magician"
						/>
					</div>

					<div className="w-full space-y-2 sm:w-44">
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
				</div>
				{!isFieldSpell && !isMonster ? (
					<Select
						value={
							draft.cardType === "Spell" ? draft.spellType : draft.trapType
						}
						onValueChange={(value: string) =>
							setDraftField(
								draft.cardType === "Spell" ? "spellType" : "trapType",
								value as YugiohSpellType | YugiohTrapType,
							)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select Spell/Trap Type" />
						</SelectTrigger>
						<SelectContent>
							{draft.cardType === "Spell"
								? SPELL_TYPES.map((t) => (
										<SelectItem key={t} value={t}>
											<img src={SPELL_ICONS[t]} alt={t} className="size-4" />
											{t}
										</SelectItem>
									))
								: TRAP_TYPES.map((t) => (
										<SelectItem key={t} value={t}>
											<img src={TRAP_ICONS[t]} alt={t} className="size-4" />
											{t}
										</SelectItem>
									))}
						</SelectContent>
					</Select>
				) : null}
				{isMonster ? (
					<fieldset className="space-y-4 rounded-md border p-4">
						<legend className="px-1 text-sm font-medium">
							Monster Options
						</legend>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<div className="space-y-2 flex items-end gap-2">
								<label
									className="text-sm font-medium m-0"
									htmlFor="cm-is-tuner"
								>
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
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							{!isLink ? (
								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="cm-level">
										Stars (Level)
									</label>
									<Input
										id="cm-level"
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

							<div className="space-y-2">
								<label className="text-sm font-medium" htmlFor="cm-atk">
									ATK
								</label>
								<Input
									id="cm-atk"
									type="number"
									min={0}
									max={YUGIOH_MAX_STAT}
									value={String(draft.stats.atk)}
									onInput={(e) => {
										const parsed = Number.parseInt(e.currentTarget.value, 10);
										cardDraftSignal.value = {
											...cardDraftSignal.value,
											stats: {
												...cardDraftSignal.value.stats,
												atk: Number.isFinite(parsed)
													? clampInt(parsed, 0, YUGIOH_MAX_STAT)
													: 0,
											},
										};
									}}
								/>
							</div>

							{!isLink ? (
								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="cm-def">
										DEF
									</label>
									<Input
										id="cm-def"
										type="number"
										min={0}
										max={YUGIOH_MAX_STAT}
										value={String(draft.stats.def)}
										onInput={(e) => {
											const parsed = Number.parseInt(e.currentTarget.value, 10);
											cardDraftSignal.value = {
												...cardDraftSignal.value,
												stats: {
													...cardDraftSignal.value.stats,
													def: Number.isFinite(parsed)
														? clampInt(parsed, 0, YUGIOH_MAX_STAT)
														: 0,
												},
											};
										}}
									/>
								</div>
							) : null}
						</div>
					</fieldset>
				) : null}

				{isMonster && isLink ? (
					<fieldset className="space-y-4 rounded-md border p-4">
						<legend className="px-1 text-sm font-medium">Link Markers</legend>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<label className="text-sm font-medium" htmlFor="cm-link-rating">
									Link Rating
								</label>
								<Input
									id="cm-link-rating"
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

						<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
					<div className="space-y-2">
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

				<div className="space-y-2">
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

				<div className="flex items-center justify-end gap-2">
					<Button type="button" variant="frame" onClick={resetCardDraft}>
						Reset
					</Button>
					<Button type="button" onClick={onExport} disabled={exporting}>
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
