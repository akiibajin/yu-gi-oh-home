import { Fragment, type ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import { useLocation } from "preact-iso";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { ToastContainer } from "react-toastify";

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
		<div className="relative grid grid-rows-[1fr_auto] md:grid-rows-[auto_1fr] h-dvh min-h-dvh min-w-0">
			<header className="hidden md:flex row-start-1 w-full min-w-0 items-center gap-2 border-b bg-card px-4 py-2">
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
			<main className="md:row-start-2 row-start-1 min-h-0 min-w-0 overflow-y-auto px-2 md:px-4 py-3 pb-[env(safe-area-inset-bottom)]">
				{children}
			</main>
			<footer className="md:hidden row-start-2 flex w-full min-w-0 items-center gap-2 border-t bg-card px-4 py-2">
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
			</footer>
			<ToastContainer aria-label="Notifications" />
			<span className="pointer-events-none absolute bottom-1 right-2 select-none text-[10px] text-muted-foreground/70">
				v 6.1.1
			</span>
		</div>
	);
}
