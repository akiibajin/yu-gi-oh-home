import type { YugiohCardDraft } from "./types";
import { storeCardMakerWebpById } from "./tauri/card-maker-images";

const getMimeType = (format: string) => {
	switch (format) {
		case "png":
			return "image/png";
		case "jpg":
			return "image/jpeg";
		case "webp":
		default:
			return "image/webp";
	}
};

const getQuality = (format: string) => {
	if (format === "png") return undefined;
	if (format === "jpg") return 0.92;
	return 0.95;
};

export const exportPreview = async (
	draft: Partial<YugiohCardDraft>,
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
		imagePlaceholder:
			"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
		onImageErrorHandler: (err) => console.log(err),
	});

	const format = draft.exportFormat ?? "webp";
	const mimeType = getMimeType(format);
	const quality = getQuality(format);

	const blob = await new Promise<Blob>((resolve, reject) => {
		if (format === "png") {
			canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create PNG blob"))), mimeType);
		} else {
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error("Failed to create " + format.toUpperCase() + " blob"))),
				mimeType,
				quality,
			);
		}
	});

	const id = opts?.id?.trim() || draft.name?.trim() || `card-` + Date.now();
	const res = await storeCardMakerWebpById(id, blob, {
		folderName: opts?.folderName,
		format,
	});
	if (!res) {
		throw new Error("Export only works in Tauri (not web mode).");
	}
	return res;
};
