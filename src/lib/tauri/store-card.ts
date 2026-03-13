import { invoke } from "@tauri-apps/api/core";
import type { YugiohCardDraft } from "@/lib/types";
import getAdminClient from "@/config/supabase";
import { canInvokeTauri } from "./can-invoke-tauri";

const SUPABASE_BUCKET = "images";

export type StoreYugiohCardRequest = {
	id: string;
	name: string;
	card_type: string;
	description: string;
	attribute?: string | null;
	monster_type?: string | null;
	sub_type?: string | null;
	is_tuner?: boolean | null;
	level: number;
	atk: string;
	def: string;
	spell_type?: string | null;
	trap_type?: string | null;
	img_url?: string | null;
	user_id?: string | null;
};

export type StoreYugiohCardResponse = {
	id: string;
	imgUrl?: string | null;
};

const toTextStat = (value: number | string): string => {
	const s = String(value).trim();
	return s ? s : "0";
};

function createId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function guessExtension(mime: string | undefined) {
	const m = (mime ?? "").toLowerCase();
	if (m.includes("png")) return "png";
	if (m.includes("webp")) return "webp";
	if (m.includes("gif")) return "gif";
	if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
	return "bin";
}

async function uploadCardImage(blob: Blob, cardId: string): Promise<string> {
	const ext = guessExtension(blob.type);
	const path = `${cardId}.${ext}`;

	const supabase = await getAdminClient();
	const { error: uploadError } = await supabase.storage
		.from(SUPABASE_BUCKET)
		.upload(path, blob, {
			contentType: blob.type || undefined,
			upsert: true,
		});

	if (uploadError) {
		throw new Error(uploadError.message);
	}

	const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
	if (!data?.publicUrl) {
		throw new Error("Failed to get public URL from Supabase");
	}
	return data.publicUrl;
}

async function isWebpBlob(blob: Blob): Promise<boolean> {
	if (blob.type === "image/webp") return true;
	// Sniff header: RIFF....WEBP
	const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
	if (head.length < 12) return false;
	const riff = String.fromCharCode(...head.slice(0, 4));
	const webp = String.fromCharCode(...head.slice(8, 12));
	return riff === "RIFF" && webp === "WEBP";
}

async function convertBlobToWebp(blob: Blob, quality: number): Promise<Blob> {
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const res = await invoke<{ bytes: number[]; mime: string }>(
		"convert_image_to_webp",
		{
			req: {
				bytes: Array.from(bytes),
				quality: Math.max(0, Math.min(100, Math.round(quality))),
			},
		},
	);
	return new Blob([new Uint8Array(res.bytes)], {
		type: res.mime || "image/webp",
	});
}

export async function storeYugiohCardDraft(
	draft: YugiohCardDraft,
	opts?: { userId?: string | null },
): Promise<StoreYugiohCardResponse | undefined> {
	if (!canInvokeTauri()) return undefined;

	const id = createId();
	let imgUrl: string | null = null;
	if (draft.img && typeof draft.img !== "string") {
		const alreadyWebp = await isWebpBlob(draft.img);
		const blobToUpload = alreadyWebp
			? draft.img
			: await convertBlobToWebp(draft.img, 90);
		imgUrl = await uploadCardImage(blobToUpload, id);
	} else {
		imgUrl = typeof draft.img === "string" ? draft.img : null;
	}

	const payload: StoreYugiohCardRequest = {
		id,
		name: draft.name,
		card_type: draft.cardType,
		description: draft.description,
		attribute: draft.attribute,
		monster_type: draft.monsterType ?? null,
		sub_type: draft.subType ?? null,
		is_tuner: draft.isTuner ?? null,
		level: draft.stats.level,
		atk: toTextStat(draft.stats.atk),
		def: toTextStat(draft.stats.def),
		spell_type: draft.spellType ?? null,
		trap_type: draft.trapType ?? null,
		img_url: imgUrl,
		user_id: opts?.userId ?? null,
	};

	const res = await invoke<StoreYugiohCardResponse>("store_yugioh_card", {
		card: payload,
	});
	return { ...res, imgUrl: imgUrl };
}

export async function assignYugiohCardToUser(opts: {
	cardId: string;
	userName: string;
}): Promise<void> {
	if (!canInvokeTauri()) return undefined;
	await invoke<void>("assign_yugioh_card_to_user", {
		cardId: opts.cardId,
		userName: opts.userName,
	});
}
