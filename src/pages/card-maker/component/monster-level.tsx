import { cn } from "@/lib/utils";
import RankCircle from "./rank-circle";
import type { LinkMarker } from "@/lib/types";

const CARD_TEMPLATE_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplate = (fileName: string) =>
	`${CARD_TEMPLATE_BASE_URL}${fileName}`;

const rank = cardTemplate("rank.webp");
const star = cardTemplate("star.webp");
const tunerStar = cardTemplate("tuner-star.webp");
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
		<div className="relative z-4 grid place-items-center size-14">
			<img
				src={isTuner ? tunerStar : isXyz ? rank : star}
				alt="nivel"
				className="size-14 z-4 absolute"
			/>
			<p
				className={cn(
					"relative z-4 text-black mt-1 text-4xl tracking-tighter",
					isXyz && "text-black!",
					level >= 10 && "-tracking-[0.2em] mr-2",
				)}
			>
				{level}
			</p>
		</div>
	);
}

export default MonsterLevel;
