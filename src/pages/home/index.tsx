import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "preact-iso";
import { useEffect, useMemo, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

const DB_URL_STORAGE_KEY = "yugioh_db_url";

async function tryTauriInvoke<T>(cmd: string, args?: Record<string, unknown>) {
	if (typeof window === "undefined") return undefined;
	try {
		return await invoke<T>(cmd, args);
	} catch {
		return undefined;
	}
}

function Home() {
	const { route } = useLocation();
	const [dbUrl, setDbUrl] = useState<string>("");
	const [status, setStatus] = useState<string>("");
	const [busy, setBusy] = useState(false);

	const isProbablyUrl = useMemo(
		() => dbUrl.trim().startsWith("postgres"),
		[dbUrl],
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const savedLocal = window.localStorage.getItem(DB_URL_STORAGE_KEY);
		if (savedLocal) setDbUrl(savedLocal);

		void (async () => {
			const res = await tryTauriInvoke<{ url?: string | null }>(
				"get_database_url",
			);
			if (res?.url) {
				setDbUrl(res.url);
				window.localStorage.setItem(DB_URL_STORAGE_KEY, res.url);
			}
		})();
	}, []);

	const save = async () => {
		const trimmed = dbUrl.trim();
		if (!trimmed) {
			setStatus("Please paste a connection string.");
			return;
		}

		setBusy(true);
		setStatus("Saving...");
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(DB_URL_STORAGE_KEY, trimmed);
			}

			const tauriResult = await tryTauriInvoke<void>("set_database_url", {
				url: trimmed,
			});
			if (tauriResult === undefined) {
				setStatus(
					"Saved locally (web mode). In Tauri, it will also be applied.",
				);
				return;
			}
			setStatus("Saved on device and DB initialized.");
		} catch {
			setStatus("Failed to save/apply connection string.");
		} finally {
			setBusy(false);
		}
	};

	const test = async () => {
		setBusy(true);
		setStatus("Testing connection...");
		try {
			const res = await tryTauriInvoke<void>("db_healthcheck");
			if (res === undefined) {
				setStatus("Healthcheck only works in Tauri.");
				return;
			}
			setStatus("DB connection OK.");
		} catch {
			setStatus("DB healthcheck failed.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex flex-1 items-center size-full justify-center p-4">
			<div className="w-full max-w-2xl space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Database (Supabase Postgres)</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="db-url">
								Connection string
							</label>
							<Textarea
								id="db-url"
								rows={3}
								value={dbUrl}
								onInput={(e) => setDbUrl(e.currentTarget.value)}
								placeholder={
									"postgresql://postgres.<project-ref>:<PASSWORD>@.../postgres"
								}
							/>
							<div className="text-xs text-muted-foreground">
								Stored on this device for the Tauri app. This includes your
								password.
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								onClick={save}
								disabled={busy || !isProbablyUrl}
							>
								Save
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={test}
								disabled={busy}
							>
								Test
							</Button>
						</div>

						{status ? (
							<div className="text-sm text-muted-foreground">{status}</div>
						) : null}
					</CardContent>
				</Card>

				<div className="flex flex-wrap gap-2">
					<Button type="button" onClick={() => route("/calc")}>
						Go to Calculator
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => route("/card-maker")}
					>
						Go to Card Maker
					</Button>
				</div>
			</div>
		</div>
	);
}

export default Home;
