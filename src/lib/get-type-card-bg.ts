const normalDescription = "/assets/images/normal-description.webp";
import normalTitle from "@/assets/images/card-templates/normal-title.webp";
import normalStats from "@/assets/images/card-templates/normal-stats.webp";
const effectDescription = "/assets/images/effect-description.webp";
import effectTitle from "@/assets/images/card-templates/effect-title.webp";
import effectStats from "@/assets/images/card-templates/effect-stats.webp";
const ritualDescription = "/assets/images/ritual-description.webp";
// import ritualTitle from "@/assets/images/card-templates/ritual-title.webp";
const fusionDescription = "/assets/images/fusion-description.webp";
import fusionTitle from "@/assets/images/card-templates/fusion-title.webp";
import fusionStats from "@/assets/images/card-templates/fusion-stats.webp";
const synchroDescription = "/assets/images/synchro-description.webp";
import synchroTitle from "@/assets/images/card-templates/synchro-title.webp";
import synchroStats from "@/assets/images/card-templates/synchro-stats.webp";
const xyzDescription = "/assets/images/xyz-desciption.webp";
import xyzTitle from "@/assets/images/card-templates/xyz-title.webp";
import xyzStats from "@/assets/images/card-templates/xyz-stats.webp";
const linkDescription = "/assets/images/link-description.webp";
import linkTitle from "@/assets/images/card-templates/link-title.webp";
import linkStats from "@/assets/images/card-templates/link-stats.webp";
const spellDescription = "/assets/images/spell-description.webp";
import spellTitle from "@/assets/images/card-templates/spell-title.webp";
const trapDescription = "/assets/images/trap-description.webp";
import trapTitle from "@/assets/images/card-templates/trap-title.webp";
const fieldDescription = "/assets/images/field-description.webp";
import fieldTitle from "@/assets/images/card-templates/field-title.webp";
import type { YugiohCardType, YugiohMonsterType } from "./types";

const getTypeCardBg = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): { description: string, title: string, stats?: string } => {
	if (card === "Monster") {		
		const types: Record<YugiohMonsterType, { description: string, title: string, stats?: string }> = {
			Normal: { description: normalDescription,
				title: normalTitle,
				stats: normalStats,
			 },
			Effect: { description: effectDescription,
				title: effectTitle,
				stats: effectStats,
			 },
			Spirit: { description: effectDescription,
				title: effectTitle,
				stats: effectStats,
			 },
			Gemini: { description: effectDescription,
				title: effectTitle,
				stats: effectStats,
			 },			
			 Ritual: { description: ritualDescription,
				title: linkTitle,
				stats: linkStats,
			  },
			Fusion: { description: fusionDescription,
				title: fusionTitle,
				stats: fusionStats,
			 },
			Synchro: { description: synchroDescription,
				title: synchroTitle,
				stats: synchroStats,
			 },
			Xyz: { description: xyzDescription,
				title: xyzTitle,
				stats: xyzStats,
			},
			Link: { description: linkDescription,
				title: linkTitle,
				stats: linkStats,
			},
			"Pendulum Normal": {
				description: spellDescription,
				title: normalTitle,
				stats: normalStats,
			},
			"Pendulum Effect": {
				description: spellDescription,
				title: effectTitle,
				stats: effectStats,
			},
			"Pendulum Fusion": {
				description: spellDescription,
				title: fusionTitle,
				stats: fusionStats,
			},
			"Pendulum Synchro": {
				description: spellDescription,
				title: synchroTitle,
				stats: synchroStats,
			},
			"Pendulum Xyz": {
				description: spellDescription,
				title: xyzTitle,
				stats: xyzStats,
			},
			"Pendulum Ritual": {
				description: spellDescription,
				title: linkTitle,
				stats: linkStats,
			},
			Trap: { description: trapDescription,
				title: trapTitle,
				stats: effectStats,
			 },
		};
		return types[type as YugiohMonsterType];
	}
	if (card === "Spell") {
		return { description: spellDescription,
			title: spellTitle,
		 };
	}
	if (card === "Trap") {
		return { description: trapDescription,
			title: trapTitle,
		 };
	}
	if (card === "Field") {
		return { description: fieldDescription,
			title: fieldTitle,
		 };
	}
	return { description: effectDescription,
		title: effectTitle,
	 };
};

export default getTypeCardBg;
