import { useEffect, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import { canInvokeTauri } from "@/lib/tauri/can-invoke-tauri";

interface UpdateInfo {
	version: string;
	date?: string | null;
	body?: string | null;
}

export default function UpdateNotification() {
	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
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

	if (!updateInfo) return null;

	return (
		<Dialog open={true}>
			<DialogContent
				onPointerDownOutside={(e: { preventDefault: () => void }) =>
					e.preventDefault()
				}
				onInteractOutside={(e: { preventDefault: () => void }) =>
					e.preventDefault()
				}
				onEscapeKeyDown={(e: { preventDefault: () => void }) =>
					e.preventDefault()
				}
				showCloseButton={false}
				className="sm:max-w-md"
			>
				<DialogHeader>
					<DialogTitle>Update Available</DialogTitle>
					<DialogDescription>
						A new version ({updateInfo.version}) is ready to install.
					</DialogDescription>
				</DialogHeader>

				{updateInfo.body && (
					<div className="text-sm text-muted-foreground max-h-32 overflow-y-auto border rounded p-2">
						{updateInfo.body}
					</div>
				)}

				{error && <div className="text-sm text-destructive">{error}</div>}

				<DialogFooter>
					<Button onClick={handleInstall} disabled={installing}>
						{installing ? (
							<>
								<RotateCcwIcon className="mr-2 h-4 w-4 animate-spin" />
								Installing...
							</>
						) : (
							"Update Now"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
