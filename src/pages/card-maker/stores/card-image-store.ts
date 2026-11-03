import { create } from 'zustand';

export interface CardImageState {
  img: Blob | string | null;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  overframe?: boolean;
  fullArt?: boolean;
  overframeImg: Blob | string | null;
  overframeObjectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  imageDraggingEnabled?: boolean;
  setImages: (value: Partial<Omit<CardImageState, 'setImages' | 'resetImages'>>) => void;
  resetImages: () => void;
}

const initialImages: Omit<CardImageState, 'setImages' | 'resetImages'> = {
  img: null,
  objectFit: 'cover',
  overframe: false,
  fullArt: false,
  overframeImg: null,
  overframeObjectFit: 'cover',
  imageDraggingEnabled: false,
};

const useCardImageStore = create<CardImageState>((set: any) => ({
  ...initialImages,
  setImages: (value: any) => set((state: any) => ({ ...state, ...value })),
  resetImages: () => set(() => ({ ...initialImages })),
}));

export default useCardImageStore;

