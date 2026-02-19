import rank from "@/assets/images/card-templates/rank.webp";
import star from "@/assets/images/card-templates/star.webp";
import tunerStar from "@/assets/images/card-templates/tuner-star.webp";
import { cn } from "@/lib/utils";
import RankCircle from "./rank-circle";
import type { LinkMarker } from "@/lib/types";

interface MonsterLevelProps {
	level: number;
	isTuner?: boolean;
	isXyz?: boolean;
	isLink?: boolean;
	linkRating?: number;
	linkMarkers?: LinkMarker[];
}
function MonsterLevel(props: MonsterLevelProps) {
	const { level, isXyz, isLink, isTuner, linkMarkers, linkRating } = props;
	if (isLink) {
		return (
			<RankCircle
				linkMarkers={linkMarkers ?? []}
				linkRating={linkRating ?? 0}
				option="A"
			/>
		);
	}
	return (
		<div className="relative grid place-items-center size-14">
			<img
				src={isTuner ? tunerStar : isXyz ? rank : star}
				alt="level"
				className="size-14 absolute"
			/>
			<p
				className={cn(
					"relative text-black mt-1 text-4xl tracking-tighter",
					!isXyz && "text-black!",
				)}
			>
				{level}
			</p>
		</div>
	);
}

export default MonsterLevel;
