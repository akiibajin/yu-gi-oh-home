import type { YugiohCardDraft } from "@/lib/types";

export type SetDraftField = <K extends keyof YugiohCardDraft>(
	key: K,
	value: YugiohCardDraft[K],
) => void;
