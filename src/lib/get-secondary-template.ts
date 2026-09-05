import { CARD_TEMPLATES_BASE_URL } from "./get-type-card-bg";
import type { YugiohCardType, YugiohMonsterType } from "./types";

const secondaryTemplate = (fileName: string) =>
	`${CARD_TEMPLATES_BASE_URL}${fileName}`;

export const SECONDARY_TEMPLATE_FILES = {
	normal: secondaryTemplate("normal-secondary-template.webp"),
	effect: secondaryTemplate("effect-secondary-template.webp"),
	ritual: secondaryTemplate("ritual-secondary-template.webp"),
	fusion: secondaryTemplate("fusion-secondary-template.webp"),
	synchro: secondaryTemplate("synchro-secondary-template.webp"),
	xyz: secondaryTemplate("xyz-secondary-template.webp"),
	link: secondaryTemplate("link-secondary-template.webp"),
	spell: secondaryTemplate("spell-secondary-template.webp"),
	trap: secondaryTemplate("trap-secondary-template.webp"),
	field: secondaryTemplate("field-secondary-template.webp"),
	"normal-pendulum": secondaryTemplate(
		"normal-pendulum-secondary-template.webp",
	),
	"effect-pendulum": secondaryTemplate(
		"effect-pendulum-secondary-template.webp",
	),
	"fusion-pendulum": secondaryTemplate(
		"fusion-pendulum-secondary-template.webp",
	),
	"synchro-pendulum": secondaryTemplate(
		"synchro-pendulum-secondary-template.webp",
	),
	"xyz-pendulum": secondaryTemplate("xyz-pendulum-secondary-template.webp"),
	"ritual-pendulum": secondaryTemplate(
		"ritual-pendulum-secondary-template.webp",
	),
} as const;

const MONSTER_TEMPLATES: Record<
	YugiohMonsterType,
	{ file: string } | undefined
> = {
	Normal: { file: "normal" },
	Effect: { file: "effect" },
	Spirit: { file: "effect" },
	Gemini: { file: "effect" },
	Ritual: { file: "ritual" },
	Fusion: { file: "fusion" },
	Synchro: { file: "synchro" },
	Xyz: { file: "xyz" },
	Link: { file: "link" },
	Token: undefined,
	"Pendulum Normal": { file: "normal-pendulum" },
	"Pendulum Effect": { file: "effect-pendulum" },
	"Pendulum Fusion": { file: "fusion-pendulum" },
	"Pendulum Synchro": { file: "synchro-pendulum" },
	"Pendulum Xyz": { file: "xyz-pendulum" },
	"Pendulum Ritual": { file: "ritual-pendulum" },
	Trap: { file: "trap" },
};

const getSecondaryTemplate = (
	type: YugiohMonsterType | null,
	card: YugiohCardType,
): string => {
	if (card === "Spell") return SECONDARY_TEMPLATE_FILES.spell;
	if (card === "Trap") return SECONDARY_TEMPLATE_FILES.trap;
	if (card === "Field") return SECONDARY_TEMPLATE_FILES.field;
	if (card === "Monster" && type) {
		const file = MONSTER_TEMPLATES[type]?.file;
		if (file)
			return SECONDARY_TEMPLATE_FILES[
				file as keyof typeof SECONDARY_TEMPLATE_FILES
			];
	}
	return SECONDARY_TEMPLATE_FILES.effect;
};

export default getSecondaryTemplate;
