import { invoke } from "@tauri-apps/api/core";
import { canInvokeTauri } from "./can-invoke-tauri";
import type { YugiohBackground } from "../types";

export async function setCurrentBackground(opts: {
	name: string;
	imgUrl: string;
}): Promise<YugiohBackground | undefined> {
	if (!canInvokeTauri()) return undefined;
	await invoke<YugiohBackground>("set_current_background", {
		name: opts.name,
		imgUrl: opts.imgUrl,
	});
}

export async function getCurrentBackground(): Promise<
	YugiohBackground | undefined
> {
	if (!canInvokeTauri()) return undefined;
	return await invoke<YugiohBackground>("get_current_background");
}
