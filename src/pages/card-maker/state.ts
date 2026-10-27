import { signal } from "@preact/signals";
import type { YugiohCardDraft } from "@/lib/types";

export function createDefaultCardDraft(): YugiohCardDraft {
	return {
		name: "",
		cardType: "Monster",
		iconProfile: "light",
		showDescription: true,
		showName: true,
		showNameBox: false,
		showStatsBox: true,
		pendulumDescription: "",
		description: "",
		descriptionTextColor: "auto",
		descriptionTextSize: "normal",
		attribute: "DARK",
		monsterType: "Effect",
		descriptionStatsBoxColor: "auto",
		template: "primary",
		scale: 0,
		stats: {
			level: 4,
			atk: 0,
			def: 0,
		},
		img: null,
		imgRotationDeg: 0,
		overframe: false,
		fullArt: false,
		overframeImg: null,
		overframeObjectFit: "cover",
		overframeImgRotationDeg: 0,
		exportFormat: "webp",
	};
}

export const cardDraftSignal = signal<YugiohCardDraft>(
	createDefaultCardDraft(),
);

export function resetCardDraft() {
	cardDraftSignal.value = createDefaultCardDraft();
}
