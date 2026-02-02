export type NavItem = {
	title: string;
	href: string;
	children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
	{ title: "Home", href: "/" },
	{ title: "Calculator", href: "/calc" },
];

export const ROYAL_LP = 8000;
export const TAG_LP = 12000;
export const PLAYERS_NAMES = ["Hector", "Wallys", "Hassan", "Jess", "Chauta"];
