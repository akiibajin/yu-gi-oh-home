import type { MonsterType } from "./types";

const CARD_TEMPLATE_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplate = (fileName: string) =>
	`${CARD_TEMPLATE_BASE_URL}${fileName}`;

const MONSTER_TYPE_ICON_LIGHT_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/light/";

const MONSTER_TYPE_ICON_FILE: Record<MonsterType, string> = {
	Aqua: "Aqua.webp",
	Beast: "Beast.webp",
	"Beast-Warrior": "Beast-warrior.webp",
	"Creator God": "Creator.webp",
	Cyberse: "Cyberse.webp",
	Cyborg: "Ciborg.webp",
	Dinosaur: "Dinosaur.webp",
	"Divine-Beast": "Divine.webp",
	Dragon: "Dragon.webp",
	Fairy: "Fairy.webp",
	Fiend: "Fiend.webp",
	Fish: "Fish.webp",
	Galaxy: "Galaxy.webp",
	Insect: "Insect.webp",
	Illusion: "Illusion.webp",
	Machine: "Machine.webp",
	Plant: "Plant.webp",
	Psychic: "Psy.webp",
	Pyro: "Pyro.webp",
	Reptile: "Reptile.webp",
	Rock: "Rock.webp",
	"Sea Serpent": "Sea-serpent.webp",
	Spellcaster: "Spellcaster.webp",
	Thunder: "Thunder.webp",
	Warrior: "Warrior.webp",
	"Winged Beast": "Winged-beast.webp",
	Wyrm: "Wyrm.webp",
	Zombie: "Zombie.webp",
};

const monsterTypeIcon = (type: MonsterType) =>
	`${MONSTER_TYPE_ICON_LIGHT_BASE_URL}${MONSTER_TYPE_ICON_FILE[type]}`;

export type NavItem = {
	title: string;
	href: string;
	children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
	{ title: "Home", href: "/" },
	{ title: "Calculator", href: "/calc" },
	{ title: "Card Maker", href: "/card-maker" },
];

export const ROYAL_LP = 8000;
export const TAG_LP = 12000;

export const YUGIOH_MAX_STARS = 13;
export const YUGIOH_MAX_STAT = 99999;

export const YUGIOH_ATTRIBUTES = [
	{ title: "DARK", img: cardTemplate("dark.webp") },
	{ title: "LIGHT", img: cardTemplate("light.webp") },
	{ title: "EARTH", img: cardTemplate("earth.webp") },
	{ title: "WATER", img: cardTemplate("water.webp") },
	{ title: "FIRE", img: cardTemplate("fire.webp") },
	{ title: "WIND", img: cardTemplate("wind.webp") },
	{ title: "DIVINE", img: cardTemplate("divine.webp") },
] as const;
export const SPELL_ICONS = {
	Normal: cardTemplate("normal.webp"),
	Continuous: cardTemplate("continuos.webp"),
	Equip: cardTemplate("equip.webp"),
	"Quick-Play": cardTemplate("quick-spell.webp"),
	Ritual: cardTemplate("Ritual.webp"),
};
export const FIELD_SPELL_ICON = cardTemplate("field.webp");
export const TRAP_ICONS = {
	Counter: cardTemplate("Counter.webp"),
	Normal: cardTemplate("normal.webp"),
	Continuous: cardTemplate("continuos.webp"),
};
export const MONSTER_TYPES: { title: MonsterType; img: string }[] = [
	{ title: "Aqua", img: monsterTypeIcon("Aqua") },
	{ title: "Beast", img: monsterTypeIcon("Beast") },
	{ title: "Beast-Warrior", img: monsterTypeIcon("Beast-Warrior") },
	{ title: "Creator God", img: monsterTypeIcon("Creator God") },
	{ title: "Cyberse", img: monsterTypeIcon("Cyberse") },
	{ title: "Cyborg", img: monsterTypeIcon("Cyborg") },
	{ title: "Dinosaur", img: monsterTypeIcon("Dinosaur") },
	{ title: "Divine-Beast", img: monsterTypeIcon("Divine-Beast") },
	{ title: "Dragon", img: monsterTypeIcon("Dragon") },
	{ title: "Fairy", img: monsterTypeIcon("Fairy") },
	{ title: "Fiend", img: monsterTypeIcon("Fiend") },
	{ title: "Fish", img: monsterTypeIcon("Fish") },
	{ title: "Galaxy", img: monsterTypeIcon("Galaxy") },
	{ title: "Insect", img: monsterTypeIcon("Insect") },
	{ title: "Illusion", img: monsterTypeIcon("Illusion") },
	{ title: "Machine", img: monsterTypeIcon("Machine") },
	{ title: "Plant", img: monsterTypeIcon("Plant") },
	{ title: "Psychic", img: monsterTypeIcon("Psychic") },
	{ title: "Pyro", img: monsterTypeIcon("Pyro") },
	{ title: "Reptile", img: monsterTypeIcon("Reptile") },
	{ title: "Rock", img: monsterTypeIcon("Rock") },
	{ title: "Sea Serpent", img: monsterTypeIcon("Sea Serpent") },
	{ title: "Spellcaster", img: monsterTypeIcon("Spellcaster") },
	{ title: "Thunder", img: monsterTypeIcon("Thunder") },
	{ title: "Warrior", img: monsterTypeIcon("Warrior") },
	{ title: "Winged Beast", img: monsterTypeIcon("Winged Beast") },
	{ title: "Wyrm", img: monsterTypeIcon("Wyrm") },
	{ title: "Zombie", img: monsterTypeIcon("Zombie") },
] as const;

export const YUGIOH_MONSTER_TYPES = [
	"Normal",
	"Effect",
	"Gemini",
	"Spirit",
	"Ritual",
	"Fusion",
	"Synchro",
	"Xyz",
	"Link",
	"Pendulum Effect",
	"Pendulum Normal",
	"Pendulum Fusion",
	"Pendulum Synchro",
	"Pendulum Xyz",
	"Pendulum Ritual",
	"Token",
	"Trap",
] as const;

export const YUGIOH_RARITIES = [
	"Common",
	"Rare",
	"Super Rare",
	"Ultra Rare",
	"Secret Rare",
] as const;

export const YUGIOH_CARD_TYPES = ["Monster", "Spell", "Trap", "Field"] as const;

export const SPELL_TYPES = [
	"Normal",
	"Continuous",
	"Equip",
	"Quick-Play",
	"Ritual",
] as const;

export const TRAP_TYPES = ["Normal", "Continuous", "Counter"] as const;

export const YUGIOH_DESCRIPTION_STATS_BOX_COLORS = [
	{ value: "auto", label: "Auto (By card type)" },
	{ value: "void", label: "Void (Hide description/stats box images)" },
	{ value: "Normal", label: "Normal (Orange)" },
	{ value: "Effect", label: "Effect (Brown)" },
	{ value: "Ritual", label: "Ritual (Blue)" },
	{ value: "Fusion", label: "Fusion (Purple)" },
	{ value: "Synchro", label: "Synchro (White)" },
	{ value: "Xyz", label: "Xyz (Black)" },
	{ value: "Link", label: "Link (Blue)" },
	{ value: "Trap", label: "Trap (Pink)" },
] as const;
