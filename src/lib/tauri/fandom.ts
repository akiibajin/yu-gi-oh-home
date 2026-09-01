import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";

export type WikiCardData = {
	name?: string;
	english_name?: string;
	card_type?: string;
	card_sub_type?: string;
	attribute?: string;
	race?: string;
	level?: string;
	atk?: string;
	def?: string;
	scale?: string;
	pendulum_effect?: string;
	description?: string;
	anime_effect?: string;
	image_url?: string;
};

export async function fetchWikiCardData(
	url: string,
): Promise<WikiCardData | undefined> {
	if (!canInvokeTauri()) return undefined;

	const res = await invoke<WikiCardData>("fetch_wiki_card_data", {
		req: { url },
	});
	if (typeof res === "string") {
		throw new Error(res);
	}
	return res;
}

export type SpanishCardText = {
	name: string;
	lore: string;
	pendulum_effect?: string;
};

export async function fetchSpanishNameAndLore(
	title: string,
): Promise<SpanishCardText | undefined> {
	if (!canInvokeTauri()) return undefined;

	const res = await invoke<SpanishCardText | null>(
		"fetch_spanish_name_and_lore",
		{ title },
	);
	if (typeof res === "string") {
		throw new Error(res);
	}
	return res ?? undefined;
}
