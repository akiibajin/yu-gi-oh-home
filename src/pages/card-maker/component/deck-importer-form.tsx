import { type Dispatch, type StateUpdater, useState } from "preact/hooks";

import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Input } from "@/components/ui/warcraftcn/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { YUGIOH_DESCRIPTION_STATS_BOX_COLORS } from "@/lib/constants";
import { exportPreview } from "@/lib/export-card";
import { loadDeckCardsFromYdkFile } from "@/lib/tauri/decks";
import type {
	YugiohCardDraft,
	YugiohDescriptionStatsBoxColor,
} from "@/lib/types";
import normalizeCard from "@/lib/normalize-card";
import { cardDraftSignal } from "@/pages/card-maker/state";

interface DeckImporterFormProps {
	cards: (Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string })[];
	setCards: Dispatch<
		StateUpdater<
			(Omit<YugiohCardDraft, "img"> & {
				imgUrl: string;
				id: string;
			})[]
		>
	>;
}
export function DeckImporterForm(props: DeckImporterFormProps) {
	const { cards, setCards } = props;
	const [file, setFile] = useState<File | null>(null);
	const [running, setRunning] = useState(false);
	const [status, setStatus] = useState<string>("");
	const [locked, setLocked] = useState(false);
	const [progress, setProgress] = useState<
		{ current: number; total: number; failures: number } | undefined
	>(undefined);

	const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
	const [lastResult, setLastResult] = useState<
		| {
				totalIds: number;
				totalCards: number;
				uniqueIds: number;
				sample: string[];
		  }
		| undefined
	>(undefined);

	const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

	const fetchCardImageBlob = async (url: string | null | undefined) => {
		const u = (url ?? "").trim();
		if (!u) return null;
		const res = await fetch(u);
		if (!res.ok) {
			throw new Error(`Failed to fetch image (${res.status})`);
		}
		return await res.blob();
	};

	const waitForPreviewReady = async (expectsCardArt: boolean) => {
		const node = document.getElementById("card-preview");
		if (!node) return;

		// Let Preact flush updates + effects.
		await new Promise<void>((r) => requestAnimationFrame(() => r()));
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		const start = Date.now();
		const timeoutMs = 3000;
		while (Date.now() - start < timeoutMs) {
			const imgs = Array.from(node.querySelectorAll("img"));
			const allLoaded = imgs.every(
				(img) => img.complete && img.naturalWidth > 0,
			);
			const hasCardArt =
				!expectsCardArt || imgs.some((img) => img.src.startsWith("data:"));
			if (allLoaded && hasCardArt) return;
			await sleep(50);
		}
	};

	const selectCardForPreview = async (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
		cardKey: string,
	) => {
		const currentDraft = cardDraftSignal.value;
		setSelectedCardKey(cardKey);
		cardDraftSignal.value = {
			name: card.name,
			cardType: card.cardType,
			showDescription: currentDraft.showDescription ?? true,
			pendulumDescription: card.pendulumDescription ?? "",
			description: card.description,
			attribute: card.attribute,
			monsterType: card.monsterType,
			subType: card.subType,
			isTuner: card.isTuner,
			scale: card.scale,
			linkRating: card.linkRating,
			linkMarkers: card.linkMarkers,
			stats: card.stats,
			spellType: card.spellType,
			trapType: card.trapType,
			descriptionStatsBoxColor: currentDraft.descriptionStatsBoxColor ?? "auto",
			objectFit: currentDraft.objectFit,
			img: card.imgUrl,
		};
	};

	const exportCardsSequentially = async (
		list: (Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string })[],
		folderName: string,
	) => {
		setProgress({ current: 0, total: list.length, failures: 0 });
		let failures = 0;

		for (let i = 0; i < list.length; i++) {
			const c = list[i];
			setProgress({ current: i + 1, total: list.length, failures });
			setStatus(`Exporting ${i + 1}/${list.length}: ${c.name}`);

			try {
				const currentDraft = cardDraftSignal.value;
				// Always map the card first (with no image) so the preview never
				// "sticks" on the previous card if fetching the new image fails.
				cardDraftSignal.value = {
					name: c.name,
					cardType: c.cardType,
					showDescription: currentDraft.showDescription ?? true,
					pendulumDescription: c.pendulumDescription ?? "",
					description: c.description,
					attribute: c.attribute,
					monsterType: c.monsterType,
					subType: c.subType,
					isTuner: c.isTuner,
					scale: c.scale,
					linkRating: c.linkRating,
					linkMarkers: c.linkMarkers,
					stats: c.stats,
					spellType: c.spellType,
					trapType: c.trapType,
					descriptionStatsBoxColor:
						currentDraft.descriptionStatsBoxColor ?? "auto",
					objectFit: currentDraft.objectFit,
					img: null,
				};

				let imgBlob: Blob | null = null;
				try {
					imgBlob = await fetchCardImageBlob(c.imgUrl);
					cardDraftSignal.value = {
						...cardDraftSignal.value,
						img: imgBlob,
					};
				} catch (err) {
					failures++;
					setProgress({ current: i + 1, total: list.length, failures });
					setStatus(
						`Image failed ${i + 1}/${list.length}: ${c.name} (skipped)`,
					);
					console.error(err);
					continue;
				}

				await waitForPreviewReady(Boolean(imgBlob));
				// Use a stable unique id per deck entry to avoid overwriting exports
				// when card names (or ids) repeat.
				await exportPreview(cardDraftSignal.value, {
					id: `${c.id}-${i + 1}`,
					folderName,
				});
			} catch (err) {
				failures++;
				setProgress({ current: i + 1, total: list.length, failures });
				console.error(err);
			}
		}

		setStatus(
			failures
				? `Done. Exported ${list.length - failures}/${list.length} (${failures} failed).`
				: `Done. Exported ${list.length}/${list.length}.`,
		);
	};

	const run = async () => {
		if (!file) {
			setStatus("Select a .ydk file first.");
			return;
		}
		if (running || locked) return;

		setRunning(true);
		setLocked(true);
		setProgress(undefined);
		setStatus("Loading deck...");
		setLastResult(undefined);
		setCards([]);
		try {
			const deckFolderName = file.name.replace(/\.ydk$/i, "") || "deck-import";
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
			const normalized = res.cards.map(normalizeCard);
			setCards(normalized);

			setStatus(`Loaded ${normalized.length} cards. Starting export...`);
			await exportCardsSequentially(normalized, deckFolderName);
		} catch (err) {
			setStatus(err instanceof Error ? err.message : "Failed to load deck.");
		} finally {
			setRunning(false);
			setLocked(false);
		}
	};
	return (
		<>
			{locked ? (
				<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
					<div className="absolute inset-0" />
					<div className="relative z-10 h-full w-full flex items-center justify-center p-4">
						<div className="w-full max-w-md rounded-md border bg-card p-4 text-card-foreground">
							<div className="font-medium">Processing deck…</div>
							{progress ? (
								<div className="mt-2 text-sm text-muted-foreground">
									{progress.current}/{progress.total}
									{progress.failures ? ` (${progress.failures} failed)` : ""}
								</div>
							) : null}
							{status ? (
								<div className="mt-2 text-sm text-muted-foreground">
									{status}
								</div>
							) : null}
							<div className="mt-3 text-xs text-muted-foreground">
								UI is locked until export finishes.
							</div>
						</div>
					</div>
				</div>
			) : null}

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
								variant="frame"
								onClick={() => {
									setFile(null);
									setStatus("");
									setLastResult(undefined);
								}}
								disabled={!file || running || locked}
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

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="deck-box-color">
							Description/Stats Box Color
						</label>
						<Select
							value={cardDraftSignal.value.descriptionStatsBoxColor ?? "auto"}
							onValueChange={(value: string) => {
								cardDraftSignal.value = {
									...cardDraftSignal.value,
									descriptionStatsBoxColor:
										value as YugiohDescriptionStatsBoxColor,
								};
							}}
						>
							<SelectTrigger id="deck-box-color" className="w-full">
								<SelectValue placeholder="Select box color" />
							</SelectTrigger>
							<SelectContent>
								{YUGIOH_DESCRIPTION_STATS_BOX_COLORS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							onClick={run}
							disabled={!file || running || locked}
						>
							{running ? "Running..." : "Run & Export"}
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
						</div>
					) : null}
					{cards.length ? (
						<div className="text-xs flex-1 max-h-[30dvh] overflow-auto flex flex-col gap-4">
							{cards.map((c) => (
								<button
									key={`${c.id}-${c.name}-${c.imgUrl}`}
									type="button"
									onClick={() =>
										void selectCardForPreview(
											c,
											`${c.id}-${c.name}-${c.imgUrl}`,
										)
									}
									className={`flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors ${
										selectedCardKey === `${c.id}-${c.name}-${c.imgUrl}`
											? "border-primary bg-accent/40"
											: "border-border hover:border-muted-foreground/60"
									}`}
								>
									<img className="size-8" src={c.imgUrl} alt={c.name} />
									<span className="truncate">{c.name}</span>
								</button>
							))}
						</div>
					) : null}
				</CardContent>
			</Card>
		</>
	);
}
