export const FACTIONS = ["default", "human", "orc", "elf", "undead"] as const;

export type Faction = (typeof FACTIONS)[number];

export const FACTION_LABELS: Record<Faction, string> = {
	default: "Default",
	human: "Human",
	orc: "Orc",
	elf: "Elf",
	undead: "Undead",
};
