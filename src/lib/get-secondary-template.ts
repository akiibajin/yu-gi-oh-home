import { CARD_TEMPLATES_BASE_URL } from "./get-type-card-bg";
import type { YugiohCardType, YugiohMonsterType } from "./types";

const secondaryAsset = (fileName: string) => `${CARD_TEMPLATES_BASE_URL}${fileName}`;

export const SECONDARY_TEMPLATE_FILES = {
	normal: secondaryAsset("normal-secondary-template.webp"),
	effect: secondaryAsset("effect-secondary-template.webp"),
	ritual: secondaryAsset("ritual-secondary-template.webp"),
	fusion: secondaryAsset("fusion-secondary-template.webp"),
	synchro: secondaryAsset("synchro-secondary-template.webp"),
	xyz: secondaryAsset("xyz-secondary-template.webp"),
	link: secondaryAsset("link-secondary-template.webp"),
	spell: secondaryAsset("spell-secondary-template.webp"),
	trap: secondaryAsset("trap-secondary-template.webp"),
	field: secondaryAsset("field-secondary-template.webp"),
	"normal-pendulum": secondaryAsset("normal-pendulum-secondary-template.webp"),
	"effect-pendulum": secondaryAsset("effect-pendulum-secondary-template.webp"),
	"fusion-pendulum": secondaryAsset("fusion-pendulum-secondary-template.webp"),
	"synchro-pendulum": secondaryAsset("synchro-pendulum-secondary-template.webp"),
	"xyz-pendulum": secondaryAsset("xyz-pendulum-secondary-template.webp"),
	"ritual-pendulum": secondaryAsset("ritual-pendulum-secondary-template.webp"),
} as const;

export const SECONDARY_DESCRIPTION_FILES = {
	normal: secondaryAsset("normal-secondary-description.webp"),
	effect: secondaryAsset("effect-secondary-description.webp"),
	ritual: secondaryAsset("ritual-secondary-description.webp"),
	fusion: secondaryAsset("fusion-secondary-description.webp"),
	synchro: secondaryAsset("synchro-secondary-description.webp"),
	xyz: secondaryAsset("xyz-secondary-description.webp"),
	link: secondaryAsset("link-secondary-description.webp"),
	spell: secondaryAsset("spell-secondary-description.webp"),
	trap: secondaryAsset("trap-secondary-description.webp"),
	field: secondaryAsset("field-secondary-description.webp"),
} as const;

const MONSTER_TEMPLATES: Record<
	YugiohMonsterType,
	keyof typeof SECONDARY_TEMPLATE_FILES | undefined
> = {
	Normal: "normal",
	Effect: "effect",
	Spirit: "effect",
	Gemini: "effect",
	Ritual: "ritual",
	Fusion: "fusion",
	Synchro: "synchro",
	Xyz: "xyz",
	Link: "link",
	Token: undefined,
	"Pendulum Normal": "normal-pendulum",
	"Pendulum Effect": "effect-pendulum",
	"Pendulum Fusion": "fusion-pendulum",
	"Pendulum Synchro": "synchro-pendulum",
	"Pendulum Xyz": "xyz-pendulum",
	"Pendulum Ritual": "ritual-pendulum",
	Trap: "trap",
};

const getTemplateKey = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): keyof typeof SECONDARY_TEMPLATE_FILES => {
	if (card === "Spell") return "spell";
	if (card === "Trap") return "trap";
	if (card === "Field") return "field";
	return (type && MONSTER_TEMPLATES[type]) || "effect";
};

const getSecondaryTemplate = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): string => SECONDARY_TEMPLATE_FILES[getTemplateKey(type, card)];

export const getSecondaryDescription = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): string => {
	const templateKey = getTemplateKey(type, card);
	const descriptionKey = templateKey.endsWith("-pendulum")
		? templateKey.replace("-pendulum", "")
		: templateKey;
	return SECONDARY_DESCRIPTION_FILES[
		descriptionKey as keyof typeof SECONDARY_DESCRIPTION_FILES
	] ?? SECONDARY_DESCRIPTION_FILES.effect;
};

export default getSecondaryTemplate;
