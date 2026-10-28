import type { MonsterTypeIconProfile, YugiohDescriptionStatsBoxColor, YugiohDescriptionTextColor, YugiohDescriptionTextSize, YugiohTemplate } from '@/lib/types';
import { create } from 'zustand';

export interface CardDisplayState {
  showName?: boolean;
  showNameBox?: boolean;
  showDescription?: boolean;
  showStatsBox?: boolean;
  template?: YugiohTemplate;
  iconProfile?: MonsterTypeIconProfile;
  descriptionTextColor?: YugiohDescriptionTextColor;
  descriptionTextSize?: YugiohDescriptionTextSize;
  descriptionImageOpacity?: number;
  descriptionStatsBoxColor?: YugiohDescriptionStatsBoxColor;
  setDisplay: (value: Partial<Omit<CardDisplayState, 'setDisplay' | 'resetDisplay'>>) => void;
  resetDisplay: () => void;
}

const initialDisplay: Omit<CardDisplayState, 'setDisplay' | 'resetDisplay'> = {
  showName: true,
  showNameBox: false,
  showDescription: true,
  showStatsBox: true,
  template: 'primary',
  iconProfile: 'light',
  descriptionTextColor: 'auto',
  descriptionTextSize: 'normal',
  descriptionImageOpacity: undefined,
  descriptionStatsBoxColor: 'auto',
};

const useCardDisplayStore = create<CardDisplayState>((set: any) => ({
  ...initialDisplay,
  setDisplay: (value: any) => set((state: any) => ({ ...state, ...value })),
  resetDisplay: () => set(() => ({ ...initialDisplay })),
}));

export default useCardDisplayStore;

