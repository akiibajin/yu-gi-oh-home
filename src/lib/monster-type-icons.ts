import { MONSTER_TYPES } from "@/lib/constants";
import type { MonsterType, MonsterTypeIconProfile } from "@/lib/types";

const MONSTER_TYPE_ICON_BASE_URL: Record<MonsterTypeIconProfile, string> = {
	light:
		"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/light/",
	dark:
		"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/dark/",
};

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
	Illusion: "Illusion.webp",
	Insect: "Insect.webp",
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

const iconUrl = (profile: MonsterTypeIconProfile, type: MonsterType) =>
	`${MONSTER_TYPE_ICON_BASE_URL[profile]}${MONSTER_TYPE_ICON_FILE[type]}`;

const buildOverrides = (profile: MonsterTypeIconProfile) => {
	const keys = Object.keys(MONSTER_TYPE_ICON_FILE) as MonsterType[];
	return Object.fromEntries(keys.map((t) => [t, iconUrl(profile, t)])) as Record<
		MonsterType,
		string
	>;
};

const OVERRIDES: Record<
	MonsterTypeIconProfile,
	Partial<Record<MonsterType, string>>
> = {
	light: buildOverrides("light"),
	dark: buildOverrides("dark"),
};

export const MONSTER_TYPE_ICON_PROFILES: MonsterTypeIconProfile[] = [
	"light",
	"dark",
];

export function getMonsterTypesForProfile(profile?: MonsterTypeIconProfile) {
	const p: MonsterTypeIconProfile = profile ?? "light";
	const overrides = OVERRIDES[p];
	return MONSTER_TYPES.map((t) => ({
		...t,
		img: overrides[t.title] ?? t.img,
	}));
}

export function getMonsterTypeIcon(
	profile: MonsterTypeIconProfile | undefined,
	subType: MonsterType | undefined,
): string | undefined {
	if (!subType) return undefined;
	const p: MonsterTypeIconProfile = profile ?? "light";
	const overrides = OVERRIDES[p];
	return (
		overrides[subType] ?? MONSTER_TYPES.find((t) => t.title === subType)?.img
	);
}
