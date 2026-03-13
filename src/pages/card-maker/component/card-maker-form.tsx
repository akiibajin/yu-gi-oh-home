import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { YugiohCardDraft, YugiohMonsterStats } from "@/lib/types";
import { splitPendulumDescription } from "@/lib/split-pendulum-description";
import { cardDraftSignal, resetCardDraft } from "@/pages/card-maker/state";
import { useState } from "preact/hooks";
import { exportPreview } from "@/lib/export-card";

import { CardMakerBasicFields } from "./card-maker-form/basic-fields";
import { CardMakerDescriptionFields } from "./card-maker-form/description-fields";
import { CardMakerFormActions } from "./card-maker-form/form-actions";
import { CardMakerImageFields } from "./card-maker-form/image-fields";
import { CardMakerLinkMarkers } from "./card-maker-form/link-markers";
import { CardMakerMonsterBoxColor } from "./card-maker-form/monster-box-color";
import { CardMakerMonsterOptions } from "./card-maker-form/monster-options";
import { CardMakerPendulumEffect } from "./card-maker-form/pendulum-effect";
import type { SetDraftField } from "./card-maker-form/types";

export function CardMakerForm() {
	const draft = cardDraftSignal.value;
	const isMonster = draft.cardType === "Monster";
	const isPendulum =
		isMonster && (draft.monsterType?.includes("Pendulum") ?? false);
	const isLink = isMonster && (draft.monsterType?.includes("Link") ?? false);
	const [saveStatus, setSaveStatus] = useState<string>("");
	const [exporting, setExporting] = useState(false);
	const setDraftField: SetDraftField = <K extends keyof YugiohCardDraft>(
		key: K,
		value: YugiohCardDraft[K],
	) => {
		cardDraftSignal.value = {
			...cardDraftSignal.value,
			[key]: value,
		};
	};

	const setStatsField = <K extends keyof YugiohMonsterStats>(
		key: K,
		value: YugiohMonsterStats[K],
	) => {
		cardDraftSignal.value = {
			...cardDraftSignal.value,
			stats: {
				...cardDraftSignal.value.stats,
				[key]: value,
			},
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

	const handleImageUpload = (file: File | null) => {
		setDraftField("img", file);
	};

	const onExport = async () => {
		setExporting(true);
		setSaveStatus("Exportando...");
		try {
			const res = await exportPreview(draft);
			const shownPath =
				res.dir && res.filename ? `${res.dir}/${res.filename}` : res.path;
			setSaveStatus(`exportado en: ${shownPath}`);
		} catch (err) {
			console.error(err);
			setSaveStatus(
				err instanceof Error ? err.message : "No se pudo exportar.",
			);
		} finally {
			setExporting(false);
		}
	};
	console.log({ draft });
	return (
		<Card className="w-full md:max-h-[85vh] md:overflow-auto min-w-0">
			<CardHeader>
				<CardTitle>Opciones de la carta</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5 min-w-0 **:data-[slot=select-trigger]:max-w-full **:data-[slot=select-trigger]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full">
				<CardMakerBasicFields draft={draft} setDraftField={setDraftField} />
				<CardMakerImageFields
					draft={draft}
					setDraftField={setDraftField}
					onImageUpload={handleImageUpload}
				/>
				{isMonster ? (
					<CardMakerMonsterOptions
						draft={draft}
						isPendulum={isPendulum}
						isLink={isLink}
						setDraftField={setDraftField}
						setStatsField={setStatsField}
					/>
				) : null}

				{isMonster && isLink ? (
					<CardMakerLinkMarkers draft={draft} setDraftField={setDraftField} />
				) : null}
				{isPendulum ? (
					<CardMakerPendulumEffect
						value={draft.pendulumDescription ?? ""}
						onInput={onPendulumEffectInput}
					/>
				) : null}
				{isMonster ? (
					<CardMakerMonsterBoxColor
						value={draft.descriptionStatsBoxColor}
						onValueChange={(value) =>
							setDraftField("descriptionStatsBoxColor", value)
						}
					/>
				) : null}
				<CardMakerDescriptionFields
					showDescription={draft.showDescription ?? true}
					onShowDescriptionChange={(checked) =>
						setDraftField("showDescription", checked)
					}
					descriptionImageOpacity={draft.descriptionImageOpacity}
					onDescriptionImageOpacityChange={(value) =>
						setDraftField("descriptionImageOpacity", value)
					}
					descriptionTextColor={draft.descriptionTextColor ?? "auto"}
					onDescriptionTextColorChange={(value) =>
						setDraftField("descriptionTextColor", value)
					}
					descriptionTextSize={draft.descriptionTextSize ?? "normal"}
					onDescriptionTextSizeChange={(value) =>
						setDraftField("descriptionTextSize", value)
					}
					label={isPendulum ? "Efecto de monstruo" : "Descripción"}
					value={draft.description}
					onInput={onMonsterEffectInput}
					placeholder={
						isPendulum
							? "Texto del efecto del monstruo..."
							: "Texto del efecto de la carta..."
					}
				/>

				<CardMakerFormActions
					onReset={resetCardDraft}
					onExport={onExport}
					exporting={exporting}
					saveStatus={saveStatus}
				/>
			</CardContent>
		</Card>
	);
}
