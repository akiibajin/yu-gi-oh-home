import useCardDataStore from './card-data-store';
import useCardDisplayStore from './card-display-store';
import useCardImageStore from './card-image-store';
import useCardExportStore from './card-export-store';
import type { YugiohCardDraft } from '@/lib/types';

export const useCardStore = () => {
  const data = useCardDataStore();
  const display = useCardDisplayStore();
  const images = useCardImageStore();
  const exportState = useCardExportStore();

  const card: Partial<YugiohCardDraft> = {
    ...data,
    ...display,
    ...images,
    ...exportState,
  };

  const setCard = (value: Partial<YugiohCardDraft>) => {
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
    
    if (Object.keys(dataUpdate).length) (data as any).setCardData(dataUpdate);
    if (Object.keys(displayUpdate).length) (display as any).setDisplay(displayUpdate);
    if (Object.keys(imageUpdate).length) (images as any).setImages(imageUpdate);
    if (Object.keys(exportUpdate).length) (exportState as any).setExport(exportUpdate);
  };

  const resetCard = () => {
    (data as any).resetCardData();
    (display as any).resetDisplay();
    (images as any).resetImages();
    (exportState as any).resetExport();
  };

  return { card, setCard, resetCard };
};

export default useCardStore;

