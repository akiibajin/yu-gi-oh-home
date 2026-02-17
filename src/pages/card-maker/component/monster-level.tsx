import type { LinkMarker } from "@/lib/types";
import RankImage from "./rank-image";
import rank from "@/assets/images/card-templates/rank.webp";
import star from "@/assets/images/card-templates/star.webp";
import { cn } from "@/lib/utils";

interface MonsterLevelProps {
	level: number;
	link: {
		markers?: LinkMarker[];
		number?: number;
	};
	isTuner?: boolean;
	isXyz?: boolean;
	isLink?: boolean;
}
function MonsterLevel(props: MonsterLevelProps) {
	const { level, link, isXyz, isLink } = props;
	if (isLink && link?.markers) {
		return (
			<RankImage
				linkMarkers={link?.markers}
				linkRating={link?.number ?? 0}
				option="A"
			/>
		);
	}
	return (
		<div className="relative w-12">
			<img src={isXyz ? rank : star} alt="level" className="size-12" />
			<p
				className={cn(
					"absolute text-shadow-outline text-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
				)}
			>
				{level}
			</p>
		</div>
	);
}

export default MonsterLevel;
