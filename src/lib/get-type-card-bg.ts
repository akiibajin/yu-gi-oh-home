const normalDescription = "/assets/images/normal-description.webp";
import normalBorder from "@/assets/images/card-templates/normal-border.webp";
import normalTitle from "@/assets/images/card-templates/normal-title.webp";
import normalStats from "@/assets/images/card-templates/normal-stats.webp";
import effectBorder from "@/assets/images/card-templates/effect-border.webp";
const effectDescription = "/assets/images/effect-description.webp";
import effectTitle from "@/assets/images/card-templates/effect-title.webp";
import effectStats from "@/assets/images/card-templates/effect-stats.webp";
import ritualBorder from "@/assets/images/card-templates/ritual-border.webp";
const ritualDescription = "/assets/images/ritual-description.webp";
import ritualTitle from "@/assets/images/card-templates/ritual-title.webp";
import ritualStats from "@/assets/images/card-templates/ritual-stats.webp";
import fusionBorder from "@/assets/images/card-templates/fusion-border.webp";
const fusionDescription = "/assets/images/fusion-description.webp";
import fusionTitle from "@/assets/images/card-templates/fusion-title.webp";
import fusionStats from "@/assets/images/card-templates/fusion-stats.webp";
import synchroBorder from "@/assets/images/card-templates/synchro-border.webp";
const synchroDescription = "/assets/images/synchro-description.webp";
import synchroTitle from "@/assets/images/card-templates/synchro-title.webp";
import synchroStats from "@/assets/images/card-templates/synchro-stats.webp";
import xyzBorder from "@/assets/images/card-templates/xyz-border.webp";
const xyzDescription = "/assets/images/xyz-desciption.webp";
import xyzTitle from "@/assets/images/card-templates/xyz-title.webp";
import xyzStats from "@/assets/images/card-templates/xyz-stats.webp";
import linkBorder from "@/assets/images/card-templates/link-border.webp";
const linkDescription = "/assets/images/link-description.webp";
import linkTitle from "@/assets/images/card-templates/link-title.webp";
import linkStats from "@/assets/images/card-templates/link-stats.webp";
import spellBorder from "@/assets/images/card-templates/spell-border.webp";
const spellDescription = "/assets/images/spell-description.webp";
import spellTitle from "@/assets/images/card-templates/spell-title.webp";
const trapDescription = "/assets/images/trap-description.webp";
import trapBorder from "@/assets/images/card-templates/trap-border.webp";
import trapTitle from "@/assets/images/card-templates/trap-title.webp";
import trapStats from "@/assets/images/card-templates/trap-stats.webp";
import fieldBorder from "@/assets/images/card-templates/field-border.webp";
const fieldDescription = "/assets/images/field-description.webp";
import fieldTitle from "@/assets/images/card-templates/field-title.webp";
import type {
	YugiohCardType,
	YugiohDescriptionStatsBoxColor,
	YugiohMonsterType,
} from "./types";
import tokenBorder from "@/assets/images/card-templates/border-card.webp";
import tokenTitle from "@/assets/images/card-templates/token-title.webp";
import tokenStats from "@/assets/images/card-templates/token-stats.webp";
const tokenDescription = "/assets/images/token-description.webp";
import pendulumEffectBorder from "@/assets/images/card-templates/pendulum-effect-border.webp";
import pendulumNormalBorder from "@/assets/images/card-templates/normal-pendulum.webp";
import fusionPendulumBorder from "@/assets/images/card-templates/fusion-pendulum.webp";
import syncrhoPendulumBorder from "@/assets/images/card-templates/synchro-pendulum.webp";
import xyzPendulumBorder from "@/assets/images/card-templates/xyz-pendulum.webp";
import ritualPendulumBorder from "@/assets/images/card-templates/ritual-pendulum.webp";

type BoxTextureColor = Exclude<YugiohDescriptionStatsBoxColor, "auto" | "void">;

export const BOX_TEXTURES: Record<
	BoxTextureColor,
	{ description: string; stats: string, border: string }
> = {
	Normal: { description: normalDescription, stats: normalStats, border: normalBorder },
	Effect: { description: effectDescription, stats: effectStats, border: effectBorder },
	Ritual: { description: ritualDescription, stats: ritualStats, border: ritualBorder },
	Fusion: { description: fusionDescription, stats: fusionStats, border: fusionBorder },
	Synchro: { description: synchroDescription, stats: synchroStats, border: synchroBorder },
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
): { description: string; title: string; stats?: string; border?: string } => {
	if (card === "Monster") {
		const types: Record<
			YugiohMonsterType,
			{ description: string; title: string; stats?: string; border?: string }
		> = {
			Normal: {
				description: normalDescription,
				title: normalTitle,
				stats: normalStats,
				border: normalBorder,
			},
			Effect: {
				description: effectDescription,
				title: effectTitle,
				stats: effectStats,
				border: effectBorder,
			},
			Spirit: {
				description: effectDescription,
				title: effectTitle,
				stats: effectStats,
				border: effectBorder,
			},
			Gemini: {
				description: effectDescription,
				title: effectTitle,
				stats: effectStats,
				border: effectBorder,
			},
			Ritual: {
				description: ritualDescription,
				title: ritualTitle,
				stats: ritualStats,
				border: ritualBorder,
			},
			Fusion: {
				description: fusionDescription,
				title: fusionTitle,
				stats: fusionStats,
				border: fusionBorder,
			},
			Synchro: {
				description: synchroDescription,
				title: synchroTitle,
				stats: synchroStats,
				border: synchroBorder,
			},
			Token: {
                description: tokenDescription,
				title: tokenTitle,
				stats: tokenStats,
				border: tokenBorder,
			},
			Xyz: { description: xyzDescription, title: xyzTitle, stats: xyzStats, border: xyzBorder },
			Link: {
				description: linkDescription,
				title: linkTitle,
				stats: linkStats,
				border: linkBorder,
			},
			"Pendulum Normal": {
				description: normalDescription,
				title: normalTitle,
				stats: normalStats,
				border: pendulumNormalBorder,
			},
			"Pendulum Effect": {
				description: effectDescription,
				title: effectTitle,
				stats: effectStats,
				border: pendulumEffectBorder,
			},
			"Pendulum Fusion": {
				description: fusionDescription,
				title: fusionTitle,
				stats: fusionStats,
				border: fusionPendulumBorder,
			},
			"Pendulum Synchro": {
				description: synchroDescription,
				title: synchroTitle,
				stats: synchroStats,
				border: syncrhoPendulumBorder,
			},
			"Pendulum Xyz": {
				description: xyzDescription,
				title: xyzTitle,
				stats: xyzStats,
				border: xyzPendulumBorder,
			},
			"Pendulum Ritual": {
				description: ritualDescription,
				title: ritualTitle,
				stats: ritualStats,
				border: ritualPendulumBorder,
			},
			Trap: {
				description: trapDescription,
				title: trapTitle,
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
		return { description: spellDescription, title: spellTitle, border: spellBorder };
	}
	if (card === "Trap") {
		return { description: trapDescription, title: trapTitle, border: trapBorder };
	}
	if (card === "Field") {
		return { description: fieldDescription, title: fieldTitle, border: fieldBorder };
	}
	return { description: effectDescription, title: effectTitle, border: effectBorder };
};

export default getTypeCardBg;
