import { invoke } from "@tauri-apps/api/core";

async function tryTauriInvoke<T>(cmd: string, args?: Record<string, unknown>) {
	if (typeof window === "undefined") return undefined;
	try {
		return await invoke<T>(cmd, args);
	} catch {
		return undefined;
	}
}

export async function initSupabaseConfigFromEnv(): Promise<
	{ configured: true } | { configured: false; reason: string }
> {
	const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as
		| string
		| undefined;

	// If we don't have env vars, do nothing.
	if (!url || !serviceRoleKey) {
		return {
			configured: false,
			reason: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY",
		};
	}

	// If we're not in Tauri, do nothing.
	const existing = await tryTauriInvoke<{ configured: boolean }>(
		"get_supabase_url",
	);
	if (existing === undefined) {
		return { configured: false, reason: "Not running in Tauri" };
	}
	if (existing.configured) {
		return { configured: true };
	}

	const res = await tryTauriInvoke<void>("set_supabase_config", {
		url,
		serviceRoleKey,
	});
	if (res === undefined) {
		return { configured: false, reason: "Failed to set Supabase config" };
	}

	return { configured: true };
}
