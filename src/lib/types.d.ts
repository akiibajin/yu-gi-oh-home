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
	| "Spirit"
	| "Gemini"
	| "Ritual"
	| "Fusion"
	| "Synchro"
	| "Xyz"
	| "Link"
	| "Pendulum Normal"
	| "Pendulum Effect"
	| "Pendulum Fusion"
	| "Pendulum Synchro"
	| "Pendulum Xyz"
	| "Pendulum Ritual"
	| "Trap"
	| "Token";
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

export type YugiohDescriptionStatsBoxColor =
	| "auto"
	| "void"
	| "Normal"
	| "Effect"
	| "Ritual"
	| "Fusion"
	| "Synchro"
	| "Xyz"
	| "Link"
	| "Trap"
	| "Spell";

export type YugiohCardType = "Monster" | "Spell" | "Trap" | "Field";

export type YugiohRarity =
	| "Common"
	| "Rare"
	| "Super Rare"
	| "Ultra Rare"
	| "Secret Rare";
export type LinkMarker =
	| "Top"
	| "Bottom-left"
	| "Bottom"
	| "Bottom-right"
	| "Left"
	| "Right"
	| "Top-left"
	| "Top-right";
export interface YugiohMonsterStats {
	level: number; // stars
	atk: number | string;
	def: number | string;
}

export interface YugiohCardDraft {
	name: string;
	cardType: YugiohCardType;
	showDescription?: boolean;
	pendulumDescription?: string;
	description: string;
	attribute: YugiohCardAttribute;
	monsterType?: YugiohMonsterType;
	subType?: MonsterType;
	scale?: number;
	isTuner?: boolean;
	linkRating?: number;
	linkMarkers?: LinkMarker[];
	stats: YugiohMonsterStats;
	spellType?: YugiohSpellType;
	linkMarkersOnDescription?: boolean;
	trapType?: YugiohTrapType;
	descriptionStatsBoxColor?: YugiohDescriptionStatsBoxColor;
	img: Blob | string | null;
	objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export interface YugiohCardDB {
	id: string | number;
	name: string;
	card_type: YugiohCardType;
	scale: number | null;
	description: string;
	attribute: YugiohCardAttribute | null;
	monster_type: `${YugiohMonsterType} Monster`;
	sub_type: MonsterType | null;
	is_tuner: boolean | null;
	link_rating: number | null;
	link_markers: LinkMarker[] | null;
	created_at: string;
	img_url: string;
	spell_type: YugiohSpellType | null;
	trap_type: YugiohTrapType | null;
	atk: number | null;
	def: number | null;
	level: number | null;
}

export type YugiohCardWithImgUrl = Omit<YugiohCardDraft, "img"> & {
	id: string;
	imgUrl: string;
};

export interface YugiohBackground {
	name: string;
	img_url: string;
}

export {}; // ensure this is treated as a module
