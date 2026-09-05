import type {
	YugiohCardType,
	YugiohDescriptionStatsBoxColor,
	YugiohMonsterType,
} from "./types";

export const CARD_TEMPLATES_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplate = (fileName: string) =>
	`${CARD_TEMPLATES_BASE_URL}${fileName}`;

const normalDescription = cardTemplate("normal-description.webp");
const normalBorder = cardTemplate("normal-border.webp");
const normalStats = cardTemplate("stats-normal.webp");

const effectDescription = cardTemplate("effect-description.webp");
const effectBorder = cardTemplate("effect-border.webp");
const effectStats = cardTemplate("stats-effect.webp");

const ritualDescription = cardTemplate("ritual-description.webp");
const ritualBorder = cardTemplate("ritual-border.webp");
const ritualStats = cardTemplate("stats-ritual.webp");

const fusionDescription = cardTemplate("fusion-description.webp");
const fusionBorder = cardTemplate("fusion-border.webp");
const fusionStats = cardTemplate("stats-fusion.webp");

const synchroDescription = cardTemplate("synchro-description.webp");
const synchroBorder = cardTemplate("synchro-border.webp");
const synchroStats = cardTemplate("stats-synchro.webp");

const xyzDescription = cardTemplate("xyz-description.webp");
const xyzBorder = cardTemplate("xyz-border.webp");
const xyzStats = cardTemplate("stats-xyz.webp");

const linkDescription = cardTemplate("link-description.webp");
const linkBorder = cardTemplate("link-border.webp");
const linkStats = cardTemplate("stats-link.webp");

const spellDescription = cardTemplate("spell-description.webp");
const spellBorder = cardTemplate("spell-border.webp");

const trapDescription = cardTemplate("trap-description.webp");
const trapBorder = cardTemplate("trap-border.webp");
const trapStats = cardTemplate("stats-trap.webp");

const fieldDescription = cardTemplate("field-description.webp");
const fieldBorder = cardTemplate("field-border.webp");

const tokenDescription = cardTemplate("token-description.webp");
const tokenBorder = cardTemplate("token-border.webp");
const tokenStats = cardTemplate("stats-token.webp");

const pendulumEffectBorder = cardTemplate("effect-pendulum-border.webp");
const pendulumNormalBorder = cardTemplate("normal-pendulum-border.webp");
const fusionPendulumBorder = cardTemplate("fusion-pendulum-border.webp");
const syncrhoPendulumBorder = cardTemplate("synchro-pendulum-border.webp");
const xyzPendulumBorder = cardTemplate("xyz-pendulum-border.webp");
const ritualPendulumBorder = cardTemplate("ritual-pendulum-border.webp");

type BoxTextureColor = Exclude<
	YugiohDescriptionStatsBoxColor,
	"auto" | "void" | "void-inverse"
>;

export const BOX_TEXTURES: Record<
	BoxTextureColor,
	{ description: string; stats: string; border: string }
> = {
	Normal: {
		description: normalDescription,
		stats: normalStats,
		border: normalBorder,
	},
	Effect: {
		description: effectDescription,
		stats: effectStats,
		border: effectBorder,
	},
	Ritual: {
		description: ritualDescription,
		stats: ritualStats,
		border: ritualBorder,
	},
	Fusion: {
		description: fusionDescription,
		stats: fusionStats,
		border: fusionBorder,
	},
	Synchro: {
		description: synchroDescription,
		stats: synchroStats,
		border: synchroBorder,
	},
	Xyz: { description: xyzDescription, stats: xyzStats, border: xyzBorder },
	Link: { description: linkDescription, stats: linkStats, border: linkBorder },
	Trap: { description: trapDescription, stats: trapStats, border: trapBorder },
	Spell: { description: spellDescription, stats: "", border: spellBorder },
};

const isBoxTextureColor = (
	value: YugiohDescriptionStatsBoxColor,
): value is BoxTextureColor =>
	value !== "auto" && value !== "void" && value !== "void-inverse";

const getTypeCardBg = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
	descriptionStatsBoxColor?: YugiohDescriptionStatsBoxColor,
): { description: string; stats?: string; border?: string } => {
	if (card === "Monster") {
		const types: Record<
			YugiohMonsterType,
			{ description: string; stats?: string; border?: string }
		> = {
			Normal: {
				description: normalDescription,
				stats: normalStats,
				border: normalBorder,
			},
			Effect: {
				description: effectDescription,
				stats: effectStats,
				border: effectBorder,
			},
			Spirit: {
				description: effectDescription,
				stats: effectStats,
				border: effectBorder,
			},
			Gemini: {
				description: effectDescription,
				stats: effectStats,
				border: effectBorder,
			},
			Ritual: {
				description: ritualDescription,
				stats: ritualStats,
				border: ritualBorder,
			},
			Fusion: {
				description: fusionDescription,
				stats: fusionStats,
				border: fusionBorder,
			},
			Synchro: {
				description: synchroDescription,
				stats: synchroStats,
				border: synchroBorder,
			},
			Token: {
				description: tokenDescription,
				stats: tokenStats,
				border: tokenBorder,
			},
			Xyz: { description: xyzDescription, stats: xyzStats, border: xyzBorder },
			Link: {
				description: linkDescription,
				stats: linkStats,
				border: linkBorder,
			},
			"Pendulum Normal": {
				description: normalDescription,
				stats: normalStats,
				border: pendulumNormalBorder,
			},
			"Pendulum Effect": {
				description: effectDescription,
				stats: effectStats,
				border: pendulumEffectBorder,
			},
			"Pendulum Fusion": {
				description: fusionDescription,
				stats: fusionStats,
				border: fusionPendulumBorder,
			},
			"Pendulum Synchro": {
				description: synchroDescription,
				stats: synchroStats,
				border: syncrhoPendulumBorder,
			},
			"Pendulum Xyz": {
				description: xyzDescription,
				stats: xyzStats,
				border: xyzPendulumBorder,
			},
			"Pendulum Ritual": {
				description: ritualDescription,
				stats: ritualStats,
				border: ritualPendulumBorder,
			},
			Trap: {
				description: trapDescription,
				stats: trapStats,
				border: trapBorder,
			},
		};
		const selectedType = type as YugiohMonsterType;
		const base = types[selectedType] ?? types.Effect;

		if (
			descriptionStatsBoxColor &&
			isBoxTextureColor(descriptionStatsBoxColor)
		) {
			const override = BOX_TEXTURES[descriptionStatsBoxColor];
			return {
				...base,
				description: override.description,
			};
		}

		return base;
	}
	if (card === "Spell") {
		return { description: spellDescription, border: spellBorder };
	}
	if (card === "Trap") {
		return { description: trapDescription, border: trapBorder };
	}
	if (card === "Field") {
		return { description: fieldDescription, border: fieldBorder };
	}
	return { description: effectDescription, border: effectBorder };
};

export default getTypeCardBg;
