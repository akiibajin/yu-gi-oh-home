import { signal } from "@preact/signals";
import type { YugiohCardDraft } from "@/lib/types";

export function createDefaultCardDraft(): YugiohCardDraft {
	return {
		name: "",
		cardType: "Monster",
		iconProfile: "light",
		showDescription: true,
		pendulumDescription: "",
		description: "",
		descriptionTextColor: "auto",
		descriptionTextSize: "normal",
		attribute: "DARK",
		monsterType: "Effect",
		descriptionStatsBoxColor: "auto",
		scale: 0,
		stats: {
			level: 4,
			atk: 0,
			def: 0,
		},
		img: null,
		imgRotationDeg: 0,
	};
}

export const cardDraftSignal = signal<YugiohCardDraft>(
	createDefaultCardDraft(),
);

export function resetCardDraft() {
	cardDraftSignal.value = createDefaultCardDraft();
}
