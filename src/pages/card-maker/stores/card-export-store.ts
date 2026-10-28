import type { YugiohExportFormat } from '@/lib/types';
import { create } from 'zustand';

export interface CardExportState {
  exportFormat?: YugiohExportFormat;
  setExport: (value: Partial<Omit<CardExportState, 'setExport' | 'resetExport'>>) => void;
  resetExport: () => void;
}

const initialExport: Omit<CardExportState, 'setExport' | 'resetExport'> = {
  exportFormat: 'webp',
};

const useCardExportStore = create<CardExportState>((set: any) => ({
  ...initialExport,
  setExport: (value: any) => set((state: any) => ({ ...state, ...value })),
  resetExport: () => set(() => ({ ...initialExport })),
}));

export default useCardExportStore;

