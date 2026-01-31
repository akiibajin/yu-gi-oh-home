export type NavItem = {
	title: string;
	href: string;
	children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [{ title: "Home", href: "/" }];
