const normalDescription = "/assets/images/normal-description.webp";
import normalBorder from "@/assets/images/card-templates/normal-border.webp";
import normalStats from "@/assets/images/card-templates/stats-normal.webp";
import effectBorder from "@/assets/images/card-templates/effect-border.webp";
const effectDescription = "/assets/images/effect-description.webp";
import effectStats from "@/assets/images/card-templates/stats-effect.webp";
import ritualBorder from "@/assets/images/card-templates/ritual-border.webp";
const ritualDescription = "/assets/images/ritual-description.webp";
import ritualStats from "@/assets/images/card-templates/stats-ritual.webp";
import fusionBorder from "@/assets/images/card-templates/fusion-border.webp";
const fusionDescription = "/assets/images/fusion-description.webp";
import fusionStats from "@/assets/images/card-templates/stats-fusion.webp";
import synchroBorder from "@/assets/images/card-templates/synchro-border.webp";
const synchroDescription = "/assets/images/synchro-description.webp";
import synchroStats from "@/assets/images/card-templates/stats-synchro.webp";
import xyzBorder from "@/assets/images/card-templates/xyz-border.webp";
const xyzDescription = "/assets/images/xyz-description.webp";
import xyzStats from "@/assets/images/card-templates/stats-xyz.webp";
import linkBorder from "@/assets/images/card-templates/link-border.webp";
const linkDescription = "/assets/images/link-description.webp";
import linkStats from "@/assets/images/card-templates/stats-link.webp";
import spellBorder from "@/assets/images/card-templates/spell-border.webp";
const spellDescription = "/assets/images/spell-description.webp";
const trapDescription = "/assets/images/trap-description.webp";
import trapBorder from "@/assets/images/card-templates/trap-border.webp";
import trapStats from "@/assets/images/card-templates/stats-trap.webp";
import fieldBorder from "@/assets/images/card-templates/field-border.webp";
const fieldDescription = "/assets/images/field-description.webp";

import type {
	YugiohCardType,
	YugiohDescriptionStatsBoxColor,
	YugiohMonsterType,
} from "./types";
import tokenBorder from "@/assets/images/card-templates/token-border.webp";
import tokenStats from "@/assets/images/card-templates/stats-token.webp";
const tokenDescription = "/assets/images/token-description.webp";
import pendulumEffectBorder from "@/assets/images/card-templates/effect-pendulum-border.webp";
import pendulumNormalBorder from "@/assets/images/card-templates/normal-pendulum-border.webp";
import fusionPendulumBorder from "@/assets/images/card-templates/fusion-pendulum-border.webp";
import syncrhoPendulumBorder from "@/assets/images/card-templates/synchro-pendulum-border.webp";
import xyzPendulumBorder from "@/assets/images/card-templates/xyz-pendulum-border.webp";
import ritualPendulumBorder from "@/assets/images/card-templates/ritual-pendulum-border.webp";

type BoxTextureColor = Exclude<YugiohDescriptionStatsBoxColor, "auto" | "void">;

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
): value is BoxTextureColor => value !== "auto" && value !== "void";

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
