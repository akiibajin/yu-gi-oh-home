import { invoke } from "@tauri-apps/api/core";

export type YugiohCard = {
	id: string;
	name: string;
	card_type: string;
	description: string;
	attribute?: string | null;
	monster_type?: string | null;
	sub_type?: string | null;
	is_tuner?: boolean | null;
	level: number;
	atk: number;
	def: number;
	link_rating?: number | null;
	link_markers?: string[] | null;
	spell_type?: string | null;
	trap_type?: string | null;
	img_url?: string | null;
	user_id?: string | null;
};

export type LoadDeckCardsResponse = {
	ids: string[];
	cards: YugiohCard[];
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
