import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
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
		<div className="flex min-h-full w-full justify-center p-4 md:items-center">
			<div className="w-full max-w-4xl space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Duel Tools & Features</CardTitle>
								<CardDescription>
									Essential utilities for any duelist
								</CardDescription>
							</div>
							<Badge variant="default" faction="none" size="lg">
								ARSENAL
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 px-10 py-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<Button
								type="button"
								onClick={() => route("/calc")}
								className="flex items-center justify-center"
								variant="default"
							>
								⚔️ Calculator
							</Button>
							<Button
								type="button"
								onClick={() => route("/card-maker")}
								className="flex items-center justify-center"
								variant="default"
							>
								✨ Card Maker
							</Button>
							<Button
								type="button"
								onClick={() => route("/fields-bg")}
								className="flex items-center justify-center"
								variant="default"
							>
								🏰 Field Spells
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Multiplayer Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Multiplayer Battle</CardTitle>
								<CardDescription>
									Challenge opponents and track life points in real-time
								</CardDescription>
							</div>
							<Badge variant="default" faction="none" size="lg">
								PVP
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 px-10 py-6">
						<p className="text-sm text-amber-100/70 leading-relaxed">
							Create a custom lobby or join an existing one to engage in
							synchronized duels. Perfect for local multiplayer and tournament
							tracking.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<Button
								type="button"
								onClick={() => route("/lobby/create")}
								className="flex items-center justify-center"
								variant="default"
							>
								🎪 Create Lobby
							</Button>
							<Button
								type="button"
								onClick={() => route("/lobby/join")}
								className="flex items-center justify-center"
								variant="default"
							>
								🔗 Join Lobby
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* System Status Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>System Status</CardTitle>
							<Badge
								variant={
									status.includes("OK")
										? "default"
										: status.includes("failed")
											? "destructive"
											: "secondary"
								}
								size="sm"
							>
								{status.includes("OK")
									? "ONLINE"
									: status.includes("failed")
										? "OFFLINE"
										: "TESTING"}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-3 px-10 py-6">
						<p className="text-sm text-amber-100/70">
							Verify backend database connectivity and system health
						</p>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="frame"
								onClick={test}
								disabled={busy}
								className="px-4 py-2"
							>
								{busy ? "Testing..." : "Test Connection"}
							</Button>
						</div>
						{status ? (
							<div
								className={`text-sm px-3 py-2 rounded border ${
									status.includes("OK")
										? "text-emerald-200 border-emerald-700/50 bg-emerald-950/30"
										: status.includes("failed")
											? "text-red-200 border-red-700/50 bg-red-950/30"
											: "text-amber-200 border-amber-700/50 bg-amber-950/30"
								}`}
							>
								{status}
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default Home;
