import type {
	YugiohCardDB,
	YugiohCardWithImgUrl,
	YugiohMonsterType,
} from "./types";

const formatMonsterType = (
	type: string | null,
): YugiohMonsterType | undefined => {
	if (!type) return undefined;
	const formattedType = type.replace(" Monster", "") as YugiohMonsterType;
	if (formattedType.includes("XYZ")) {
		return formattedType.replace("XYZ", "Xyz") as YugiohMonsterType;
	}
	if (formattedType.includes("Ritual")) {
		return formattedType.replace("Effect", "").trim() as YugiohMonsterType;
	}
	if (formattedType.includes("Tuner")) {
		return (
			(formattedType.replace("Tuner", "").trim() as YugiohMonsterType) ||
			"Effect"
		);
	}
	return formattedType;
};

const getDescription = (card: YugiohCardDB): string => {
	if (!card.monster_type?.includes("Pendulum")) {
		return card.description;
	}
	const monsterEffect = card.description.split("[ Monster Effect ]")[1];
	return monsterEffect.trim();
};

const getPendulumDescription = (card: YugiohCardDB): string | undefined => {
	if (!card.monster_type?.includes("Pendulum")) {
		return undefined;
	}
	const pendulumEffect = card.description.split("[ Monster Effect ] ")[0];
	return pendulumEffect.replace("[ Pendulum Effect ]", "").trim();
};

const normalizeCard = (card: YugiohCardDB): YugiohCardWithImgUrl => {
	return {
		id: `${card.id}`,
		name: card.name,
		cardType: card.card_type,
		description: getDescription(card),
		pendulumDescription: getPendulumDescription(card),
		attribute: card.attribute || "DARK",
		monsterType: formatMonsterType(card.monster_type),
		subType: card.sub_type || undefined,
		isTuner: card.is_tuner || undefined,
		linkRating: card.link_rating || undefined,
		linkMarkers: card.link_markers || undefined,
		stats: {
			level: card.level || 0,
			atk: card.atk || 0,
			def: card.def || 0,
		},
		spellType: card.spell_type || undefined,
		trapType: card.trap_type || undefined,
		imgUrl: card.img_url,
	};
};

export default normalizeCard;
