import type { LinkMarker } from "@/lib/types";
import arrowSide from "@/assets/images/card-templates/topCenter.webp";
import arrowDiagonal from "@/assets/images/card-templates/topRight.webp";

interface RankImageProps {
	linkMarkers: LinkMarker[];
	linkRating: number;
	option: "A" | "B" | "C";
}

function RankImage(props: RankImageProps) {
	const { linkMarkers } = props;
	const active = new Set<LinkMarker>(linkMarkers ?? []);

	const arrows: { marker: LinkMarker; className: string }[] = [
		{
			marker: "Top",
			className: "absolute left-1/2 w-12.5 -translate-x-1/2 top-0",
		},
		{
			marker: "Top-right",
			className: "absolute top-[0.45px] w-10 -right-[0.1px]",
		},
		{
			marker: "Right",
			className:
				"absolute top-1/2 w-12.5 -translate-y-1/2 -right-4.5 rotate-[90deg]",
		},
		{
			marker: "Bottom-right",
			className: "absolute bottom-[0.45px] w-10 -right-0.25 rotate-[90deg]",
		},
		{
			marker: "Bottom",
			className:
				"absolute left-1/2 w-14 -translate-x-1/2 bottom-0.5 rotate-[180deg]",
		},
		{
			marker: "Bottom-left",
			className: "absolute bottom-[0.45px] w-10 -left-0.5 -rotate-[180deg]",
		},
		{
			marker: "Left",
			className:
				"absolute top-1/2 w-12.5 -translate-y-1/2 -left-4.5 -rotate-[90deg]",
		},
		{
			marker: "Top-left",
			className: "absolute w-10 -top-0 -left-0.5 -rotate-[90deg]",
		},
	];
	const activeArrows = arrows.filter((a) => active.has(a.marker));
	return (
		<div className="absolute z-10 top-0 left-0 flex items-center justify-center bg-transparent size-full overflow-visible">
			{activeArrows.map((a) => (
				<img
					key={a.marker}
					src={a.marker.includes("-") ? arrowDiagonal : arrowSide}
					alt={`${a.marker} link marker`}
					className={`${a.className} object-contain`}
				/>
			))}
		</div>
	);
}

export default RankImage;
