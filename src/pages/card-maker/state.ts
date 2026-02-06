import { signal } from "@preact/signals";
import type { YugiohCardDraft } from "@/lib/types";

export function createDefaultCardDraft(): YugiohCardDraft {
	return {
		name: "",
		cardType: "Monster",
		pendulumDescription: "",
		description: "",
		attribute: "DARK",
		monsterType: "Effect",
		stats: {
			level: 4,
			atk: 0,
			def: 0,
		},
		img: null,
	};
}

export const cardDraftSignal = signal<YugiohCardDraft>(
	createDefaultCardDraft(),
);

export function resetCardDraft() {
	cardDraftSignal.value = createDefaultCardDraft();
}
