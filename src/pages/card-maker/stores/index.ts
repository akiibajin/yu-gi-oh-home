export { default as useCardDataStore } from './card-data-store';
export type { CardDataState } from './card-data-store';
export { default as useCardDisplayStore } from './card-display-store';
export type { CardDisplayState } from './card-display-store';
export { default as useCardImageStore } from './card-image-store';
export type { CardImageState } from './card-image-store';
export { default as useCardExportStore } from './card-export-store';
export type { CardExportState } from './card-export-store';

import useCardDataStore from './card-data-store';
import useCardDisplayStore from './card-display-store';
import useCardImageStore from './card-image-store';
import useCardExportStore from './card-export-store';
import { create } from 'zustand';
import type { YugiohCardDraft } from '@/lib/types';

interface CombinedCardStore {
  card: Partial<YugiohCardDraft>;
  setCard: (value: Partial<YugiohCardDraft>) => void;
  resetCard: () => void;
}

const initialCardCombined = {
  name: '',
  cardType: 'Monster',
  iconProfile: 'light',
  showDescription: true,
  showName: true,
  showNameBox: false,
  showStatsBox: true,
  pendulumDescription: '',
  description: '',
  descriptionTextColor: 'auto',
  descriptionTextSize: 'normal',
  attribute: 'DARK',
  monsterType: 'Effect',
  descriptionStatsBoxColor: 'auto',
  template: 'primary',
  scale: 0,
  stats: { level: 4, atk: 0, def: 0 },
  img: null,
  imgRotationDeg: 0,
  overframe: false,
  fullArt: false,
  overframeImg: null,
  overframeObjectFit: 'cover',
  overframeImgRotationDeg: 0,
  exportFormat: 'webp',
} as Partial<YugiohCardDraft>;

const useCardStoreCombined = create<CombinedCardStore>((set: any) => ({
  card: initialCardCombined,
  setCard: (value: any) => {
    set((state: any) => ({ card: { ...state.card, ...value } }));
    const dataKeys = ['name', 'cardType', 'attribute', 'monsterType', 'subType', 'spellType', 'trapType', 'isTuner', 'linkRating', 'linkMarkers', 'linkMarkersOnDescription', 'scale', 'stats', 'description', 'pendulumDescription'];
    const displayKeys = ['showName', 'showNameBox', 'showDescription', 'showStatsBox', 'template', 'iconProfile', 'descriptionTextColor', 'descriptionTextSize', 'descriptionImageOpacity', 'descriptionStatsBoxColor'];
    const imageKeys = ['img', 'objectFit', 'imgRotationDeg', 'overframe', 'fullArt', 'overframeImg', 'overframeObjectFit', 'overframeImgRotationDeg'];
    const exportKeys = ['exportFormat'];
    
    const dataUpdate: any = {};
    const displayUpdate: any = {};
    const imageUpdate: any = {};
    const exportUpdate: any = {};
    
    for (const k of dataKeys) if (k in value) dataUpdate[k] = (value as any)[k];
    for (const k of displayKeys) if (k in value) displayUpdate[k] = (value as any)[k];
    for (const k of imageKeys) if (k in value) imageUpdate[k] = (value as any)[k];
    for (const k of exportKeys) if (k in value) exportUpdate[k] = (value as any)[k];
    
    if (Object.keys(dataUpdate).length) (useCardDataStore.getState() as any).setCardData(dataUpdate);
    if (Object.keys(displayUpdate).length) (useCardDisplayStore.getState() as any).setDisplay(displayUpdate);
    if (Object.keys(imageUpdate).length) (useCardImageStore.getState() as any).setImages(imageUpdate);
    if (Object.keys(exportUpdate).length) (useCardExportStore.getState() as any).setExport(exportUpdate);
  },
  resetCard: () => {
    set({ card: initialCardCombined });
    (useCardDataStore.getState() as any).resetCardData();
    (useCardDisplayStore.getState() as any).resetDisplay();
    (useCardImageStore.getState() as any).resetImages();
    (useCardExportStore.getState() as any).resetExport();
  },
}));

export { useCardStoreCombined as useCardStore };
export default useCardStoreCombined;

