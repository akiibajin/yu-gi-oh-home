import type { YugiohCardDB, YugiohCardDraft, YugiohMonsterType } from "./types";

const normalizeCard = (
	card: YugiohCardDB,
): Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string } => {
	return {
		id: `${card.id}`,
		name: card.name,
		cardType: card.card_type,
		description: card.description,
		attribute: card.attribute || "DARK",
		monsterType: card.monster_type
			? (card?.monster_type?.replace(" Monster", "") as YugiohMonsterType)
			: undefined,
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
