import type { LinkMarker, MonsterType, YugiohCardAttribute, YugiohCardType, YugiohMonsterStats, YugiohMonsterType, YugiohSpellType, YugiohTrapType } from '@/lib/types';
import { create } from 'zustand';

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
  setCardData: (value: Partial<Omit<CardDataState, 'setCardData' | 'resetCardData'>>) => void;
  resetCardData: () => void;
}

const initialCardData: Omit<CardDataState, 'setCardData' | 'resetCardData'> = {
  name: '',
  cardType: 'Monster',
  attribute: 'DARK',
  monsterType: 'Effect',
  subType: undefined,
  spellType: undefined,
  trapType: undefined,
  isTuner: false,
  linkRating: 0,
  linkMarkers: [],
  linkMarkersOnDescription: false,
  scale: 0,
  stats: { level: 4, atk: 0, def: 0 },
  description: '',
  pendulumDescription: '',
};

const useCardDataStore = create<CardDataState>((set: any) => ({
  ...initialCardData,
  setCardData: (value: any) => set((state: any) => ({ ...state, ...value })),
  resetCardData: () => set(() => ({ ...initialCardData })),
}));

export default useCardDataStore;

