import type { LinkMarker } from "@/lib/types";
import arrowRed from "@/assets/images/card-templates/cristal-3.webp";
import { cn } from "@/lib/utils";

interface RankImageProps {
	linkMarkers: LinkMarker[];
	linkRating: number;
	option: "A" | "B" | "C";
}

function RankImage(props: RankImageProps) {
	const { linkMarkers, option } = props;
	const active = new Set<LinkMarker>(linkMarkers ?? []);

	const arrows: { marker: LinkMarker; className: string }[] = [
		{
			marker: "Top",
			className: cn(
				"absolute left-1/2 -translate-x-1/2",
				option === "B" ? "-top-4" : "-top-0.5",
			),
		},
		{
			marker: "Top-right",
			className: cn(
				"absolute rotate-[45deg]",
				option === "B" ? "-top-2.5 -right-2.5" : "-top-0.75 -right-2.5",
			),
		},
		{
			marker: "Right",
			className: cn(
				"absolute top-1/2 -translate-y-1/2 -right-4.5 rotate-[90deg]",
				option === "B" ? "-right-4.5" : "-right-2",
			),
		},
		{
			marker: "Bottom-right",
			className: cn(
				"absolute bottom-[0.45px] -right-0.25 rotate-[135deg]",
				option === "B" ? "-bottom-2.5 -right-2.5" : "-bottom-0.75 -right-2.5",
			),
		},
		{
			marker: "Bottom",
			className: cn(
				"absolute left-1/2 -translate-x-1/2 bottom-0.5 rotate-[180deg]",
				option === "B" ? "-bottom-2.75" : "-bottom-0.75",
			),
		},
		{
			marker: "Bottom-left",
			className: cn(
				"absolute bottom-[0.45px] -left-0.5 -rotate-[135deg]",
				option === "B" ? "-bottom-2.5 -left-2.5" : "-bottom-0.75 -left-2.5",
			),
		},
		{
			marker: "Left",
			className: cn(
				"absolute top-1/2 -translate-y-1/2 -left-4.5 -rotate-[90deg]",
				option === "B" ? "-left-4.5" : "-left-2",
			),
		},
		{
			marker: "Top-left",
			className: cn(
				"absolute -top-0 -left-0.5 -rotate-[45deg]",
				option === "B" ? "-top-2.5 -left-2.5" : "-top-0.75 -left-2.5",
			),
		},
	];
	const activeArrows = arrows.filter((a) => active.has(a.marker));
	return (
		<div className="absolute z-10 top-0 left-0 flex items-center justify-center bg-transparent size-full">
			{activeArrows.map((a) => (
				<img
					key={a.marker}
					src={arrowRed}
					alt={`${a.marker} link marker`}
					className={`${a.className} w-8 h-5 object-contain`}
				/>
			))}
		</div>
	);
}

export default RankImage;
