import dark from "../assets/images/card-templates/dark.webp";
import light from "../assets/images/card-templates/light.webp";
import earth from "../assets/images/card-templates/earth.webp";
import water from "../assets/images/card-templates/water.webp";
import fire from "../assets/images/card-templates/fire.webp";
import wind from "../assets/images/card-templates/wind.webp";
import divine from "../assets/images/card-templates/divine.webp";
import aqua from "../assets/images/light/Aqua.webp";
import beast from "../assets/images/light/Beast.webp";
import beastWarrior from "../assets/images/light/Beast-warrior.webp";
import creatorGod from "../assets/images/light/Creator.webp";
import cyberse from "../assets/images/light/Cyberse.webp";
import dinosaur from "../assets/images/light/Dinosaur.webp";
import divineBeast from "../assets/images/light/Divine.webp";
import dragon from "../assets/images/light/Dragon.webp";
import fairy from "../assets/images/light/Fairy.webp";
import fiend from "../assets/images/light/Fiend.webp";
import fish from "../assets/images/light/Fish.webp";
import insect from "../assets/images/light/Insect.webp";
import illusion from "../assets/images/light/Illusion.webp";
import machine from "../assets/images/light/Machine.webp";
import plant from "../assets/images/light/Plant.webp";
import psychic from "../assets/images/light/Psy.webp";
import pyro from "../assets/images/light/Pyro.webp";
import reptile from "../assets/images/light/Reptile.webp";
import rock from "../assets/images/light/Rock.webp";
import seaSerpent from "../assets/images/light/Sea-serpent.webp";
import spellcaster from "../assets/images/light/Spellcaster.webp";
import thunder from "../assets/images/light/Thunder.webp";
import warrior from "../assets/images/light/Warrior.webp";
import wingedBeast from "../assets/images/light/Winged-beast.webp";
import wyrm from "../assets/images/light/Wyrm.webp";
import zombie from "../assets/images/light/Zombie.webp";
import cyborg from "@/assets/images/light/Ciborg.webp";
import galaxy from "@/assets/images/light/Galaxy.webp";
import normalSpellIcon from "../assets/images/card-templates/normal.webp";
import continuousSpellIcon from "../assets/images/card-templates/continuos.webp";
import equipSpellIcon from "../assets/images/card-templates/equip.webp";
import quickPlaySpellIcon from "../assets/images/card-templates/quick-spell.webp";
import ritualSpellIcon from "../assets/images/card-templates/ritual.webp";
import fieldSpellIcon from "@/assets/images/card-templates/field.webp";
import counter from "../assets/images/card-templates/counter.webp";
import type { MonsterType } from "./types";

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
	{ title: "DARK", img: dark },
	{ title: "LIGHT", img: light },
	{ title: "EARTH", img: earth },
	{ title: "WATER", img: water },
	{ title: "FIRE", img: fire },
	{ title: "WIND", img: wind },
	{ title: "DIVINE", img: divine },
] as const;
export const SPELL_ICONS = {
	Normal: normalSpellIcon,
	Continuous: continuousSpellIcon,
	Equip: equipSpellIcon,
	"Quick-Play": quickPlaySpellIcon,
	Ritual: ritualSpellIcon,
};
export const FIELD_SPELL_ICON = fieldSpellIcon;
export const TRAP_ICONS = {
	Counter: counter,
	Normal: normalSpellIcon,
	Continuous: continuousSpellIcon,
};
export const MONSTER_TYPES: { title: MonsterType; img: string }[] = [
	{ title: "Aqua", img: aqua },
	{ title: "Beast", img: beast },
	{ title: "Beast-Warrior", img: beastWarrior },
	{ title: "Creator God", img: creatorGod },
	{ title: "Cyberse", img: cyberse },
	{ title: "Cyborg", img: cyborg },
	{ title: "Dinosaur", img: dinosaur },
	{ title: "Divine-Beast", img: divineBeast },
	{ title: "Dragon", img: dragon },
	{ title: "Fairy", img: fairy },
	{ title: "Fiend", img: fiend },
	{ title: "Fish", img: fish },
	{ title: "Galaxy", img: galaxy },
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
