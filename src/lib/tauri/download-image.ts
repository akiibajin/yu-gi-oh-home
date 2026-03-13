import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";

export async function downloadImageBytes(
	url: string,
): Promise<Uint8Array | undefined> {
	if (!canInvokeTauri()) return undefined;
	const trimmed = url.trim();
	if (!trimmed) return undefined;

	const bytes = await invoke<number[]>("download_image_bytes", {
		req: { url: trimmed },
	});
	return new Uint8Array(bytes);
}

export async function downloadImageBlob(
	url: string,
): Promise<Blob | undefined> {
	const bytes = await downloadImageBytes(url);
	if (!bytes) return undefined;
	const ab = bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength,
	) as ArrayBuffer;
	return new Blob([ab]);
}
