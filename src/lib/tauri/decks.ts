import { invoke } from "@tauri-apps/api/core";
import type { YugiohCardDB } from "../types";
import { canInvokeTauri } from "./can-invoke-tauri";

export type LoadDeckCardsResponse = {
	ids: string[];
	cards: YugiohCardDB[];
};

export async function loadDeckCardsFromYdkFile(
	file: File,
): Promise<LoadDeckCardsResponse | undefined> {
	if (!canInvokeTauri()) return undefined;

	const bytes = new Uint8Array(await file.arrayBuffer());
	return invoke<LoadDeckCardsResponse>("load_deck_cards_from_ydk_bytes", {
		req: { bytes: Array.from(bytes) },
	});
}
