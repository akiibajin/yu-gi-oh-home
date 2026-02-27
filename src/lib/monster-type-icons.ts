import { MONSTER_TYPES } from "@/lib/constants";
import type { MonsterType, MonsterTypeIconProfile } from "@/lib/types";

import lightAqua from "@/assets/images/light/Aqua.webp";
import lightBeastWarrior from "@/assets/images/light/Beast-warrior.webp";
import lightBeast from "@/assets/images/light/Beast.webp";
import lightCreatorGod from "@/assets/images/light/Creator.webp";
import lightCyberse from "@/assets/images/light/Cyberse.webp";
import lightDinosaur from "@/assets/images/light/Dinosaur.webp";
import lightDivine from "@/assets/images/light/Divine.webp";
import lightDragon from "@/assets/images/light/Dragon.webp";
import lightFairy from "@/assets/images/light/Fairy.webp";
import lightFiend from "@/assets/images/light/Fiend.webp";
import lightFish from "@/assets/images/light/Fish.webp";
import lightIllusion from "@/assets/images/light/Illusion.webp";
import lightInsect from "@/assets/images/light/Insect.webp";
import lightMachine from "@/assets/images/light/Machine.webp";
import lightPlant from "@/assets/images/light/Plant.webp";
import lightPsy from "@/assets/images/light/Psy.webp";
import lightPyro from "@/assets/images/light/Pyro.webp";
import lightReptile from "@/assets/images/light/Reptile.webp";
import lightRock from "@/assets/images/light/Rock.webp";
import lightSeaSerpent from "@/assets/images/light/Sea-serpent.webp";
import lightSpellcaster from "@/assets/images/light/Spellcaster.webp";
import lightThunder from "@/assets/images/light/Thunder.webp";
import lightWarrior from "@/assets/images/light/Warrior.webp";
import lightWingedBeast from "@/assets/images/light/Winged-beast.webp";
import lightWyrm from "@/assets/images/light/Wyrm.webp";
import lightZombie from "@/assets/images/light/Zombie.webp";
import lightCyborg from "@/assets/images/light/Ciborg.webp";
import lightGalaxy from "@/assets/images/light/Galaxy.webp";
import darkAqua from "@/assets/images/dark/Aqua.webp";
import darkBeastWarrior from "@/assets/images/dark/Beast-warrior.webp";
import darkBeast from "@/assets/images/dark/Beast.webp";
import darkCreatorGod from "@/assets/images/dark/Creator.webp";
import darkCyberse from "@/assets/images/dark/Cyberse.webp";
import darkDinosaur from "@/assets/images/dark/Dinosaur.webp";
import darkDivine from "@/assets/images/dark/Divine.webp";
import darkDragon from "@/assets/images/dark/Dragon.webp";
import darkFairy from "@/assets/images/dark/Fairy.webp";
import darkFiend from "@/assets/images/dark/Fiend.webp";
import darkFish from "@/assets/images/dark/Fish.webp";
import darkIllusion from "@/assets/images/dark/Illusion.webp";
import darkInsect from "@/assets/images/dark/Insect.webp";
import darkMachine from "@/assets/images/dark/Machine.webp";
import darkPlant from "@/assets/images/dark/Plant.webp";
import darkPsy from "@/assets/images/dark/Psy.webp";
import darkPyro from "@/assets/images/dark/Pyro.webp";
import darkReptile from "@/assets/images/dark/Reptile.webp";
import darkRock from "@/assets/images/dark/Rock.webp";
import darkSeaSerpent from "@/assets/images/dark/Sea-serpent.webp";
import darkSpellcaster from "@/assets/images/dark/Spellcaster.webp";
import darkThunder from "@/assets/images/dark/Thunder.webp";
import darkWarrior from "@/assets/images/dark/Warrior.webp";
import darkWingedBeast from "@/assets/images/dark/Winged-beast.webp";
import darkWyrm from "@/assets/images/dark/Wyrm.webp";
import darkZombie from "@/assets/images/dark/Zombie.webp";
import darkCiborg from "@/assets/images/dark/Ciborg.webp";
import darkGalaxy from "@/assets/images/dark/Galaxy.webp";

const OVERRIDES: Record<
	MonsterTypeIconProfile,
	Partial<Record<MonsterType, string>>
> = {
	light: {
		Aqua: lightAqua,
		Beast: lightBeast,
		"Beast-Warrior": lightBeastWarrior,
		Cyberse: lightCyberse,
		Cyborg: lightCyborg,
		Dinosaur: lightDinosaur,
		"Creator God": lightCreatorGod,
		"Divine-Beast": lightDivine,
		Dragon: lightDragon,
		Fairy: lightFairy,
		Fiend: lightFiend,
		Fish: lightFish,
		Galaxy: lightGalaxy,
		Illusion: lightIllusion,
		Insect: lightInsect,
		Machine: lightMachine,
		Plant: lightPlant,
		Psychic: lightPsy,
		Pyro: lightPyro,
		Reptile: lightReptile,
		Rock: lightRock,
		"Sea Serpent": lightSeaSerpent,
		Spellcaster: lightSpellcaster,
		Thunder: lightThunder,
		Warrior: lightWarrior,
		"Winged Beast": lightWingedBeast,
		Wyrm: lightWyrm,
		Zombie: lightZombie,
	},
	dark: {
		Aqua: darkAqua,
		Beast: darkBeast,
		"Beast-Warrior": darkBeastWarrior,
		"Creator God": darkCreatorGod,
		Cyberse: darkCyberse,
		Cyborg: darkCiborg,
		Dinosaur: darkDinosaur,
		"Divine-Beast": darkDivine,
		Dragon: darkDragon,
		Fairy: darkFairy,
		Fiend: darkFiend,
		Fish: darkFish,
		Galaxy: darkGalaxy,
		Illusion: darkIllusion,
		Insect: darkInsect,
		Machine: darkMachine,
		Plant: darkPlant,
		Psychic: darkPsy,
		Pyro: darkPyro,
		Reptile: darkReptile,
		Rock: darkRock,
		"Sea Serpent": darkSeaSerpent,
		Spellcaster: darkSpellcaster,
		Thunder: darkThunder,
		Warrior: darkWarrior,
		"Winged Beast": darkWingedBeast,
		Wyrm: darkWyrm,
		Zombie: darkZombie,
	},
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
