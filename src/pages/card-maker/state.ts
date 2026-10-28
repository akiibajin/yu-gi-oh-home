import type { YugiohCardDraft } from "@/lib/types";
import { create } from "zustand";

const initialValue: YugiohCardDraft = {
  name: "",
  cardType: "Monster",
  iconProfile: "light",
  showDescription: true,
  showName: true,
  showNameBox: false,
  showStatsBox: true,
  pendulumDescription: "",
  description: "",
  descriptionTextColor: "auto",
  descriptionTextSize: "normal",
  attribute: "DARK",
  monsterType: "Effect",
  descriptionStatsBoxColor: "auto",
  template: "primary",
  scale: 0,
  stats: {
    level: 4,
    atk: 0,
    def: 0,
  },
  img: null,
  imgRotationDeg: 0,
  overframe: false,
  fullArt: false,
  overframeImg: null,
  overframeObjectFit: "cover",
  overframeImgRotationDeg: 0,
  exportFormat: "webp",
};
interface ICardStore {
  card: Partial<YugiohCardDraft>;
  setCard: (value: Partial<YugiohCardDraft>) => void;
  resetCard: () => void;
}
const useCardStore = create<ICardStore>((set) => ({
  card: initialValue,
  setCard: (value) => set((state) => ({ card: { ...state, ...value } })),
  resetCard: () => set(() => ({ card: initialValue })),
}));

export default useCardStore;
