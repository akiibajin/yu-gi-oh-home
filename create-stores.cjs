const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, 'src', 'pages', 'card-maker', 'stores');
fs.mkdirSync(base, { recursive: true });

fs.writeFileSync(path.join(base, 'card-data-store.ts'), import type { LinkMarker, MonsterType, YugiohCardAttribute, YugiohCardType, YugiohMonsterStats, YugiohMonsterType, YugiohSpellType, YugiohTrapType } from "@/lib/types";
import { create } from "zustand";

export interface CardDataState {
  name: string;
  cardType: YugiohCardType;
  attribute: YugiohCardAttribute;
  monsterType?: YugiohMonsterType;
  subType?: MonsterType;
  spellType?: YugiohSpellType;
  trapType?: YugiohTrapType;
  isTuner?: boolean;
  linkRating?: number;
  linkMarkers?: LinkMarker[];
  linkMarkersOnDescription?: boolean;
  scale?: number;
  stats: YugiohMonsterStats;
  description: string;
  pendulumDescription?: string;
  setCardData: (value: Partial<CardDataState>) => void;
  resetCardData: () => void;
}

const initialCardData = {
  name: "",
  cardType: "Monster" as YugiohCardType,
  attribute: "DARK" as YugiohCardAttribute,
  monsterType: "Effect" as YugiohMonsterType,
  subType: undefined as MonsterType | undefined,
  spellType: undefined as YugiohSpellType | undefined,
  trapType: undefined as YugiohTrapType | undefined,
  isTuner: false,
  linkRating: 0,
  linkMarkers: [] as LinkMarker[],
  linkMarkersOnDescription: false,
  scale: 0,
  stats: { level: 4, atk: 0, def: 0 },
  description: "",
  pendulumDescription: "",
};

const useCardDataStore = create<CardDataState>((set) => ({
  ...initialCardData,
  setCardData: (value) => set((state) => ({ ...state, ...value })),
  resetCardData: () => set(() => ({ ...initialCardData })),
}));

export default useCardDataStore;
);
