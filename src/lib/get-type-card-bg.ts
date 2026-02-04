import EffectMonsterCard from "@/assets/images/card-templates/Effect.png";
import EffectMonsterBottomCard from "@/assets/images/card-templates/Effect_Bottom.png";
import NormalMonsterCard from "@/assets/images/card-templates/Normal.png";
import NormalMonsterBottomCard from "@/assets/images/card-templates/Normal_Bottom.png";
import FusionMonsterCard from "@/assets/images/card-templates/Fusion.png";
import FusionMonsterBottomCard from "@/assets/images/card-templates/Fusion_Bottom.png";
import SpellCard from "@/assets/images/card-templates/Spell.png";
import SpellBottom from "@/assets/images/card-templates/Spell_Bottom.png";
import TrapCard from "@/assets/images/card-templates/Trap.png";
import TrapBottom from "@/assets/images/card-templates/Trap_Bottom.png";
import type { YugiohCardType, YugiohMonsterType } from "./types";

const getTypeCardBg = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): { bg: string; bottom: string } => {
	if (card === "Monster") {
		const types: Record<YugiohMonsterType, { bg: string; bottom: string }> = {
			Normal: { bg: NormalMonsterCard, bottom: NormalMonsterBottomCard },
			Effect: { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard },
			Ritual: { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard },
			Fusion: { bg: FusionMonsterCard, bottom: FusionMonsterBottomCard },
			Synchro: { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard },
			Xyz: { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard },
			Link: { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard },
			"Pendulum Normal": {
				bg: NormalMonsterCard,
				bottom: NormalMonsterBottomCard,
			},
			"Pendulum Effect": {
				bg: EffectMonsterCard,
				bottom: EffectMonsterBottomCard,
			},
			"Pendulum Fusion": {
				bg: FusionMonsterCard,
				bottom: FusionMonsterBottomCard,
			},
			"Pendulum Synchro": {
				bg: EffectMonsterCard,
				bottom: EffectMonsterBottomCard,
			},
			"Pendulum Xyz": {
				bg: EffectMonsterCard,
				bottom: EffectMonsterBottomCard,
			},
			"Pendulum Ritual": {
				bg: EffectMonsterCard,
				bottom: EffectMonsterBottomCard,
			},
			Trap: { bg: TrapCard, bottom: TrapBottom },
		};
		return types[type as YugiohMonsterType];
	}
	if (card === "Spell") {
		return { bg: SpellCard, bottom: SpellBottom };
	}
	if (card === "Trap") {
		return { bg: TrapCard, bottom: TrapBottom };
	}
	return { bg: EffectMonsterCard, bottom: EffectMonsterBottomCard };
};

export default getTypeCardBg;
