import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";
import type { YugiohCardDB } from "../types";

export async function getCardsByUserId(
	userId: string,
): Promise<YugiohCardDB[]> {
	if (!canInvokeTauri()) return [];
	return await invoke<YugiohCardDB[]>("get_cards_by_user_id", {
		userId,
	});
}
