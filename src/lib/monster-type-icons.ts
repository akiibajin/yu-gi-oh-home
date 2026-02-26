import { MONSTER_TYPES } from "@/lib/constants";
import type { MonsterType, MonsterTypeIconProfile } from "@/lib/types";

import hectorAqua from "@/assets/images/hector/Aqua.webp";
import hectorBeastWarrior from "@/assets/images/hector/Beast-warrior.webp";
import hectorBeast from "@/assets/images/hector/Beast.webp";
import hectorCyberse from "@/assets/images/hector/Cyberse.webp";
import hectorDinosaur from "@/assets/images/hector/Dinosaur.webp";
import hectorDivine from "@/assets/images/hector/Divine.webp";
import hectorDragon from "@/assets/images/hector/Dragon.webp";
import hectorFairy from "@/assets/images/hector/Fairy.webp";
import hectorFiend from "@/assets/images/hector/Fiend.webp";
import hectorFish from "@/assets/images/hector/Fish.webp";
import hectorIllusion from "@/assets/images/hector/Illusion.webp";
import hectorInsect from "@/assets/images/hector/Insect.webp";
import hectorMachine from "@/assets/images/hector/Machine.webp";
import hectorPlant from "@/assets/images/hector/Plant.webp";
import hectorPsy from "@/assets/images/hector/Psy.webp";
import hectorPyro from "@/assets/images/hector/Pyro.webp";
import hectorReptile from "@/assets/images/hector/Reptile.webp";
import hectorRock from "@/assets/images/hector/Rock.webp";
import hectorSeaSerpent from "@/assets/images/hector/Sea-serpent.webp";
import hectorSpellcaster from "@/assets/images/hector/Spellcaster.webp";
import hectorThunder from "@/assets/images/hector/Thunder.webp";
import hectorWarrior from "@/assets/images/hector/Warrior.webp";
import hectorWingedBeast from "@/assets/images/hector/Winged-beast.webp";
import hectorWyrm from "@/assets/images/hector/Wyrm.webp";
import hectorZombie from "@/assets/images/hector/Zombie.webp";

import jaimeAqua from "@/assets/images/jaime/Aqua.webp";
import jaimeBeastWarrior from "@/assets/images/jaime/Beast-warrior.webp";
import jaimeBeast from "@/assets/images/jaime/Beast.webp";
import jaimeCyberse from "@/assets/images/jaime/Cyberse.webp";
import jaimeDinosaur from "@/assets/images/jaime/Dinosaur.webp";
import jaimeDivine from "@/assets/images/jaime/Divine.webp";
import jaimeDragon from "@/assets/images/jaime/Dragon.webp";
import jaimeFairy from "@/assets/images/jaime/Fairy.webp";
import jaimeFiend from "@/assets/images/jaime/Fiend.webp";
import jaimeFish from "@/assets/images/jaime/Fish.webp";
import jaimeIllusion from "@/assets/images/jaime/Illusion.webp";
import jaimeInsect from "@/assets/images/jaime/Insect.webp";
import jaimeMachine from "@/assets/images/jaime/Machine.webp";
import jaimePlant from "@/assets/images/jaime/Plant.webp";
import jaimePsy from "@/assets/images/jaime/Psy.webp";
import jaimePyro from "@/assets/images/jaime/Pyro.webp";
import jaimeReptile from "@/assets/images/jaime/Reptile.webp";
import jaimeRock from "@/assets/images/jaime/Rock.webp";
import jaimeSeaSerpent from "@/assets/images/jaime/Sea-serpent.webp";
import jaimeSpellcaster from "@/assets/images/jaime/Spellcaster.webp";
import jaimeThunder from "@/assets/images/jaime/Thunder.webp";
import jaimeWarrior from "@/assets/images/jaime/Warrior.webp";
import jaimeWingedBeast from "@/assets/images/jaime/Winged-beast.webp";
import jaimeWyrm from "@/assets/images/jaime/Wyrm.webp";
import jaimeZombie from "@/assets/images/jaime/Zombie.webp";

import cyborg from "@/assets/images/Cyborg.webp";
import galaxy from "@/assets/images/Galaxy.webp";

const OVERRIDES: Record<
	MonsterTypeIconProfile,
	Partial<Record<MonsterType, string>>
> = {
	hector: {
		Aqua: hectorAqua,
		Beast: hectorBeast,
		"Beast-Warrior": hectorBeastWarrior,
		Cyberse: hectorCyberse,
		Cyborg: cyborg,
		Dinosaur: hectorDinosaur,
		"Divine-Beast": hectorDivine,
		Dragon: hectorDragon,
		Fairy: hectorFairy,
		Fiend: hectorFiend,
		Fish: hectorFish,
		Galaxy: galaxy,
		Illusion: hectorIllusion,
		Insect: hectorInsect,
		Machine: hectorMachine,
		Plant: hectorPlant,
		Psychic: hectorPsy,
		Pyro: hectorPyro,
		Reptile: hectorReptile,
		Rock: hectorRock,
		"Sea Serpent": hectorSeaSerpent,
		Spellcaster: hectorSpellcaster,
		Thunder: hectorThunder,
		Warrior: hectorWarrior,
		"Winged Beast": hectorWingedBeast,
		Wyrm: hectorWyrm,
		Zombie: hectorZombie,
	},
	jaime: {
		Aqua: jaimeAqua,
		Beast: jaimeBeast,
		"Beast-Warrior": jaimeBeastWarrior,
		Cyberse: jaimeCyberse,
		Cyborg: cyborg,
		Dinosaur: jaimeDinosaur,
		"Divine-Beast": jaimeDivine,
		Dragon: jaimeDragon,
		Fairy: jaimeFairy,
		Fiend: jaimeFiend,
		Fish: jaimeFish,
		Galaxy: galaxy,
		Illusion: jaimeIllusion,
		Insect: jaimeInsect,
		Machine: jaimeMachine,
		Plant: jaimePlant,
		Psychic: jaimePsy,
		Pyro: jaimePyro,
		Reptile: jaimeReptile,
		Rock: jaimeRock,
		"Sea Serpent": jaimeSeaSerpent,
		Spellcaster: jaimeSpellcaster,
		Thunder: jaimeThunder,
		Warrior: jaimeWarrior,
		"Winged Beast": jaimeWingedBeast,
		Wyrm: jaimeWyrm,
		Zombie: jaimeZombie,
	},
};

export const MONSTER_TYPE_ICON_PROFILES: MonsterTypeIconProfile[] = [
	"hector",
	"jaime",
];

export function getMonsterTypesForProfile(profile?: MonsterTypeIconProfile) {
	const p: MonsterTypeIconProfile = profile ?? "hector";
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
	const p: MonsterTypeIconProfile = profile ?? "hector";
	const overrides = OVERRIDES[p];
	return (
		overrides[subType] ?? MONSTER_TYPES.find((t) => t.title === subType)?.img
	);
}
