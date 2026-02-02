import { invoke } from "@tauri-apps/api/core";

async function tryTauriInvoke<T>(cmd: string, args?: Record<string, unknown>) {
	if (typeof window === "undefined") return undefined;
	try {
		return await invoke<T>(cmd, args);
	} catch {
		return undefined;
	}
}

export async function initDatabaseUrlFromEnv(): Promise<
	{ configured: true } | { configured: false; reason: string }
> {
	const url = import.meta.env.VITE_CONNECTION_STRING as string | undefined;
	if (!url) {
		return { configured: false, reason: "Missing VITE_CONNECTION_STRING" };
	}

	// If we're not in Tauri, do nothing.
	const res = await tryTauriInvoke<void>("set_database_url", { url });
	if (res === undefined) {
		return { configured: false, reason: "Not running in Tauri" };
	}

	return { configured: true };
}
