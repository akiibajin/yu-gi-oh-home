import { useEffect, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon, XIcon } from "lucide-react";
import { canInvokeTauri } from "@/lib/tauri/can-invoke-tauri";

interface UpdateInfo {
	version: string;
	date?: string | null;
	body?: string | null;
}

export default function UpdateNotification() {
	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
	const [dismissed, setDismissed] = useState(false);
	const [installing, setInstalling] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!canInvokeTauri()) return;

		invoke<UpdateInfo | null>("check_update")
			.then((result) => {
				if (result) setUpdateInfo(result);
			})
			.catch(() => {});
	}, []);

	const handleInstall = async () => {
		setInstalling(true);
		setError(null);
		try {
			await invoke("install_update");
		} catch (e) {
			setError(typeof e === "string" ? e : "Failed to install update");
			setInstalling(false);
		}
	};

	if (!updateInfo || dismissed) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className="pointer-events-none fixed inset-x-0 z-50 bottom-4 flex justify-center px-4"
		>
			<div className="pointer-events-auto flex w-full max-w-lg flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg dark:bg-card dark:border-input">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2">
						<RotateCcwIcon className="size-4 shrink-0 text-primary" />
						<p className="text-sm font-medium">Update Available</p>
					</div>
					<button
						type="button"
						aria-label="Dismiss update notification"
						className="rounded-xs text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
						onClick={() => setDismissed(true)}
					>
						<XIcon className="size-4" />
					</button>
				</div>

				<p className="text-sm text-muted-foreground">
					A new version ({updateInfo.version}) is ready to install.
				</p>

				{updateInfo.body && (
					<div className="max-h-24 overflow-y-auto rounded border p-2 text-xs text-muted-foreground">
						{updateInfo.body}
					</div>
				)}

				{error && <div className="text-sm text-destructive">{error}</div>}

				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={installing}
						onClick={() => setDismissed(true)}
					>
						Dismiss
					</Button>
					<Button size="sm" onClick={handleInstall} disabled={installing}>
						{installing ? (
							<>
								<RotateCcwIcon className="mr-2 h-4 w-4 animate-spin" />
								Installing...
							</>
						) : (
							"Update Now"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}