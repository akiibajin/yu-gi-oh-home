import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

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
	const [status, setStatus] = useState<string>("");
	const [busy, setBusy] = useState(false);

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
						<div className="flex flex-wrap gap-2">
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
