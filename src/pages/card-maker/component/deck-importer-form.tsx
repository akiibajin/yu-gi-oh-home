import {
	type Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";

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
import { exportPreview } from "@/lib/export-card";
import { loadDeckCardsFromYdkFile } from "@/lib/tauri/decks";
import { downloadImageBlob } from "@/lib/tauri/download-image";
import type {
	YugiohCardDraft,
} from "@/lib/types";
import useCardStore from "@/pages/card-maker/state";
import { Label } from "@/components/ui/warcraftcn/label";

interface DeckImporterFormProps {
	cards: (Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string })[];
	setCards: Dispatch<
		SetStateAction<
			(Omit<YugiohCardDraft, "img"> & {
				imgUrl: string;
				id: string;
			})[]
		>
	>;
	resetNonce?: number;
	onDeckFileNameChange?: (fileName: string | null) => void;
	onImportedCardSelected?: (cardKey: string | null) => void;
}
export function DeckImporterForm(props: DeckImporterFormProps) {
	const DECK_SELECTED_CARD_KEY_STORAGE = "card-maker.deck.selected-card-key";
	const DECK_SCROLL_TOP_STORAGE = "card-maker.deck.cards-scroll-top";

	const {
		cards,
		setCards,
		resetNonce,
		onDeckFileNameChange,
		onImportedCardSelected,
  } = props;
  const card = useCardStore().card;
  const setCard = useCardStore().setCard
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

	const getImportedCardId = (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
	) => String(card.id);

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
		if (resetNonce === undefined) return;
		setFile(null);
		setRunning(false);
		setLocked(false);
		setProgress(undefined);
		setStatus("");
		setLastResult(undefined);
		setSelectedCardKey(null);
		persistSelectedCardKey(null);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(DECK_SCROLL_TOP_STORAGE);
		}
		setCards([]);
		onDeckFileNameChange?.(null);
		onImportedCardSelected?.(null);
	}, [resetNonce]);

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

		await new Promise<void>((r) => requestAnimationFrame(() => r()));
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
			await sleep(100);
		}
	};

	const selectCardForPreview = async (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
		cardId: string,
	) => {
		setSelectedCardKey(cardId);
		persistSelectedCardKey(cardId);
		onImportedCardSelected?.(cardId);

		let img: Blob | string | null = null;
		try {
			img = (await fetchCardImageBlob(card.imgUrl)) ?? null;
		} catch {
			img = card.imgUrl;
		}
    setCard({
			name: card.name,
			cardType: card.cardType,
			iconProfile: card.iconProfile ?? "light",
			showDescription: card.showDescription ?? true,
			showName: card.showName ?? true,
			showNameBox: card.showNameBox ?? false,
			pendulumDescription: card.pendulumDescription ?? "",
			description: card.description,
			descriptionTextColor: card.descriptionTextColor ?? "auto",
			descriptionTextSize: card.descriptionTextSize ?? "normal",
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
			linkMarkersOnDescription: card.linkMarkersOnDescription ?? false,
			descriptionStatsBoxColor: card.descriptionStatsBoxColor ?? "auto",
			objectFit: card.objectFit,
			imgRotationDeg: card.imgRotationDeg ?? 0,
			descriptionImageOpacity: card.descriptionImageOpacity,
			template: card.template,
			overframe: card.overframe ?? false,
			fullArt: card.fullArt ?? false,
			overframeImg: null,
			img,
		});
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
      let imgBlob: Blob | null = null;
				try {
					imgBlob = await fetchCardImageBlob(c.imgUrl);
				} catch (err) {
					failures++;
					setProgress({ current: i + 1, total: list.length, failures });
					setStatus(
						`Falló la imagen ${i + 1}/${list.length}: ${c.name} (omitida)`,
					);
					console.error(err);
					continue;
				}

			try {
        setCard({
					name: c.name,
					cardType: c.cardType,
					iconProfile: card.iconProfile ?? "light",
					showDescription: card.showDescription ?? true,
					showName: card.showName ?? true,
					showNameBox: card.showNameBox ?? false,
					pendulumDescription: c.pendulumDescription ?? "",
					description: c.description,
					descriptionTextColor: card.descriptionTextColor ?? "auto",
					descriptionTextSize: card.descriptionTextSize ?? "normal",
					attribute: c.attribute,
					monsterType: c.monsterType,
					subType: c.subType,
					isTuner: c.isTuner,
					scale: c.scale,
					linkRating: c.linkRating,
					linkMarkersOnDescription:
						card.linkMarkersOnDescription ?? false,
					linkMarkers: c.linkMarkers,
					stats: c.stats,
					spellType: c.spellType,
					trapType: c.trapType,
					descriptionStatsBoxColor:
						card.descriptionStatsBoxColor ?? "auto",
					objectFit: card.objectFit,
					imgRotationDeg: card.imgRotationDeg ?? 0,
					descriptionImageOpacity: card.descriptionImageOpacity,
					template: card.template,
					overframe: card.overframe ?? false,
					fullArt: card.fullArt ?? false,
					overframeImg: null,
					img: imgBlob,
					});

				await waitForPreviewReady(Boolean(imgBlob));
				// Import export goes to: card-maker-ims/<deck>/<cardId>.webp
				await exportPreview(card, {
					id: getImportedCardId(c),
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

		const deckFolderName = file.name.replace(/\.ydk$/i, "") || "deck-import";

		setRunning(true);
		setLocked(true);
		setProgress(undefined);
		setStatus("Cargando mazo...");
		setLastResult(undefined);
		setCards([]);
		try {
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
				const hasSelectedCard = exportables.some((card) => {
					return getImportedCardId(card) === selectedCardKey;
				});
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
				<CardContent className="space-y-4 pl-6 pr-10 pb-6">
					<div className="space-y-2">
						<Label className="text-sm font-medium" htmlFor="deck-ydk">
							Archivo del mazo
						</Label>
						<div className="flex items-center gap-2">
							<Input
								key={resetNonce ?? 0}
								id="deck-ydk"
								type="file"
								accept=".ydk"
								onChange={(e) => {
									const f = e.currentTarget.files?.[0] ?? null;
									setFile(f);
									onDeckFileNameChange?.(f?.name ?? null);
									setStatus("");
									setLastResult(undefined);
								}}
							/>
							<Button
								type="button"
								variant="frame"
								onClick={() => {
									setFile(null);
									onDeckFileNameChange?.(null);
									setStatus("");
									setLastResult(undefined);
                }}
								className="px-3 py-2"
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
						<Label
							className="text-sm font-medium"
							htmlFor="deck-description-opacity"
						>
							Opacidad de la imagen de descripción
						</Label>
						<Select
							value={
								card.descriptionImageOpacity === undefined
									? "auto"
									: String(card.descriptionImageOpacity)
							}
							onValueChange={(value: string) => {
								if (value === "auto") {
									setCard({
										...card,
										descriptionImageOpacity: undefined,
									});
									return;
								}
								const parsed = Number.parseFloat(value);
								setCard({
									...card,
									descriptionImageOpacity: Number.isFinite(parsed)
										? parsed
										: undefined,
								});
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

					<div className="space-y-2">
						<Label className="text-sm font-medium" htmlFor="deck-export-format">
							Formato de exportación
						</Label>
						<Select
							value={card.exportFormat ?? "webp"}
							onValueChange={(value: string) => {
								setCard({
									...card,
									exportFormat: value as "webp" | "png" | "jpg",
								});
							}}
						>
							<SelectTrigger id="deck-export-format" className="w-full">
								<SelectValue placeholder="Selecciona un formato" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="webp">WebP</SelectItem>
								<SelectItem value="png">PNG</SelectItem>
								<SelectItem value="jpg">JPG</SelectItem>
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
							{cards.map((c) => {
								const cardId = getImportedCardId(c);
								return (
									<button
										key={cardId}
										data-card-key={cardId}
										type="button"
										onClick={() => void selectCardForPreview(c, cardId)}
										className={`flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors ${
											selectedCardKey === cardId
												? "border-primary bg-accent/40"
												: "border-border hover:border-muted-foreground/60"
										}`}
									>
										<img className="size-8" src={c.imgUrl} alt={c.name} />
										<span className="truncate">{c.name}</span>
									</button>
								);
							})}
						</div>
					) : null}
				</CardContent>
			</Card>
		</>
	);
}
