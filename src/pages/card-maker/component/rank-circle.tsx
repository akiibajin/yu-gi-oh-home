import type { LinkMarker } from "@/lib/types";
import optionA from "@/assets/images/card-templates/cristal 5.webp";
import optionB from "@/assets/images/card-templates/cristal 6.webp";
import optionC from "@/assets/images/card-templates/cristal 7.webp";
import arrowRed from "@/assets/images/card-templates/cristal-3.webp";
import arrowBlack from "@/assets/images/card-templates/cristal-4.webp";

interface RankCircleProps {
	linkMarkers: LinkMarker[];
	linkRating: number;
	option: "A" | "B" | "C";
}

function RankCircle(props: RankCircleProps) {
	const { linkMarkers, linkRating, option } = props;
	const imgCircle =
		option === "A" ? optionA : option === "B" ? optionB : optionC;
	const active = new Set<LinkMarker>(linkMarkers ?? []);
	const value = linkRating;

	const arrows: { marker: LinkMarker; className: string }[] = [
		{
			marker: "Top",
			className: "absolute left-1/2 -translate-x-1/2 -top-[3px] rotate-0",
		},
		{
			marker: "Top-right",
			className: "absolute top-0.75 -right-0.25 rotate-[45deg]",
		},
		{
			marker: "Right",
			className:
				"absolute top-1/2 -translate-y-1/2 -right-[7.5px] rotate-[90deg]",
		},
		{
			marker: "Bottom-right",
			className: "absolute bottom-0.5 -right-0 rotate-[135deg]",
		},
		{
			marker: "Bottom",
			className:
				"absolute left-1/2 -translate-x-1/2 -bottom-1.25 rotate-[180deg]",
		},
		{
			marker: "Bottom-left",
			className: "absolute bottom-0.5 -left-0 -rotate-[135deg]",
		},
		{
			marker: "Left",
			className:
				"absolute top-1/2 -translate-y-1/2 -left-[7.5px] -rotate-[90deg]",
		},
		{
			marker: "Top-left",
			className: "absolute top-1 -left-0 -rotate-[45deg]",
		},
	];
	return (
		<div className="relative z-2 flex items-center justify-center bg-transparent size-12 overflow-visible">
			<img
				src={imgCircle}
				alt={`Opción de rango ${option}`}
				className="size-full absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
			/>
			<p className="text-white leading-8.5 relative mt-px size-9 rounded-full text-center text-shadow-outline font-extrabold text-4xl">
				{value}
			</p>
			{arrows.map((a) => (
				<img
					key={a.marker}
					src={active.has(a.marker) ? arrowRed : arrowBlack}
					alt={`Marcador de enlace: ${a.marker}`}
					className={`${a.className} w-4`}
				/>
			))}
		</div>
	);
}

export default RankCircle;
