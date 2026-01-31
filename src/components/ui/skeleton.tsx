import { cn } from "@/lib/utils";
import type { ComponentProps } from "preact";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-accent animate-pulse rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
