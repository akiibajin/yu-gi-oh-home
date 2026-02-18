import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";

export type StoreCardMakerImageResponse = {
	dir: string;
	filename: string;
	path: string;
};

export type StoreCardMakerImageOptions = {
	folderName?: string;
};

export async function storeCardMakerWebpById(
	id: string,
	input: Blob | ArrayBuffer | Uint8Array,
	opts?: StoreCardMakerImageOptions,
): Promise<StoreCardMakerImageResponse | undefined> {
	if (!canInvokeTauri()) return undefined;
	const trimmedId = id.trim();
	if (!trimmedId) return undefined;
	const folderName = opts?.folderName?.trim();

	let bytes: Uint8Array;
	if (input instanceof Uint8Array) {
		bytes = input;
	} else if (input instanceof ArrayBuffer) {
		bytes = new Uint8Array(input);
	} else {
		bytes = new Uint8Array(await input.arrayBuffer());
	}

	return invoke<StoreCardMakerImageResponse>("store_card_maker_image", {
		req: {
			id: trimmedId,
			bytes: Array.from(bytes),
			folder_name: folderName || null,
		},
	});
}
