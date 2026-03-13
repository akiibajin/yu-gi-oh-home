import {
	type Dispatch,
	type StateUpdater,
	useEffect,
	useRef,
	useState,
} from "preact/hooks";

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
import { downloadImageBlob } from "@/lib/tauri/download-image";
import type {
	YugiohCardDraft,
	YugiohDescriptionStatsBoxColor,
} from "@/lib/types";
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
	const DECK_SELECTED_CARD_KEY_STORAGE = "card-maker.deck.selected-card-key";
	const DECK_SCROLL_TOP_STORAGE = "card-maker.deck.cards-scroll-top";

	const { cards, setCards } = props;
	const [file, setFile] = useState<File | null>(null);
	const [running, setRunning] = useState(false);
	const [status, setStatus] = useState<string>("");
	const [locked, setLocked] = useState(false);
	const [progress, setProgress] = useState<
		{ current: number; total: number; failures: number } | undefined
	>(undefined);

	const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
	const cardsListRef = useRef<HTMLDivElement | null>(null);
	const [lastResult, setLastResult] = useState<
		| {
				totalIds: number;
				totalCards: number;
				uniqueIds: number;
				sample: string[];
		  }
		| undefined
	>(undefined);

	const getCardKey = (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
	) => `${card.id}-${card.name}-${card.imgUrl}`;

	const persistSelectedCardKey = (value: string | null) => {
		if (typeof window === "undefined") return;
		if (value) {
			window.localStorage.setItem(DECK_SELECTED_CARD_KEY_STORAGE, value);
			return;
		}
		window.localStorage.removeItem(DECK_SELECTED_CARD_KEY_STORAGE);
	};

	const persistCardsScrollTop = (value: number) => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(DECK_SCROLL_TOP_STORAGE, String(value));
	};

	useEffect(() => {
		if (typeof window === "undefined") return;
		const restoredCardKey = window.localStorage.getItem(
			DECK_SELECTED_CARD_KEY_STORAGE,
		);
		if (restoredCardKey) {
			setSelectedCardKey(restoredCardKey);
		}
	}, []);

	useEffect(() => {
		const list = cardsListRef.current;
		if (!list || typeof window === "undefined") return;

		const savedScrollTopRaw = window.localStorage.getItem(
			DECK_SCROLL_TOP_STORAGE,
		);
		const savedScrollTop = savedScrollTopRaw
			? Number.parseInt(savedScrollTopRaw, 10)
			: Number.NaN;

		if (Number.isFinite(savedScrollTop)) {
			list.scrollTop = savedScrollTop;
		}

		if (!selectedCardKey) return;
		const selectedButton = list.querySelector<HTMLButtonElement>(
			`button[data-card-key="${CSS.escape(selectedCardKey)}"]`,
		);
		if (!selectedButton) return;

		const listRect = list.getBoundingClientRect();
		const selectedRect = selectedButton.getBoundingClientRect();
		const isVisible =
			selectedRect.top >= listRect.top &&
			selectedRect.bottom <= listRect.bottom;
		if (!isVisible) {
			selectedButton.scrollIntoView({ block: "nearest" });
			persistCardsScrollTop(list.scrollTop);
		}
	}, [cards, selectedCardKey]);

	const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

	const fetchCardImageBlob = async (url: string | null | undefined) => {
		const u = (url ?? "").trim();
		if (!u) return null;
		const blob = await downloadImageBlob(u);
		if (!blob) {
			throw new Error("No se pudo descargar la imagen (Tauri no disponible)");
		}
		return blob;
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
		persistSelectedCardKey(cardKey);

		let img: Blob | string | null = null;
		try {
			img = (await fetchCardImageBlob(card.imgUrl)) ?? null;
		} catch {
			img = card.imgUrl;
		}
		cardDraftSignal.value = {
			name: card.name,
			cardType: card.cardType,
			iconProfile: currentDraft.iconProfile ?? "light",
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
			linkMarkersOnDescription: currentDraft.linkMarkersOnDescription ?? false,
			descriptionStatsBoxColor: currentDraft.descriptionStatsBoxColor ?? "auto",
			objectFit: currentDraft.objectFit,
			imgRotationDeg: currentDraft.imgRotationDeg ?? 0,
			descriptionImageOpacity: currentDraft.descriptionImageOpacity,
			img,
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
			setStatus(`Exportando ${i + 1}/${list.length}: ${c.name}`);

			try {
				const currentDraft = cardDraftSignal.value;
				// Always map the card first (with no image) so the preview never
				// "sticks" on the previous card if fetching the new image fails.
				cardDraftSignal.value = {
					name: c.name,
					cardType: c.cardType,
					iconProfile: currentDraft.iconProfile ?? "light",
					showDescription: currentDraft.showDescription ?? true,
					pendulumDescription: c.pendulumDescription ?? "",
					description: c.description,
					attribute: c.attribute,
					monsterType: c.monsterType,
					subType: c.subType,
					isTuner: c.isTuner,
					scale: c.scale,
					linkRating: c.linkRating,
					linkMarkersOnDescription:
						currentDraft.linkMarkersOnDescription ?? false,
					linkMarkers: c.linkMarkers,
					stats: c.stats,
					spellType: c.spellType,
					trapType: c.trapType,
					descriptionStatsBoxColor:
						currentDraft.descriptionStatsBoxColor ?? "auto",
					objectFit: currentDraft.objectFit,
					imgRotationDeg: currentDraft.imgRotationDeg ?? 0,
					descriptionImageOpacity: currentDraft.descriptionImageOpacity,
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
						`Falló la imagen ${i + 1}/${list.length}: ${c.name} (omitida)`,
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
				? `Listo. Exportadas ${list.length - failures}/${list.length} (${failures} fallidas).`
				: `Listo. Exportadas ${list.length}/${list.length}.`,
		);
	};

	const run = async () => {
		if (!file) {
			setStatus("Selecciona primero un archivo .ydk.");
			return;
		}
		if (running || locked) return;

		setRunning(true);
		setLocked(true);
		setProgress(undefined);
		setStatus("Cargando mazo...");
		setLastResult(undefined);
		setCards([]);
		try {
			const deckFolderName = file.name.replace(/\.ydk$/i, "") || "deck-import";
			const res = await loadDeckCardsFromYdkFile(file);
			if (!res) {
				setStatus(
					"La importación de mazos solo funciona en Tauri (no en modo web). ",
				);
				return;
			}
			if (typeof res === "string") {
				throw new Error(res);
			}

			const uniqueIds = new Set(res.ids).size;
			const sample = res.cards.slice(0, 8).map((c) => c.name);
			setLastResult({
				totalIds: res.ids.length,
				totalCards: res.cards.length,
				uniqueIds,
				sample,
			});
			const exportables = res.cards;
			setCards(exportables);
			if (selectedCardKey) {
				const hasSelectedCard = exportables.some(
					(card) => getCardKey(card) === selectedCardKey,
				);
				if (!hasSelectedCard) {
					setSelectedCardKey(null);
					persistSelectedCardKey(null);
				}
			}

			setStatus(
				`Cargadas ${exportables.length} cartas. Iniciando exportación...`,
			);
			await exportCardsSequentially(exportables, deckFolderName);
		} catch (err) {
			setStatus(
				err instanceof Error ? err.message : "No se pudo cargar el mazo.",
			);
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
							<div className="font-medium">Procesando mazo…</div>
							{progress ? (
								<div className="mt-2 text-sm text-muted-foreground">
									{progress.current}/{progress.total}
									{progress.failures ? ` (${progress.failures} fallidas)` : ""}
								</div>
							) : null}
							{status ? (
								<div className="mt-2 text-sm text-muted-foreground">
									{status}
								</div>
							) : null}
							<div className="mt-3 text-xs text-muted-foreground">
								La interfaz queda bloqueada hasta que finalice la exportación.
							</div>
						</div>
					</div>
				</div>
			) : null}

			<Card className="w-full">
				<CardHeader>
					<CardTitle>Importar mazo (.ydk)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="deck-ydk">
							Archivo del mazo
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
								Limpiar
							</Button>
						</div>
						{file ? (
							<div className="text-xs text-muted-foreground">
								Seleccionado: {file.name}
							</div>
						) : null}
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="deck-box-color">
							Color del recuadro de descripción/estadísticas
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
								<SelectValue placeholder="Selecciona un color" />
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

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="deck-img-rotation">
							Rotación de imagen (°)
						</label>
						<Input
							id="deck-img-rotation"
							type="number"
							inputMode="numeric"
							value={String(cardDraftSignal.value.imgRotationDeg ?? 0)}
							onInput={(e) => {
								const raw = e.currentTarget.value;
								const parsed = Number.parseFloat(raw);
								cardDraftSignal.value = {
									...cardDraftSignal.value,
									imgRotationDeg: Number.isFinite(parsed) ? parsed : 0,
								};
							}}
						/>
					</div>

					<div className="space-y-2">
						<label
							className="text-sm font-medium"
							htmlFor="deck-description-opacity"
						>
							Opacidad de la imagen de descripción
						</label>
						<Select
							value={
								cardDraftSignal.value.descriptionImageOpacity === undefined
									? "auto"
									: String(cardDraftSignal.value.descriptionImageOpacity)
							}
							onValueChange={(value: string) => {
								if (value === "auto") {
									cardDraftSignal.value = {
										...cardDraftSignal.value,
										descriptionImageOpacity: undefined,
									};
									return;
								}
								const parsed = Number.parseFloat(value);
								cardDraftSignal.value = {
									...cardDraftSignal.value,
									descriptionImageOpacity: Number.isFinite(parsed)
										? parsed
										: undefined,
								};
							}}
						>
							<SelectTrigger id="deck-description-opacity" className="w-full">
								<SelectValue placeholder="Opacidad" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">Automático</SelectItem>
								<SelectItem value="0">0%</SelectItem>
								<SelectItem value="0.25">25%</SelectItem>
								<SelectItem value="0.5">50%</SelectItem>
								<SelectItem value="0.75">75%</SelectItem>
								<SelectItem value="1">100%</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							onClick={run}
							disabled={!file || running || locked}
						>
							{running ? "Ejecutando..." : "Ejecutar y exportar"}
						</Button>
						{status ? (
							<div className="text-sm text-muted-foreground">{status}</div>
						) : null}
					</div>

					{lastResult ? (
						<div className="space-y-1 text-sm">
							<div>
								Cartas cargadas: {lastResult.totalCards} (entradas del mazo:
								{lastResult.totalIds}, IDs únicos: {lastResult.uniqueIds})
							</div>
						</div>
					) : null}
					{cards.length ? (
						<div
							ref={cardsListRef}
							onScroll={(e) => {
								persistCardsScrollTop(e.currentTarget.scrollTop);
							}}
							className="text-xs flex-1 max-h-[30dvh] overflow-auto flex flex-col gap-4"
						>
							{cards.map((c) => (
								<button
									key={getCardKey(c)}
									data-card-key={getCardKey(c)}
									type="button"
									onClick={() => void selectCardForPreview(c, getCardKey(c))}
									className={`flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors ${
										selectedCardKey === getCardKey(c)
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
