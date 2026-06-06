import type { YugiohCardType, YugiohMonsterType } from "./types";

const NAME_IMAGES_BASE_URL =
  "https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const nameImage = (fileName: string) =>
  `${NAME_IMAGES_BASE_URL}${fileName}-name.webp`;

export const getNameBg = (
  monsterType: YugiohMonsterType | null | undefined,
  cardType: YugiohCardType,
): string | undefined => {
  if (cardType === "Monster") {
    const map: Record<YugiohMonsterType, string> = {
      Normal: "normal",
      Effect: "effect",
      Spirit: "effect",
      Gemini: "effect",
      Ritual: "ritual",
      Fusion: "fusion",
      Synchro: "synchro",
      Xyz: "xyz",
      Link: "link",
      "Pendulum Normal": "pendulum-normal",
      "Pendulum Effect": "pendulum-effect",
      "Pendulum Fusion": "pendulum-fusion",
      "Pendulum Synchro": "pendulum-synchro",
      "Pendulum Xyz": "pendulum-xyz",
      "Pendulum Ritual": "pendulum-ritual",
      Trap: "trap",
      Token: "normal",
    };
    const key = monsterType ?? "Effect";
    const base = map[key] ?? "effect";
    return nameImage(base);
  }
  if (cardType === "Spell") return nameImage("spell");
  if (cardType === "Trap") return nameImage("trap");
  if (cardType === "Field") return nameImage("field");
  return undefined;
};
