import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Fragment, type ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import { useLocation } from "preact-iso";
import { AppSidebar } from "./app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";

function flattenNavItems(items: NavItem[]): NavItem[] {
	const out: NavItem[] = [];
	for (const item of items) {
		out.push(item);
		if (item.children?.length) out.push(...flattenNavItems(item.children));
	}
	return out;
}

function toTitleCaseFromSegment(segment: string) {
	const decoded = decodeURIComponent(segment);
	return decoded
		.split(/[-_\s]+/g)
		.filter(Boolean)
		.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
		.join(" ");
}

export default function Layout({ children }: { children: ComponentChildren }) {
	const { path, route } = useLocation();

	const navIndex = useMemo(() => {
		const map = new Map<string, NavItem>();
		for (const item of flattenNavItems(NAV_ITEMS)) {
			map.set(item.href, item);
		}
		return map;
	}, []);

	const breadcrumbItems = useMemo(() => {
		const normalized = path.replace(/\/+$/, "") || "/";
		if (normalized === "/") {
			const home = navIndex.get("/");
			return [{ href: "/", title: home?.title ?? "Home" }];
		}

		const segments = normalized.split("/").filter(Boolean);
		const hrefs = [
			"/",
			...segments.map(
				(_, index) => `/${segments.slice(0, index + 1).join("/")}`,
			),
		];

		return hrefs.map((href) => {
			const navItem = navIndex.get(href);
			if (navItem) return { href, title: navItem.title };

			const parts = href.split("/").filter(Boolean);
			const segment = parts.length ? parts[parts.length - 1] : "";
			return { href, title: toTitleCaseFromSegment(segment) };
		});
	}, [path, navIndex]);

	return (
		<SidebarProvider className="grid h-svh min-h-svh min-w-0 grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
			<AppSidebar />
			<header className="col-start-2 row-start-1 flex w-full min-w-0 items-center gap-2 border-b bg-white px-4 py-2">
				<SidebarTrigger />
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbItems.map((item, index) => {
							const isLast = index === breadcrumbItems.length - 1;

							return (
								<Fragment key={item.href}>
									<BreadcrumbItem>
										{isLast ? (
											<BreadcrumbPage>{item.title}</BreadcrumbPage>
										) : (
											<BreadcrumbLink
												href={item.href}
												onClick={(event) => {
													event.preventDefault();
													route(item.href);
												}}
											>
												{item.title}
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{!isLast ? <BreadcrumbSeparator /> : null}
								</Fragment>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
			</header>
			<main className="col-start-2 px-4 py-3 row-start-2 min-h-0 min-w-0 overflow-auto">
				{children}
			</main>
		</SidebarProvider>
	);
}
