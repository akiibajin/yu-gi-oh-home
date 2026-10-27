import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { YugiohCardDraft, YugiohMonsterStats } from "@/lib/types";
import { splitPendulumDescription } from "@/lib/split-pendulum-description";
import { cardDraftSignal, resetCardDraft } from "@/pages/card-maker/state";
import { useState } from "preact/hooks";
import { exportPreview } from "@/lib/export-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CardMakerBasicFields } from "./card-maker-form/basic-fields";
import { CardMakerDescriptionFields } from "./card-maker-form/description-fields";
import { CardMakerFormActions } from "./card-maker-form/form-actions";
import { CardMakerImageFields } from "./card-maker-form/image-fields";
import { CardMakerLinkMarkers } from "./card-maker-form/link-markers";
import { CardMakerMonsterBoxColor } from "./card-maker-form/monster-box-color";
import { CardMakerMonsterOptions } from "./card-maker-form/monster-options";
import { CardMakerPendulumEffect } from "./card-maker-form/pendulum-effect";
import type { SetDraftField } from "./card-maker-form/types";

export type CardMakerFormExportOptions = {
	id: string;
	folderName?: string;
};

export function CardMakerForm(
	props: {
		onReset?: () => void;
		exportOptions?: CardMakerFormExportOptions | null;
	} = {},
) {
	const { onReset, exportOptions } = props;
	const draft = cardDraftSignal.value;
	const isMonster = draft.cardType === "Monster";
	const isPendulum =
		isMonster && (draft.monsterType?.includes("Pendulum") ?? false);
	const isLink = isMonster && (draft.monsterType?.includes("Link") ?? false);
	const [saveStatus, setSaveStatus] = useState<string>("");
	const [exporting, setExporting] = useState(false);
	const [open, setOpen] = useState({
		plantilla: false,
		basicos: false,
		imagen: true,
		monstruo: false,
		link: false,
		pendulo: false,
		recuadro: false,
		descripcion: false,
		formato: false,
	});
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

	const handleOverframeImageUpload = (file: File | null) => {
		setDraftField("overframeImg", file);
	};

	const onExport = async () => {
		setExporting(true);
		setSaveStatus("Exportando...");
		try {
			const res = await exportPreview(draft, exportOptions ?? undefined);
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
	return (
		<Card className="w-full md:max-h-[85vh] md:overflow-auto min-w-0">
			<CardHeader>
				<CardTitle>Opciones de la carta</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 min-w-0 **:data-[slot=select-trigger]:max-w-full **:data-[slot=select-trigger]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full">
				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, plantilla: !o.plantilla }))}
					>
						Plantilla
						<span>{open.plantilla ? "−" : "+"}</span>
					</button>
					{open.plantilla ? (
						<div className="flex items-center justify-between border-t p-2 sm:p-3">
							<label className="text-sm" htmlFor="cm-secondary-template">
								Plantilla alternativa
							</label>
							<Switch
								id="cm-secondary-template"
								checked={draft.template === "secondary"}
								onCheckedChange={(checked: boolean) =>
									setDraftField("template", checked ? "secondary" : "primary")
								}
							/>
						</div>
					) : null}
				</div>

				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, basicos: !o.basicos }))}
					>
						Básicos
						<span>{open.basicos ? "−" : "+"}</span>
					</button>
					{open.basicos ? (
						<div className="border-t p-2">
							<CardMakerBasicFields draft={draft} setDraftField={setDraftField} isSecondaryTemplate={draft.template === "secondary"} />
						</div>
					) : null}
				</div>

				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, imagen: !o.imagen }))}
					>
						Imagen
						<span>{open.imagen ? "−" : "+"}</span>
					</button>
					{open.imagen ? (
						<div className="border-t p-2">
							<CardMakerImageFields
								draft={draft}
								setDraftField={setDraftField}
								onImageUpload={handleImageUpload}
								onOverframeImageUpload={handleOverframeImageUpload}
								isSecondaryTemplate={draft.template === "secondary"}
							/>
						</div>
					) : null}
				</div>

				{isMonster ? (
					<div className="rounded-md border">
						<button
							type="button"
							className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
							onClick={() => setOpen((o) => ({ ...o, monstruo: !o.monstruo }))}
						>
							Monstruo
							<span>{open.monstruo ? "−" : "+"}</span>
						</button>
						{open.monstruo ? (
							<div className="border-t p-2">
								<CardMakerMonsterOptions
									draft={draft}
									isPendulum={isPendulum}
									isLink={isLink}
									setDraftField={setDraftField}
									setStatsField={setStatsField}
								/>
							</div>
						) : null}
					</div>
				) : null}

				{isMonster && isLink ? (
					<div className="rounded-md border">
						<button
							type="button"
							className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
							onClick={() => setOpen((o) => ({ ...o, link: !o.link }))}
						>
							Link
							<span>{open.link ? "−" : "+"}</span>
						</button>
						{open.link ? (
							<div className="border-t p-2">
								<CardMakerLinkMarkers draft={draft} setDraftField={setDraftField} />
							</div>
						) : null}
					</div>
				) : null}

				{isPendulum ? (
					<div className="rounded-md border">
						<button
							type="button"
							className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
							onClick={() => setOpen((o) => ({ ...o, pendulo: !o.pendulo }))}
						>
							Péndulo
							<span>{open.pendulo ? "−" : "+"}</span>
						</button>
						{open.pendulo ? (
							<div className="border-t p-2">
								<CardMakerPendulumEffect
									value={draft.pendulumDescription ?? ""}
									onInput={onPendulumEffectInput}
								/>
							</div>
						) : null}
					</div>
				) : null}

				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, recuadro: !o.recuadro }))}
					>
						Recuadro
						<span>{open.recuadro ? "−" : "+"}</span>
					</button>
					{open.recuadro ? (
						<div className="border-t p-2">
							<CardMakerMonsterBoxColor
								value={draft.descriptionStatsBoxColor}
								isSecondaryTemplate={draft.template === "secondary"}
								onValueChange={(value) =>
									setDraftField("descriptionStatsBoxColor", value)
								}
							/>
						</div>
					) : null}
				</div>

				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, descripcion: !o.descripcion }))}
					>
						Descripción
						<span>{open.descripcion ? "−" : "+"}</span>
					</button>
					{open.descripcion ? (
						<div className="border-t p-2">
							<CardMakerDescriptionFields
								showDescription={draft.showDescription ?? true}
								isSecondaryTemplate={draft.template === "secondary"}
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
						</div>
					) : null}
				</div>

				<div className="rounded-md border">
					<button
						type="button"
						className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
						onClick={() => setOpen((o) => ({ ...o, formato: !o.formato }))}
					>
						Formato
						<span>{open.formato ? "−" : "+"}</span>
					</button>
					{open.formato ? (
						<div className="border-t p-2 space-y-1.5">
							<label className="text-sm font-medium" htmlFor="cm-export-format">
								Formato de exportación
							</label>
							<Select
								value={draft.exportFormat ?? "webp"}
								onValueChange={(value: string) => {
									setDraftField("exportFormat", value as "webp" | "png" | "jpg");
								}}
							>
								<SelectTrigger id="cm-export-format" className="w-full">
									<SelectValue placeholder="Selecciona un formato" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="webp">WebP</SelectItem>
									<SelectItem value="png">PNG</SelectItem>
									<SelectItem value="jpg">JPG</SelectItem>
								</SelectContent>
							</Select>
						</div>
					) : null}
				</div>

				<CardMakerFormActions
					onReset={onReset ?? resetCardDraft}
					onExport={onExport}
					exporting={exporting}
					saveStatus={saveStatus}
				/>
			</CardContent>
		</Card>
	);
}
