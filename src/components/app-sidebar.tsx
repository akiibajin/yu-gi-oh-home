import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/lib/constants";

export function AppSidebar() {
	return (
		<Sidebar className="col-start-1 row-span-2">
			<SidebarHeader />
			<SidebarContent>
				<SidebarGroup />
				<SidebarMenu>
					{NAV_ITEMS.map((item) => (
						<SidebarMenuItem key={item.href}>{item.title}</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
