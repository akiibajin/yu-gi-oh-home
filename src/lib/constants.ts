import dark from "../assets/images/DARK.svg";
import light from "../assets/images/LIGHT.webp";
import earth from "../assets/images/EARTH.webp";
import water from "../assets/images/WATER.webp";
import fire from "../assets/images/FIRE.webp";
import wind from "../assets/images/WIND.webp";
import divine from "../assets/images/DIVINE.webp";
import aqua from "../assets/images/Aqua.webp";
import beast from "../assets/images/Beast.webp";
import beastWarrior from "../assets/images/Beast-Warrior.webp";
import creatorGod from "../assets/images/Creator-God.webp";
import cyberse from "../assets/images/Cyberse.webp";
import dinosaur from "../assets/images/Dinosaur.webp";
import divineBeast from "../assets/images/Divine-Beast.webp";
import dragon from "../assets/images/Dragon.webp";
import fairy from "../assets/images/Fairy.webp";
import fiend from "../assets/images/Fiend.webp";
import fish from "../assets/images/Fish.webp";
import insect from "../assets/images/Insect.webp";
import illusion from "../assets/images/Illusion.webp";
import machine from "../assets/images/Machine.webp";
import plant from "../assets/images/Plant.webp";
import psychic from "../assets/images/Psychic.webp";
import pyro from "../assets/images/Pyro.webp";
import reptile from "../assets/images/Reptile.webp";
import rock from "../assets/images/Rock.webp";
import seaSerpent from "../assets/images/Sea_Serpent.webp";
import spellcaster from "../assets/images/Spellcaster.webp";
import thunder from "../assets/images/Thunder.webp";
import warrior from "../assets/images/Warrior.webp";
import wingedBeast from "../assets/images/Winged_Beast.webp";
import wyrm from "../assets/images/Wyrm_Type.webp";
import zombie from "../assets/images/Zombie.webp";

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
export const PLAYERS_NAMES = ["Hector", "Wallys", "Hassan", "Jess", "Chauta"];

export const YUGIOH_MAX_STARS = 12;
export const YUGIOH_MAX_STAT = 99999;

export const YUGIOH_ATTRIBUTES = [
	{ title: "DARK", img: dark },
	{ title: "LIGHT", img: light },
	{ title: "EARTH", img: earth },
	{ title: "WATER", img: water },
	{ title: "FIRE", img: fire },
	{ title: "WIND", img: wind },
	{ title: "DIVINE", img: divine },
] as const;

export const MONSTER_TYPES = [
	{ title: "Aqua", img: aqua },
	{ title: "Beast", img: beast },
	{ title: "Beast Warrior", img: beastWarrior },
	{ title: "Creator God", img: creatorGod },
	{ title: "Cyberse", img: cyberse },
	{ title: "Dinosaur", img: dinosaur },
	{ title: "Divine-Beast", img: divineBeast },
	{ title: "Dragon", img: dragon },
	{ title: "Fairy", img: fairy },
	{ title: "Fiend", img: fiend },
	{ title: "Fish", img: fish },
	{ title: "Insect", img: insect },
	{ title: "Illusion", img: illusion },
	{ title: "Machine", img: machine },
	{ title: "Plant", img: plant },
	{ title: "Psychic", img: psychic },
	{ title: "Pyro", img: pyro },
	{ title: "Reptile", img: reptile },
	{ title: "Rock", img: rock },
	{ title: "Sea Serpent", img: seaSerpent },
	{ title: "Spellcaster", img: spellcaster },
	{ title: "Thunder", img: thunder },
	{ title: "Warrior", img: warrior },
	{ title: "Winged Beast", img: wingedBeast },
	{ title: "Wyrm", img: wyrm },
	{ title: "Zombie", img: zombie },
] as const;

export const YUGIOH_MONSTER_TYPES = [
	"Normal",
	"Effect",
	"Ritual",
	"Fusion",
	"Synchro",
	"Xyz",
	"Link",
	"Pendulum-effect",
	"Pendulum-normal",
	"Pendulum-fusion",
	"Pendulum-synchro",
	"Pendulum-xyz",
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
