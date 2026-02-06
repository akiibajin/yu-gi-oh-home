import EffectMonsterCard from "@/assets/images/card-templates/Effect.webp";
import NormalMonsterCard from "@/assets/images/card-templates/Normal.webp";
import FusionMonsterCard from "@/assets/images/card-templates/Fusion.webp";
import SynchroMonsterCard from "@/assets/images/card-templates/Synchro.webp";
import RitualMonster from "@/assets/images/card-templates/Ritual Monster.webp";
import XyzMonsterCard from "@/assets/images/card-templates/xyz.webp";
import LinkMonsterCard from "@/assets/images/card-templates/Link.webp";
import PendulumMonsterCard from "@/assets/images/card-templates/Pendulum Effect.webp";
import PendulumNormalMonsterCard from "@/assets/images/card-templates/Pendulum Normal.webp";
import PendulumRitualMonsterCard from "@/assets/images/card-templates/Pendulum Ritual.webp";
import PendulumFusionMonsterCard from "@/assets/images/card-templates/Pendulum Fusion.webp";
import PendulumSynchroMonsterCard from "@/assets/images/card-templates/Pendulum Synchro.webp";
import PendulumXyzMonsterCard from "@/assets/images/card-templates/pendulum xyz.webp";
import SpellCard from "@/assets/images/card-templates/Spell.webp";
import TrapCard from "@/assets/images/card-templates/Trap.webp";
import type { YugiohCardType, YugiohMonsterType } from "./types";

const getTypeCardBg = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): { bg: string } => {
	if (card === "Monster") {
		const types: Record<YugiohMonsterType, { bg: string }> = {
			Normal: { bg: NormalMonsterCard },
			Effect: { bg: EffectMonsterCard },
			Ritual: { bg: RitualMonster },
			Fusion: { bg: FusionMonsterCard },
			Synchro: { bg: SynchroMonsterCard },
			Xyz: { bg: XyzMonsterCard },
			Link: { bg: LinkMonsterCard },
			"Pendulum Normal": {
				bg: PendulumNormalMonsterCard,
			},
			"Pendulum Effect": {
				bg: PendulumMonsterCard,
			},
			"Pendulum Fusion": {
				bg: PendulumFusionMonsterCard,
			},
			"Pendulum Synchro": {
				bg: PendulumSynchroMonsterCard,
			},
			"Pendulum Xyz": {
				bg: PendulumXyzMonsterCard,
			},
			"Pendulum Ritual": {
				bg: PendulumRitualMonsterCard,
			},
			Trap: { bg: TrapCard },
		};
		return types[type as YugiohMonsterType];
	}
	if (card === "Spell") {
		return { bg: SpellCard };
	}
	if (card === "Trap") {
		return { bg: TrapCard };
	}
	return { bg: EffectMonsterCard };
};

export default getTypeCardBg;
