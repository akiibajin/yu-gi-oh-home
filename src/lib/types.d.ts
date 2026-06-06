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
	| "Beast-Warrior"
	| "Creator God"
	| "Cyberse"
	| "Cyborg"
	| "Dinosaur"
	| "Divine-Beast"
	| "Dragon"
	| "Fairy"
	| "Fiend"
	| "Fish"
	| "Galaxy"
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

export type MonsterTypeIconProfile = "light" | "dark";

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
	| "void-inverse"
	| "Normal"
	| "Effect"
	| "Ritual"
	| "Fusion"
	| "Synchro"
	| "Xyz"
	| "Link"
	| "Trap"
	| "Spell";

export type YugiohDescriptionTextColor = "auto" | "black" | "white";

export type YugiohDescriptionTextSize = "small" | "normal" | "big";

export type YugiohCardType = "Monster" | "Spell" | "Trap" | "Field";

export type YugiohRarity =
	| "Common"
	| "Rare"
	| "Super Rare"
	| "Ultra Rare"
	| "Secret Rare";
export type LinkMarker =
	| "Top"
	| "Bottom-Left"
	| "Bottom"
	| "Bottom-Right"
	| "Left"
	| "Right"
	| "Top-Left"
	| "Top-Right";
export interface YugiohMonsterStats {
	level: number; // stars
	atk: number | string;
	def: number | string;
}

export interface YugiohCardDraft {
	name: string;
	cardType: YugiohCardType;
	iconProfile?: MonsterTypeIconProfile;
	showDescription?: boolean;
	showName?: boolean;
	showNameBox?: boolean;
	showStatsBox?: boolean;
	pendulumDescription?: string;
	description: string;
	/** Used for Spell/Trap/Field cards in the maker UI. */
	descriptionTextColor?: YugiohDescriptionTextColor;
	/** Used for Spell/Trap/Field cards in the maker UI. */
	descriptionTextSize?: YugiohDescriptionTextSize;
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
	imgRotationDeg?: number;
	descriptionImageOpacity?: number;
	overframe?: boolean;
	fullArt?: boolean;
	overframeImg: Blob | string | null;
	overframeObjectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
	overframeImgRotationDeg?: number;
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
	atk: string | null;
	def: string | null;
	level: number | null;
}

export type YugiohCardWithImgUrl = Omit<YugiohCardDraft, "img"> & {
	id: string;
	imgUrl: string;
};

export {};
