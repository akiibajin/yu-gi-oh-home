export type YugiohCardAttribute =
	| "DARK"
	| "LIGHT"
	| "EARTH"
	| "WATER"
	| "FIRE"
	| "WIND"
	| "DIVINE";

export type YugiohMonsterType =
	| "Normal"
	| "Effect"
	| "Ritual"
	| "Fusion"
	| "Synchro"
	| "Xyz"
	| "Link"
	| "Trap";
export type MonsterType =
	| "Aqua"
	| "Beast"
	| "Beast Warrior"
	| "Creator God"
	| "Cyberse"
	| "Dinosaur"
	| "Divine-Beast"
	| "Dragon"
	| "Fairy"
	| "Fiend"
	| "Fish"
	| "Insect"
	| "Illusion"
	| "Machine"
	| "Plant"
	| "Psychic"
	| "Pyro"
	| "Reptile"
	| "Rock"
	| "Sea Serpent"
	| "Spellcaster"
	| "Thunder"
	| "Warrior"
	| "Winged Beast"
	| "Wyrm"
	| "Zombie";

export type YugiohSpellType =
	| "Normal"
	| "Continuous"
	| "Equip"
	| "Quick-Play"
	| "Ritual";
export type YugiohTrapType = "Normal" | "Continuous" | "Counter";

export type YugiohCardType = "Monster" | "Spell" | "Trap" | "Field";

export type YugiohRarity =
	| "Common"
	| "Rare"
	| "Super Rare"
	| "Ultra Rare"
	| "Secret Rare";

export interface YugiohMonsterStats {
	level: number; // stars
	atk: number;
	def: number;
}

export interface YugiohCardDraft {
	name: string;
	cardType: YugiohCardType;
	description: string;
	attribute: YugiohCardAttribute;
	monsterType?: YugiohMonsterType;
	subType?: MonsterType;
	isTuner?: boolean;
	stats: YugiohMonsterStats;
	spellType?: YugiohSpellType;
	trapType?: YugiohTrapType;
	img: Blob | null;
}

export {}; // ensure this is treated as a module
