import type { YugiohCardDraft } from "./types";
import { storeCardMakerWebpById } from "./tauri/card-maker-images";

export const exportPreview = async (
	draft: YugiohCardDraft,
	opts?: { id?: string; folderName?: string },
) => {
	const { toCanvas } = await import("html-to-image");
	const node = document.getElementById("card-preview");
	if (!node) {
		throw new Error("Could not find #card-preview.");
	}
	const canvas = await toCanvas(node, {
		pixelRatio: 2,
		cacheBust: true,
		// If any image can't be fetched/embedded, don't abort the export.
		// Render a transparent pixel for failed images instead.
		imagePlaceholder:
			"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
		onImageErrorHandler: (err) => console.log(err),
	});

	const webpBlob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("Failed to create WebP blob"))),
			"image/webp",
			0.95,
		);
	});

	const id = opts?.id?.trim() || draft.name.trim() || `card-${Date.now()}`;
	const res = await storeCardMakerWebpById(id, webpBlob, {
		folderName: opts?.folderName,
	});
	if (!res) {
		throw new Error("Export only works in Tauri (not web mode).");
	}
	return res;
};
