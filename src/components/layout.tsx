import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ComponentChildren } from "preact";
import { AppSidebar } from "./app-sidebar";

export default function Layout({ children }: { children: ComponentChildren }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	);
}
