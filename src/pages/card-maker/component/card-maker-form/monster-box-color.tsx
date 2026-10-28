import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

export function CardMakerMonsterBoxColor(props: {
	value: YugiohDescriptionStatsBoxColor | undefined;
	onValueChange: (value: YugiohDescriptionStatsBoxColor) => void;
	isSecondaryTemplate: boolean;
}) {
	const { value, onValueChange, isSecondaryTemplate } = props;

	return isSecondaryTemplate ? null : (
		<div className="space-y-2 rounded-md border p-3 sm:p-4">
			<Label className="text-sm font-medium" htmlFor="cm-box-color">
				Color del recuadro de descripción/estadísticas
			</Label>
			<Select
				value={value ?? "auto"}
				onValueChange={(v: string) =>
					onValueChange(v as YugiohDescriptionStatsBoxColor)
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
		</div>
	);
}
