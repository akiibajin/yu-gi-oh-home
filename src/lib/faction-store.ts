import { create } from "zustand";

import type { Faction } from "@/lib/factions";

interface FactionState {
	faction: Faction;
	setFaction: (faction: Faction) => void;
}

export const useFactionStore = create<FactionState>((set) => ({
	faction: "human",
	setFaction: (faction) => set({ faction }),
}));

export default useFactionStore;
