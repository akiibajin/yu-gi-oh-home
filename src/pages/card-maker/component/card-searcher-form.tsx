import { useEffect, useRef, useState } from "preact/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	fetchYgoprodeckCardInfo,
	type YgoprodeckCard,
} from "@/lib/tauri/ygoprodeck";
import { fetchWikiCardData, fetchSpanishNameAndLore, type WikiCardData } from "@/lib/tauri/fandom";
import { downloadImageBlob } from "@/lib/tauri/download-image";
import { canInvokeTauri } from "@/lib/tauri/can-invoke-tauri";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { cn } from "@/lib/utils";
import type {
	YugiohCardAttribute,
	YugiohCardType,
	YugiohMonsterType,
	MonsterType,
	YugiohSpellType,
	YugiohTrapType,
	LinkMarker,
} from "@/lib/types";

const MAX_RESULTS = 8;

function mapApiTypeToCardType(apiType: string, race?: string): YugiohCardType {
	if (apiType === "Spell Card" && race === "Field") return "Field";
	if (apiType === "Spell Card") return "Spell";
	if (apiType === "Trap Card") return "Trap";
	return "Monster";
}

function mapApiTypeToMonsterType(apiType: string): YugiohMonsterType | undefined {
	const t = apiType.toLowerCase();
	if (t.includes("pendulum")) {
		if (t.includes("fusion")) return "Pendulum Fusion";
		if (t.includes("synchro")) return "Pendulum Synchro";
		if (t.includes("xyz")) return "Pendulum Xyz";
		if (t.includes("ritual")) return "Pendulum Ritual";
		if (t.includes("normal")) return "Pendulum Normal";
		return "Pendulum Effect";
	}
	if (t.includes("link")) return "Link";
	if (t.includes("xyz")) return "Xyz";
	if (t.includes("synchro")) return "Synchro";
	if (t.includes("fusion")) return "Fusion";
	if (t.includes("ritual")) return "Ritual";
	if (t.includes("normal")) return "Normal";
	if (t.includes("gemini")) return "Gemini";
	if (t.includes("spirit")) return "Spirit";
	if (t.includes("token")) return "Token";
	return "Effect";
}

function mapApiSpellType(race: string): YugiohSpellType | undefined {
	const map: Record<string, YugiohSpellType> = {
		Normal: "Normal",
		Continuous: "Continuous",
		Equip: "Equip",
		"Quick-Play": "Quick-Play",
		Ritual: "Ritual",
		Field: "Normal",
	};
	return map[race];
}

function mapApiTrapType(race: string): YugiohTrapType | undefined {
	const map: Record<string, YugiohTrapType> = {
		Normal: "Normal",
		Continuous: "Continuous",
		Counter: "Counter",
	};
	return map[race];
}

function mapLinkMarkers(markers: string[]): LinkMarker[] {
	const valid = new Set<string>([
		"Top",
		"Bottom-Left",
		"Bottom",
		"Bottom-Right",
		"Left",
		"Right",
		"Top-Left",
		"Top-Right",
	]);
	return markers.filter((m) => valid.has(m)) as LinkMarker[];
}

function parseDescription(desc: string): {
	monsterDescription: string;
	pendulumDescription: string;
} {
	const pendulumMatch = desc.match(
		/\[\s*Pendulum Effect\s*\]\s*\n([\s\S]*?)(?:\n\s*\n|\n\[)/i,
	);
	const monsterMatch = desc.match(
		/\[\s*Monster Effect\s*\]\s*\n([\s\S]*?)$/i,
	);
	if (pendulumMatch && monsterMatch) {
		return {
			pendulumDescription: pendulumMatch[1].trim(),
			monsterDescription: monsterMatch[1].trim(),
		};
	}
	return { monsterDescription: desc.trim(), pendulumDescription: "" };
}

async function fetchImageAsBlob(url: string): Promise<Blob | null> {
	if (canInvokeTauri()) {
		const blob = await downloadImageBlob(url);
		return blob ?? null;
	}
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		return await res.blob();
	} catch {
		return null;
	}
}

export function CardSearcherForm() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<YgoprodeckCard[]>([]);
	const [loading, setLoading] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<YgoprodeckCard | null>(null);
	const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
		null,
	);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [applying, setApplying] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [wikiName, setWikiName] = useState("");
	const [wikiLoading, setWikiLoading] = useState(false);
	const [wikiError, setWikiError] = useState<string | null>(null);
	const [wikiPreviewUrl, setWikiPreviewUrl] = useState<string | null>(null);
	const [wikiCardData, setWikiCardData] = useState<WikiCardData | null>(null);
	const [useAnimeEffect, setUseAnimeEffect] = useState(false);

	const doSearch = async () => {
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			setResults([]);
			setDropdownOpen(false);
			return;
		}

		setLoading(true);
		try {
			const res = await fetchYgoprodeckCardInfo({ fname: trimmed });
			const cards = res?.data ?? [];
			setResults(cards.slice(0, MAX_RESULTS));
			setDropdownOpen(cards.length > 0);
		} catch {
			setResults([]);
			setDropdownOpen(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectFromDropdown = (card: YgoprodeckCard) => {
		setDropdownOpen(false);
		setSelectedCard(card);
		setSelectedImageIndex(0);
		setSelectedPreviewUrl(card.card_images?.[0]?.image_url_cropped ?? card.card_images?.[0]?.image_url ?? null);
	};

	const applyCard = async () => {
		const card = selectedCard;
		if (!card) return;

		setApplying(true);
		try {
			const currentDraft = cardDraftSignal.value;
			const cardType = mapApiTypeToCardType(card.type ?? "", card.race ?? "");
			const monsterType =
				cardType === "Monster"
					? mapApiTypeToMonsterType(card.type ?? "")
					: undefined;
			const isPendulum = monsterType?.includes("Pendulum") ?? false;

			const { monsterDescription, pendulumDescription } = parseDescription(
				card.desc ?? "",
			);

			const selectedImg = card.card_images?.[selectedImageIndex] ?? card.card_images?.[0];
			const imgUrl = selectedImg?.image_url_cropped ?? selectedImg?.image_url ?? card.card_images?.[0]?.image_url_cropped ?? card.card_images?.[0]?.image_url ?? null;
			let img: Blob | string | null = null;
			if (imgUrl) {
				img = (await fetchImageAsBlob(imgUrl)) ?? imgUrl;
			}

			const englishName = card.name ?? "";
			cardDraftSignal.value = {
				...currentDraft,
				name: englishName,
				cardType,
				attribute:
					(card.attribute as YugiohCardAttribute) ?? currentDraft.attribute,
				monsterType,
				subType: card.race as MonsterType | undefined,
				isTuner:
					monsterType === undefined &&
					card.type?.toLowerCase().includes("tuner")
						? true
						: currentDraft.isTuner,
				scale: card.scale ?? currentDraft.scale,
				linkRating: card.linkval ?? currentDraft.linkRating,
				linkMarkers: card.linkmarkers
					? mapLinkMarkers(card.linkmarkers)
					: currentDraft.linkMarkers,
				stats: {
					level: card.level ?? currentDraft.stats.level,
					atk: card.atk ?? currentDraft.stats.atk,
					def: card.def ?? currentDraft.stats.def,
				},
				spellType:
					cardType === "Spell"
						? mapApiSpellType(card.race ?? "")
						: currentDraft.spellType,
				trapType:
					cardType === "Trap"
						? mapApiTrapType(card.race ?? "")
						: currentDraft.trapType,
				description: isPendulum ? monsterDescription : (card.desc ?? ""),
				pendulumDescription: isPendulum ? pendulumDescription : "",
				descriptionStatsBoxColor: currentDraft.descriptionStatsBoxColor,
				img,
			};

			try {
				const es = await fetchSpanishNameAndLore(englishName);
				if (es) {
					const prev = cardDraftSignal.value;
					cardDraftSignal.value = {
						...prev,
						name: es.name,
						description: es.lore,
						pendulumDescription:
						  isPendulum
								? es.pendulum_effect ?? prev.pendulumDescription
								: "",
					};
				}
			} catch {
				// Translation failed; keep English text.
			}
		} finally {
			setApplying(false);
		}
	};

	const fetchFromWiki = async () => {
		const name = wikiName.trim();
		if (!name) return;

		const slug = name.replace(/ /g, "_");
		const url = `https://yugioh.fandom.com/es/wiki/${encodeURIComponent(slug)}`;

		setWikiLoading(true);
		setWikiError(null);
		setWikiCardData(null);
		setWikiPreviewUrl(null);
		setUseAnimeEffect(false);

		try {
			const data = await fetchWikiCardData(url);
			if (!data) {
				setWikiError("No se pudo obtener datos de la wiki.");
				return;
      }
			console.log({ data })
			setWikiCardData(data);
			setWikiPreviewUrl(data.image_url ?? null);
		} catch (e) {
			setWikiError(e instanceof Error ? e.message : "Error al conectar con la wiki.");
		} finally {
			setWikiLoading(false);
		}
	};

	const applyWikiCard = async () => {
		const data = wikiCardData;
		if (!data) return;

		setApplying(true);
		try {
			const currentDraft = cardDraftSignal.value;
			const cardType: YugiohCardType =
				data.card_type === "Spell"
					? "Spell"
					: data.card_type === "Trap"
						? "Trap"
						: data.card_type === "Field"
							? "Field"
							: "Monster";

			const isPendulum = data.card_type?.includes("Pendulum") ?? false;
			const isEffect = data.card_type?.includes("Effect") ?? false;
			const isFusion = data.card_type?.includes("Fusion") ?? false;
			const isSynchro = data.card_type?.includes("Synchro") ?? false;
			const isXyz = data.card_type?.includes("Xyz") ?? false;
			const isLink = data.card_type?.includes("Link") ?? false;
      const isRitual = data.card_type?.includes("Ritual") ?? false;
			const isToken = data.card_type?.includes("Token") ?? false;

			const attributeMap: Record<string, YugiohCardAttribute> = {
				DARK: "DARK",
				OSCURIDAD: "DARK",
				LIGHT: "LIGHT",
				LUZ: "LIGHT",
				EARTH: "EARTH",
				TIERRA: "EARTH",
				WATER: "WATER",
				AGUA: "WATER",
				FIRE: "FIRE",
				FUEGO: "FIRE",
				WIND: "WIND",
				VIENTO: "WIND",
				DIVINE: "DIVINE",
				DIVINIDAD: "DIVINE",
			};

			const attribute = data.attribute
				? (attributeMap[data.attribute.toUpperCase()] ?? currentDraft.attribute)
				: currentDraft.attribute;

			const level = data.level ? Number.parseInt(data.level, 10) : currentDraft.stats.level;
			const atk = data.atk ?? currentDraft.stats.atk;
			const def = data.def ?? currentDraft.stats.def;
			const scale = data.scale
				? Number.parseInt(data.scale, 10)
				: currentDraft.scale;

			let img: Blob | string | null = null;
			if (data.image_url) {
				img = (await fetchImageAsBlob(data.image_url)) ?? data.image_url;
			}

			const description = useAnimeEffect
				? (data.anime_effect ?? data.description ?? currentDraft.description)
				: (data.description ?? currentDraft.description);
			const pendulumEffect = data.pendulum_effect ?? currentDraft.pendulumDescription;

			const subTypeMap: Record<string, MonsterType> = {
				"Dragón": "Dragon",
				"Dragon": "Dragon",
				"Lanzador de Conjuros": "Spellcaster",
				"Spellcaster": "Spellcaster",
				"Guerrero": "Warrior",
				"Warrior": "Warrior",
				"Bestia": "Beast",
				"Beast": "Beast",
				"Bestia Alada": "Winged Beast",
				"Winged Beast": "Winged Beast",
				"Máquina": "Machine",
				"Machine": "Machine",
				"Demonio": "Fiend",
				"Fiend": "Fiend",
				"Fairy": "Fairy",
				"Hada": "Fairy",
				"Zombie": "Zombie",
				"Insecto": "Insect",
				"Insect": "Insect",
				"Reptil": "Reptile",
				"Reptile": "Reptile",
				"Pez": "Fish",
				"Fish": "Fish",
				"Serpiente Mariana": "Sea Serpent",
				"Sea Serpent": "Sea Serpent",
				"Roca": "Rock",
				"Rock": "Rock",
				"Planta": "Plant",
				"Plant": "Plant",
				"Piro": "Pyro",
				"Pyro": "Pyro",
				"Trueno": "Thunder",
				"Thunder": "Thunder",
				"Aqua": "Aqua",
				"Psiquico": "Psychic",
				"Psychic": "Psychic",
				"Wyrm": "Wyrm",
				"Ciberso": "Cyberse",
				"Cyberse": "Cyberse",
				"Dinosaurio": "Dinosaur",
        "Dinosaur": "Dinosaur",
				"Bestia divina": "Divine-Beast"
			};

			const spellTypeMap: Record<string, YugiohSpellType> = {
				"Normal": "Normal",
				"Continua": "Continuous",
				"Equipamiento": "Equip",
				"Equip": "Equip",
				"Rápida": "Quick-Play",
				"De juego rápido": "Quick-Play",
				"Quick-Play": "Quick-Play",
				"Ritual": "Ritual",
				"Campo": "Normal",
        "Field": "Normal",
			};

			const trapTypeMap: Record<string, YugiohTrapType> = {
				"Normal": "Normal",
				"Continua": "Continuous",
				"Continuous": "Continuous",
				"Contadora": "Counter",
				"Counter": "Counter",
			};

      const monsterTypeMap = (): YugiohMonsterType | undefined => {
				if (isPendulum) {
					if (isFusion) return "Pendulum Fusion";
					if (isSynchro) return "Pendulum Synchro";
					if (isXyz) return "Pendulum Xyz";
					if (isRitual) return "Pendulum Ritual";
					return "Pendulum Effect";
				}
				if (isLink) return "Link";
				if (isXyz) return "Xyz";
				if (isSynchro) return "Synchro";
				if (isFusion) return "Fusion";
				if (isRitual) return "Ritual";
        if (isEffect) return "Effect";
        if (isToken) return "Token";
			return "Normal";
			};

			cardDraftSignal.value = {
				...currentDraft,
				name: data.name ?? currentDraft.name,
				cardType,
				attribute,
				monsterType:
					cardType === "Monster"
						? monsterTypeMap()
						: currentDraft.monsterType,
				subType:
					cardType === "Monster" && data.race
						? (subTypeMap[data.race] ?? data.race as MonsterType)
						: currentDraft.subType,
				spellType:
					cardType === "Spell" && data.card_sub_type
						? (spellTypeMap[data.card_sub_type] ?? currentDraft.spellType)
						: currentDraft.spellType,
				trapType:
					cardType === "Trap" && data.card_sub_type
						? (trapTypeMap[data.card_sub_type] ?? currentDraft.trapType)
						: currentDraft.trapType,
				description,
				pendulumDescription: isPendulum ? pendulumEffect : currentDraft.pendulumDescription,
				stats: {
					level: isNaN(level) ? currentDraft.stats.level : level,
					atk: atk ?? currentDraft.stats.atk,
					def: def ?? currentDraft.stats.def,
				},
				scale: isNaN(scale as number) ? currentDraft.scale : scale,
				img,
			};
		} finally {
			setApplying(false);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Buscar carta</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div ref={containerRef} className="relative">
					<div className="flex gap-2">
						<Input
							type="text"
							value={query}
							onInput={(e) => setQuery(e.currentTarget.value)}
							onFocus={() => {
								if (results.length > 0) setDropdownOpen(true);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") setDropdownOpen(false);
								if (e.key === "Enter") {
									e.preventDefault();
									void doSearch();
								}
							}}
							placeholder="Buscar carta por nombre en inglés..."
							className="w-full"
						/>
						<Button
							type="button"
							onClick={() => void doSearch()}
							disabled={loading || query.trim().length < 2}
						>
							{loading ? (
								<span className="flex items-center gap-1.5">
									<span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
									<span>Buscando</span>
								</span>
							) : (
								"Buscar"
							)}
						</Button>
					</div>
					{dropdownOpen && results.length > 0 ? (
						<div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover p-1 shadow-md">
							{results.map((card) => (
								<button
									key={card.id}
									type="button"
									className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer"
									onClick={() => selectFromDropdown(card)}
								>
									{card.card_images?.[0]?.image_url_small ? (
										<img
											src={card.card_images[0].image_url_small}
											alt={card.name}
											className="size-8 rounded object-cover"
											loading="lazy"
										/>
									) : null}
									<div className="flex flex-col min-w-0">
										<span className="truncate font-medium">{card.name}</span>
										<span className="text-xs text-muted-foreground truncate">
											{card.type}
											{card.attribute ? ` · ${card.attribute}` : ""}
											{card.atk !== undefined && card.atk !== null
												? ` · ATK/${card.atk}`
												: ""}
											{card.def !== undefined && card.def !== null
												? ` DEF/${card.def}`
												: ""}
										</span>
									</div>
								</button>
							))}
						</div>
					) : null}
				</div>

				{selectedCard ? (
					<div className="flex flex-col items-center gap-3 rounded-md border p-4">
						{selectedPreviewUrl ? (
							<img
								src={selectedPreviewUrl}
								alt={selectedCard.name}
								className="w-40 rounded-md shadow-md"
							/>
						) : null}
						{selectedCard.card_images && selectedCard.card_images.length > 1 ? (
							<div className="flex flex-wrap justify-center gap-2">
								{selectedCard.card_images.map((img, idx) => {
									const thumb = img.image_url_small ?? img.image_url_cropped ?? img.image_url;
									const preview = img.image_url_cropped ?? img.image_url;
									return (
										<button
											key={idx}
											type="button"
											onClick={() => {
												setSelectedImageIndex(idx);
												setSelectedPreviewUrl(preview ?? null);
											}}
											className={cn(
												"rounded border p-0.5 transition",
												selectedImageIndex === idx
													? "border-primary ring-1 ring-primary"
													: "border-transparent hover:border-muted-foreground/50",
											)}
										>
											<img
												src={thumb}
												alt={`${selectedCard.name} variante ${idx + 1}`}
												className="size-12 rounded object-cover"
												loading="lazy"
											/>
										</button>
									);
								})}
							</div>
						) : null}
						<div className="text-center">
							<div className="font-medium">{selectedCard.name}</div>
							<div className="text-sm text-muted-foreground">
								{selectedCard.type}
								{selectedCard.attribute ? ` · ${selectedCard.attribute}` : ""}
								{selectedCard.race ? ` · ${selectedCard.race}` : ""}
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								{selectedCard.atk !== undefined && selectedCard.atk !== null
									? `ATK/${selectedCard.atk}`
									: ""}
								{selectedCard.def !== undefined && selectedCard.def !== null
									? ` DEF/${selectedCard.def}`
									: ""}
								{selectedCard.level
									? ` · Nivel ${selectedCard.level}`
									: ""}
								{selectedCard.linkval
									? ` · Enlace ${selectedCard.linkval}`
									: ""}
								{selectedCard.scale !== undefined && selectedCard.scale !== null
									? ` · Escala ${selectedCard.scale}`
									: ""}
							</div>
						</div>
						<Button
							type="button"
							onClick={() => void applyCard()}
							disabled={applying}
						>
							{applying ? "Aplicando..." : "Usar esta carta"}
						</Button>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-muted-foreground">
						<div className="text-sm">
							Escribe el nombre de una carta para buscarla
						</div>
						<div className="text-xs">
							Se autocompletarán los campos de la carta al seleccionar un
							resultado
						</div>
					</div>
				)}

				<div className="border-t pt-4">
					<div className="text-sm font-medium mb-2">Buscar en Wiki Fandom</div>
					<div className="flex gap-2">
						<Input
							type="text"
							value={wikiName}
							onInput={(e) => setWikiName(e.currentTarget.value)}
							placeholder="Nombre de la carta en español..."
							className="flex-1"
							disabled={wikiLoading}
						/>
						<Button
							type="button"
							onClick={() => void fetchFromWiki()}
							disabled={wikiLoading || !wikiName.trim()}
						>
							{wikiLoading ? "Cargando..." : "Obtener"}
						</Button>
					</div>
					{wikiError ? (
						<div className="mt-2 text-xs text-red-500">{wikiError}</div>
					) : null}
					{wikiCardData ? (
						<div className="mt-3 flex flex-col items-center gap-2 rounded-md border p-3">
							{wikiPreviewUrl ? (
								<img
									src={wikiPreviewUrl}
									alt={wikiCardData.name ?? "Carta"}
									className="w-32 rounded shadow"
								/>
							) : null}
							<div className="text-center">
								<div className="font-medium text-sm">
									{wikiCardData.name}
									{wikiCardData.english_name
										? ` (${wikiCardData.english_name})`
										: ""}
								</div>
								<div className="text-xs text-muted-foreground">
									{wikiCardData.card_type}
									{wikiCardData.race ? ` · ${wikiCardData.race}` : ""}
									{wikiCardData.card_sub_type ? ` · ${wikiCardData.card_sub_type}` : ""}
									{wikiCardData.attribute ? ` · ${wikiCardData.attribute}` : ""}
									{wikiCardData.atk ? ` · ATK/${wikiCardData.atk}` : ""}
									{wikiCardData.def ? ` · DEF/${wikiCardData.def}` : ""}
									{wikiCardData.level ? ` · Nivel ${wikiCardData.level}` : ""}
									{wikiCardData.scale ? ` · Escala ${wikiCardData.scale}` : ""}
								</div>
								{wikiCardData.description ? (
									<div className="mt-1 text-xs text-muted-foreground max-w-xs line-clamp-3">
										{useAnimeEffect && wikiCardData.anime_effect
											? wikiCardData.anime_effect
											: wikiCardData.description}
									</div>
								) : null}
								{wikiCardData.pendulum_effect ? (
									<div className="mt-1 text-xs text-muted-foreground max-w-xs line-clamp-3 italic">
										<span className="font-medium not-italic">Efecto Péndulo: </span>
										{wikiCardData.pendulum_effect}
									</div>
								) : null}
							</div>
							{wikiCardData.anime_effect ? (
								<div className="flex gap-1">
									<Button
										type="button"
										variant="frame"
										onClick={() => setUseAnimeEffect(false)}
										className={!useAnimeEffect ? "bg-accent/50" : ""}
									>
										Original
									</Button>
									<Button
										type="button"
										variant="frame"
										onClick={() => setUseAnimeEffect(true)}
										className={useAnimeEffect ? "bg-accent/50" : ""}
									>
										Anime
									</Button>
								</div>
							) : null}
							<Button
								type="button"
								onClick={() => void applyWikiCard()}
								disabled={applying}
							>
								{applying ? "Aplicando..." : "Usar esta carta"}
							</Button>
						</div>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
