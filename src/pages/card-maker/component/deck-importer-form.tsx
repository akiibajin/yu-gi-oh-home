import { useMemo, useState } from "preact/hooks";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadDeckCardsFromYdkFile } from "@/lib/tauri/decks";

export function DeckImporterForm() {
	const [file, setFile] = useState<File | null>(null);
	const [running, setRunning] = useState(false);
	const [status, setStatus] = useState<string>("");
	const [lastResult, setLastResult] = useState<
		| {
				totalIds: number;
				totalCards: number;
				uniqueIds: number;
				sample: string[];
		  }
		| undefined
	>(undefined);

	const sampleText = useMemo(() => {
		if (!lastResult?.sample?.length) return "";
		return lastResult.sample.join(", ");
	}, [lastResult]);

	const run = async () => {
		if (!file) {
			setStatus("Select a .ydk file first.");
			return;
		}

		setRunning(true);
		setStatus("Loading deck...");
		setLastResult(undefined);
		try {
			const res = await loadDeckCardsFromYdkFile(file);
			if (!res) {
				setStatus("Deck import only works in Tauri (not web mode). ");
				return;
			}

			const uniqueIds = new Set(res.ids).size;
			const sample = res.cards.slice(0, 8).map((c) => c.name);
			setLastResult({
				totalIds: res.ids.length,
				totalCards: res.cards.length,
				uniqueIds,
				sample,
			});
			setStatus("Done.");
		} catch (err) {
			setStatus(err instanceof Error ? err.message : "Failed to load deck.");
		} finally {
			setRunning(false);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Import Deck (.ydk)</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="deck-ydk">
						Deck file
					</label>
					<div className="flex items-center gap-2">
						<Input
							id="deck-ydk"
							type="file"
							accept=".ydk"
							onChange={(e) => {
								const f = e.currentTarget.files?.[0] ?? null;
								setFile(f);
								setStatus("");
								setLastResult(undefined);
							}}
						/>

						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setFile(null);
								setStatus("");
								setLastResult(undefined);
							}}
							disabled={!file || running}
						>
							Clear
						</Button>
					</div>
					{file ? (
						<div className="text-xs text-muted-foreground">
							Selected: {file.name}
						</div>
					) : null}
				</div>

				<div className="flex items-center gap-2">
					<Button type="button" onClick={run} disabled={!file || running}>
						{running ? "Running..." : "Run"}
					</Button>
					{status ? (
						<div className="text-sm text-muted-foreground">{status}</div>
					) : null}
				</div>

				{lastResult ? (
					<div className="space-y-1 text-sm">
						<div>
							Cards loaded: {lastResult.totalCards} (deck entries:
							{lastResult.totalIds}, unique IDs: {lastResult.uniqueIds})
						</div>
						{sampleText ? (
							<div className="text-xs text-muted-foreground">
								Sample: {sampleText}
							</div>
						) : null}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
