import { invoke } from "@tauri-apps/api/core";

export type StoreCardMakerImageResponse = {
	dir: string;
	filename: string;
	path: string;
};

function canInvokeTauri() {
	if (typeof window === "undefined") return false;
	return Boolean(
		(window as unknown as { __TAURI_INTERNALS__?: unknown })
			.__TAURI_INTERNALS__,
	);
}

export async function storeCardMakerWebpById(
	id: string,
	input: Blob | ArrayBuffer | Uint8Array,
): Promise<StoreCardMakerImageResponse | undefined> {
	if (!canInvokeTauri()) return undefined;
	const trimmedId = id.trim();
	if (!trimmedId) return undefined;

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
		},
	});
}
