import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";

export type YgoprodeckCardImage = {
	image_url?: string;
	image_url_small?: string;
	image_url_cropped?: string;
};

export type YgoprodeckCard = {
	id?: number | string;
	name?: string;
	desc?: string;
	type?: string;
	race?: string;
	attribute?: string;
	level?: number;
	scale?: number;
	atk?: number | string;
	def?: number | string;
	linkval?: number;
	linkmarkers?: string[];
	card_images?: YgoprodeckCardImage[];
};

export type YgoprodeckCardInfoResponse = {
	data?: YgoprodeckCard[];
	// When the API errors, it typically returns an object with `error`.
	error?: string;
};

export async function fetchYgoprodeckCardInfo(opts: {
	userName?: string;
	name?: string;
	fname?: string;
	id?: number;
}): Promise<YgoprodeckCardInfoResponse | undefined> {
	if (!canInvokeTauri()) return undefined;

	const res = await invoke<YgoprodeckCardInfoResponse>(
		"fetch_ygoprodeck_card",
		{
			userName: opts.userName ?? null,
			name: opts.name ?? null,
			fname: opts.fname ?? null,
			id: opts.id ?? null,
		},
	);
	if (typeof res === "string") {
		throw new Error(res);
	}
	return res;
}
