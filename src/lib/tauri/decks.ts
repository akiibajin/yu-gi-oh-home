import { invoke } from "@tauri-apps/api/core";
import type { YugiohCardDB } from "../types";

export type LoadDeckCardsResponse = {
	ids: string[];
	cards: YugiohCardDB[];
};

function canInvokeTauri() {
	if (typeof window === "undefined") return false;
	return Boolean(
		(window as unknown as { __TAURI_INTERNALS__?: unknown })
			.__TAURI_INTERNALS__,
	);
}

export async function loadDeckCardsFromYdkFile(
	file: File,
): Promise<LoadDeckCardsResponse | undefined> {
	if (!canInvokeTauri()) return undefined;

	const bytes = new Uint8Array(await file.arrayBuffer());
	return invoke<LoadDeckCardsResponse>("load_deck_cards_from_ydk_bytes", {
		req: { bytes: Array.from(bytes) },
	});
}
