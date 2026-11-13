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

const waitForPreviewRender = async (node: HTMLElement) => {
	await document.fonts.ready;
	await Promise.all(
		Array.from(node.querySelectorAll("img"), (image) =>
			image.decode().catch(() => undefined),
		),
	);
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

export const exportPreview = async (
	draft: Partial<YugiohCardDraft>,
	opts?: { id?: string; folderName?: string },
) => {
	const node = document.getElementById("card-preview");
	if (!node) {
		throw new Error("Could not find #card-preview.");
	}
	await waitForPreviewRender(node);
	const { snapdom } = await import("@zumer/snapdom");
	const canvas = await snapdom.toCanvas(node, {
		dpr: 2,
		backgroundColor: "transparent",
		cache: "disabled",
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
