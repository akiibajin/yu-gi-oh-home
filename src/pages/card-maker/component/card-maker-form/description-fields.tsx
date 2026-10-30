import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	YugiohDescriptionTextColor,
	YugiohDescriptionTextSize,
} from "@/lib/types";
import { Label } from "@/components/ui/warcraftcn/label";
import { YUGIOH_DESCRIPTION_STATS_BOX_COLORS } from "@/lib/constants";
import type { YugiohDescriptionStatsBoxColor } from "@/lib/types";

const BOX_COLOR_LABELS: Partial<
	Record<YugiohDescriptionStatsBoxColor | "auto" | "void", string>
> = {
	auto: "Automático (según tipo de carta)",
	void: "Vacío (oculta imágenes del recuadro)",
	"void-inverse": "Vacío inverso (letras negras, contorno blanco)",
	Normal: "Normal (naranja)",
	Effect: "Efecto (marrón)",
	Ritual: "Ritual (azul)",
	Fusion: "Fusión (morado)",
	Synchro: "Sincronía (blanco)",
	Xyz: "Xyz (negro)",
	Link: "Enlace (azul)",
	Trap: "Trampa (rosa)",
};

export function CardMakerDescriptionFields(props: {
	showDescription: boolean;
	onShowDescriptionChange: (checked: boolean) => void;
	descriptionImageOpacity: number | undefined;
	onDescriptionImageOpacityChange: (value: number | undefined) => void;
	descriptionTextColor?: YugiohDescriptionTextColor;
	onDescriptionTextColorChange: (value: YugiohDescriptionTextColor) => void;
	descriptionTextSize?: YugiohDescriptionTextSize;
	onDescriptionTextSizeChange: (value: YugiohDescriptionTextSize) => void;
	label: string;
	value: string;
	onInput: (value: string) => void;
  placeholder: string;
  isSecondaryTemplate: boolean;
  descriptionType: YugiohDescriptionStatsBoxColor;
  onDescriptionTypeChange: (value: YugiohDescriptionStatsBoxColor) => void;
}) {
	const {
		showDescription,
		onShowDescriptionChange,
		descriptionImageOpacity,
		onDescriptionImageOpacityChange,
		descriptionTextColor,
		onDescriptionTextColorChange,
		descriptionTextSize,
		onDescriptionTextSizeChange,
		label,
		value,
		onInput,
    placeholder,
    isSecondaryTemplate,
    descriptionType,
		onDescriptionTypeChange
	} = props;

	return (
    <div className="space-y-2 rounded-md border p-3 sm:p-4">
      {!isSecondaryTemplate && <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-sm font-medium" htmlFor="cm-show-description">
          Mostrar descripción en la vista previa
        </Label>
        <Switch
          id="cm-show-description"
          checked={showDescription}
          onCheckedChange={onShowDescriptionChange}
        />
      </div>}
      {isSecondaryTemplate ? null : (
		<>
			<Label className="text-sm font-medium" htmlFor="cm-box-color">
				Color del recuadro de descripción/estadísticas
			</Label>
			<Select
				value={descriptionType ?? "auto"}
				onValueChange={(v: string) =>
					onDescriptionTypeChange(v as YugiohDescriptionStatsBoxColor)
				}
			>
				<SelectTrigger id="cm-box-color" className="w-full">
					<SelectValue placeholder="Selecciona un color" />
				</SelectTrigger>
				<SelectContent>
					{YUGIOH_DESCRIPTION_STATS_BOX_COLORS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{BOX_COLOR_LABELS[option.value] ?? option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>)}
			{!isSecondaryTemplate || !["void", "void-inverse"].includes(descriptionType) && <div className="space-y-2">
				<Label className="text-sm font-medium" htmlFor="cm-description-opacity">
					Opacidad de la imagen de descripción
				</Label>
				<Select
					value={
						descriptionImageOpacity === undefined
							? "auto"
							: String(descriptionImageOpacity)
					}
					onValueChange={(value: string) => {
						if (value === "auto") {
							onDescriptionImageOpacityChange(undefined);
							return;
						}
						const parsed = Number.parseFloat(value);
						onDescriptionImageOpacityChange(
							Number.isFinite(parsed) ? parsed : undefined,
						);
					}}
				>
					<SelectTrigger id="cm-description-opacity" className="h-8 w-full">
						<SelectValue placeholder="Opacidad" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="auto">Automático</SelectItem>
						<SelectItem value="0.25">25%</SelectItem>
						<SelectItem value="0.5">50%</SelectItem>
						<SelectItem value="0.75">75%</SelectItem>
						<SelectItem value="1">100%</SelectItem>
					</SelectContent>
				</Select>
			</div>}
			{!isSecondaryTemplate ? (
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2 min-w-0">
						<label
							className="text-sm font-medium"
							htmlFor="cm-description-text-color"
						>
							Color del texto
						</label>
						<Select
							value={descriptionTextColor}
							onValueChange={(value: string) =>
								onDescriptionTextColorChange(
									value as YugiohDescriptionTextColor,
								)
							}
						>
							<SelectTrigger
								id="cm-description-text-color"
								className="h-8 w-full"
							>
								<SelectValue placeholder="Color" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">Automático</SelectItem>
								<SelectItem value="black">Negro</SelectItem>
								<SelectItem value="white">Blanco</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2 min-w-0">
						<Label
							className="text-sm font-medium"
							htmlFor="cm-description-text-size"
						>
							Tamaño del texto
						</Label>
						<Select
							value={descriptionTextSize}
							onValueChange={(value: string) =>
								onDescriptionTextSizeChange(value as YugiohDescriptionTextSize)
							}
						>
							<SelectTrigger
								id="cm-description-text-size"
								className="h-8 w-full"
							>
								<SelectValue placeholder="Tamaño" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="small">Pequeño</SelectItem>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="big">Grande</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			) : null}
			<Label className="text-sm font-medium" htmlFor="cm-description">
				{label}
			</Label>
			<Textarea
				id="cm-description"
				value={value}
				spellCheck={false}
				onInput={(e) => onInput(e.currentTarget.value)}
				placeholder={placeholder}
				rows={5}
				className="w-full resize-none max-h-20"
      />
		</div>
	);
}
