import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { LinkMarker, YugiohCardDraft } from "@/lib/types";
import type { SetDraftField } from "./types";
import { clampInt } from "./utils";
import { Label } from "@/components/ui/warcraftcn/label";

const LINK_MARKERS: LinkMarker[] = [
	"Top-Left",
	"Top",
	"Top-Right",
	"Left",
	"Right",
	"Bottom-Left",
	"Bottom",
	"Bottom-Right",
];

const LINK_MARKER_LABELS: Record<LinkMarker, string> = {
	"Top-Left": "Arriba-izquierda",
	Top: "Arriba",
	"Top-Right": "Arriba-derecha",
	Left: "Izquierda",
	Right: "Derecha",
	"Bottom-Left": "Abajo-izquierda",
	Bottom: "Abajo",
	"Bottom-Right": "Abajo-derecha",
};

export function CardMakerLinkMarkers(props: {
	draft: Partial<YugiohCardDraft>;
	setDraftField: SetDraftField;
}) {
	const { draft, setDraftField } = props;

	const toggleLinkMarker = (marker: LinkMarker, checked: boolean) => {
		const current = new Set<LinkMarker>(draft.linkMarkers ?? []);
		if (checked) current.add(marker);
		else current.delete(marker);
		setDraftField("linkMarkers", Array.from(current));
	};

	return (
		<fieldset className="space-y-4 rounded-md border p-3 sm:p-4">
			<legend className="px-1 text-sm font-medium">Marcadores de enlace</legend>
			<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
				<div className="space-y-2 min-w-0">
					<Label className="text-sm font-medium" htmlFor="cm-link-rating">
						Clasificación de Enlace
					</Label>
					<Input
						id="cm-link-rating"
						className="w-full"
						type="number"
						min={1}
						max={8}
						value={String(draft.linkRating ?? 1)}
						onInput={(e) => {
							const parsed = Number.parseInt(e.currentTarget.value, 10);
							const next = Number.isFinite(parsed) ? clampInt(parsed, 1, 8) : 1;
							setDraftField("linkRating", next);
						}}
					/>
				</div>
			</div>
			<div className="space-y-2 min-w-0 flex items-center gap-2">
				<Label htmlFor="rating-desc" className="m-0">
					¿Mostrar flechas en la descripción?
				</Label>
				<Switch
					id="rating-desc"
					checked={draft.linkMarkersOnDescription ?? false}
					onCheckedChange={(checked: boolean) =>
						setDraftField("linkMarkersOnDescription", checked)
					}
				/>
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				{LINK_MARKERS.map((marker) => {
					const checked = (draft.linkMarkers ?? []).includes(marker);
					return (
						<div key={marker} className="flex items-center gap-2">
							<Switch
								checked={checked}
								onCheckedChange={(v: boolean) => toggleLinkMarker(marker, v)}
							/>
							<span className="text-sm">{LINK_MARKER_LABELS[marker]}</span>
						</div>
					);
				})}
			</div>
		</fieldset>
	);
}
