import { CardMakerForm } from "@/pages/card-maker/component/card-maker-form";
import { CardPreviewWrapper } from "@/pages/card-maker/component/card-preview-wrapper";
import { DeckImporterForm } from "@/pages/card-maker/component/deck-importer-form";
import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "preact/hooks";
import type { MonsterTypeIconProfile, YugiohCardDraft } from "@/lib/types";
import { cardDraftSignal, resetCardDraft } from "@/pages/card-maker/state";
import { downloadImageBlob } from "@/lib/tauri/download-image";
import type { CardMakerFormExportOptions } from "@/pages/card-maker/component/card-maker-form";
import { openPath } from "@tauri-apps/plugin-opener";
import { getCardMakerImagesDir } from "@/lib/tauri/card-maker-images";
import { Skeleton } from "@/components/ui/skeleton";
import { preloadCardMakerTemplateImages } from "@/pages/card-maker/preload-card-templates";

function CardMakerView() {
	const [tab, setTab] = useState<"maker" | "deck">("maker");
	const [cards, setCards] = useState<
		(Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string })[]
	>([]);
	const [selectedImportedCardKey, setSelectedImportedCardKey] = useState<
		string | null
	>(null);
	const [deckFileName, setDeckFileName] = useState<string | null>(null);
	const [importedExportOptions, setImportedExportOptions] =
		useState<CardMakerFormExportOptions | null>(null);
	const [deckResetNonce, setDeckResetNonce] = useState(0);

	const getImportedCardId = (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
	) => String(card.id);

	const getDeckFolderName = (fileName: string | null) => {
		if (!fileName) return null;
		return fileName.replace(/\.ydk$/i, "") || "deck-import";
	};

	const onImportedCardSelected = (cardId: string | null) => {
		setSelectedImportedCardKey(cardId);
		if (!cardId) {
			setImportedExportOptions(null);
			return;
		}
		setImportedExportOptions({
			id: cardId,
			folderName: getDeckFolderName(deckFileName) || undefined,
		});
	};

	const onDeckFileNameChange = (fileName: string | null) => {
		setDeckFileName(fileName);
		if (!selectedImportedCardKey) return;
		setImportedExportOptions((prev) => ({
			id: prev?.id ?? selectedImportedCardKey,
			folderName: getDeckFolderName(fileName) || undefined,
		}));
	};

	const loadImportedCardIntoDraft = async (
		card: Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string },
		cardId: string,
	) => {
		const currentDraft = cardDraftSignal.value;
		onImportedCardSelected(cardId);
		setTab("maker");

		let img: Blob | string | null = null;
		try {
			const blob = await downloadImageBlob(card.imgUrl);
			img = blob ?? null;
			if (!img) throw new Error("No se pudo descargar la imagen");
		} catch {
			img = card.imgUrl;
		}

		cardDraftSignal.value = {
			name: card.name,
			cardType: card.cardType,
			iconProfile: currentDraft.iconProfile ?? "light",
			showDescription: currentDraft.showDescription ?? true,
			showName: currentDraft.showName ?? true,
			showNameBox: currentDraft.showNameBox ?? false,
			showStatsBox: currentDraft.showStatsBox ?? true,
			pendulumDescription: card.pendulumDescription ?? "",
			description: card.description,
			descriptionTextColor: currentDraft.descriptionTextColor ?? "auto",
			descriptionTextSize: currentDraft.descriptionTextSize ?? "normal",
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
			overframe: currentDraft.overframe ?? false,
			fullArt: currentDraft.fullArt ?? false,
			overframeImg: null,
			img,
		};
	};

	const onResetAll = () => {
		resetCardDraft();
		setCards([]);
		setSelectedImportedCardKey(null);
		setImportedExportOptions(null);
		setDeckFileName(null);
		setDeckResetNonce((n) => n + 1);
	};

	const onOpenImportedCardsFolder = async () => {
		try {
			const folderName = getDeckFolderName(deckFileName) || undefined;
			const dir = await getCardMakerImagesDir({ folderName });
			if (!dir) return;
			await openPath(dir);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-col gap-4 md:flex-row">
				<div className="w-full md:w-auto md:flex-none space-y-4">
					<CardPreviewWrapper />
					{cards.length ? (
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Cartas importadas</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-xs flex-1 max-h-[30dvh] overflow-auto flex flex-col gap-4">
									{cards.map((c) => {
										const cardId = getImportedCardId(c);
										return (
											<button
												key={cardId}
												type="button"
												onClick={() =>
													void loadImportedCardIntoDraft(c, cardId)
												}
												className={`flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors ${
													selectedImportedCardKey === cardId
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
								<div className="mt-3 flex justify-end">
									<Button
										type="button"
										variant="frame"
										onClick={() => void onOpenImportedCardsFolder()}
									>
										Abrir carpeta
									</Button>
								</div>
							</CardContent>
						</Card>
					) : null}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<div className="inline-flex w-fit items-center rounded-md border p-1">
							<Button
								type="button"
								variant="frame"
								onClick={() => setTab("maker")}
							>
								Creador de cartas
							</Button>
							<Button
								type="button"
								variant="frame"
								onClick={() => setTab("deck")}
							>
								Importar mazo
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm font-medium" htmlFor="icon-profile">
								Perfil
							</label>
							<Select
								value={cardDraftSignal.value.iconProfile ?? "light"}
								onValueChange={(value: string) => {
									cardDraftSignal.value = {
										...cardDraftSignal.value,
										iconProfile: value as MonsterTypeIconProfile,
									};
								}}
							>
								<SelectTrigger id="icon-profile" className="w-40">
									<SelectValue placeholder="Selecciona un perfil" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Claro</SelectItem>
									<SelectItem value="dark">Oscuro</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					{tab === "maker" ? (
						<CardMakerForm
							onReset={onResetAll}
							exportOptions={importedExportOptions}
						/>
					) : (
						<div className="min-w-0">
							<DeckImporterForm
								cards={cards}
								setCards={setCards}
								resetNonce={deckResetNonce}
								onDeckFileNameChange={onDeckFileNameChange}
								onImportedCardSelected={onImportedCardSelected}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function CardMaker() {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void preloadCardMakerTemplateImages().finally(() => {
			if (cancelled) return;
			setIsReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!isReady) {
		return (
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full flex-col gap-4 md:flex-row">
					<div className="w-full md:w-105 md:flex-none space-y-4">
						<Skeleton className="w-full aspect-63/88" />
						<Skeleton className="w-full h-40" />
					</div>
					<div className="min-w-0 flex-1 space-y-4">
						<Skeleton className="w-64 h-9" />
						<Skeleton className="w-full h-[60dvh]" />
					</div>
				</div>
			</div>
		);
	}

	return <CardMakerView />;
}
