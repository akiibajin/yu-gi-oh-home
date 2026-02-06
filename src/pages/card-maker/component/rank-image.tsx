import type { LinkMarker, YugiohCardDraft } from "@/lib/types";
import optionA from "@/assets/images/card-templates/cristal 5.webp";
import optionB from "@/assets/images/card-templates/cristal 6.webp";
import optionC from "@/assets/images/card-templates/cristal 7.webp";
import arrowRed from "@/assets/images/card-templates/cristal-3.webp";
import arrowBlack from "@/assets/images/card-templates/cristal-4.webp";

interface RankImageProps {
	card: YugiohCardDraft;
	option: "A" | "B" | "C";
}

function RankImage(props: RankImageProps) {
	const { card, option } = props;
	const imgCircle =
		option === "A" ? optionA : option === "B" ? optionB : optionC;
	const active = new Set<LinkMarker>(card.linkMarkers ?? []);
	const value = card.linkRating ?? card.stats.level;

	const arrows: { marker: LinkMarker; className: string }[] = [
		{
			marker: "Top",
			className: "absolute left-1/2 -translate-x-1/2 -top-[2px] rotate-0",
		},
		{
			marker: "Top-right",
			className: "absolute top-1 right-0 rotate-[45deg]",
		},
		{
			marker: "Right",
			className: "absolute top-1/2 -translate-y-1/2 -right-1.75 rotate-[90deg]",
		},
		{
			marker: "Bottom-right",
			className: "absolute bottom-1 -right-0 rotate-[135deg]",
		},
		{
			marker: "Bottom",
			className: "absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-[180deg]",
		},
		{
			marker: "Bottom-left",
			className: "absolute bottom-1 -left-0 -rotate-[135deg]",
		},
		{
			marker: "Left",
			className: "absolute top-1/2 -translate-y-1/2 -left-1.75 -rotate-[90deg]",
		},
		{
			marker: "Top-left",
			className: "absolute top-1 -left-0 -rotate-[45deg]",
		},
	];
	return (
		<div className="relative flex items-center justify-center bg-transparent size-12 overflow-visible">
			<img
				src={imgCircle}
				alt={`Rank option ${option}`}
				className="size-full absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
			/>
			<p className="text-white relative mt-px bg-black size-9 rounded-full text-center text-shadow-[0px_0px_2px_black] font-extrabold text-2xl">
				{value}
			</p>
			{arrows.map((a) => (
				<img
					key={a.marker}
					src={active.has(a.marker) ? arrowRed : arrowBlack}
					alt={`${a.marker} link marker`}
					className={`${a.className} w-4`}
				/>
			))}
		</div>
	);
}

export default RankImage;
