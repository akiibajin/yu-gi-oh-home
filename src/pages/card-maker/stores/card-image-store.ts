import { create } from 'zustand';

export interface CardImageState {
  img: Blob | string | null;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  imgRotationDeg?: number;
  overframe?: boolean;
  fullArt?: boolean;
  overframeImg: Blob | string | null;
  overframeObjectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  overframeImgRotationDeg?: number;
  setImages: (value: Partial<Omit<CardImageState, 'setImages' | 'resetImages'>>) => void;
  resetImages: () => void;
}

const initialImages: Omit<CardImageState, 'setImages' | 'resetImages'> = {
  img: null,
  objectFit: 'cover',
  imgRotationDeg: 0,
  overframe: false,
  fullArt: false,
  overframeImg: null,
  overframeObjectFit: 'cover',
  overframeImgRotationDeg: 0,
};

const useCardImageStore = create<CardImageState>((set: any) => ({
  ...initialImages,
  setImages: (value: any) => set((state: any) => ({ ...state, ...value })),
  resetImages: () => set(() => ({ ...initialImages })),
}));

export default useCardImageStore;

