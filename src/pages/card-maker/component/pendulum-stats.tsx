const CARD_TEMPLATE_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplate = (fileName: string) =>
	`${CARD_TEMPLATE_BASE_URL}${fileName}`;

const greenGem = cardTemplate("green-gem.webp");
const yellowGem = cardTemplate("yellow-gem.webp");
const scale0 = cardTemplate("scale-0.webp");
const scale1 = cardTemplate("scale-1.webp");
const scale2 = cardTemplate("scale-2.webp");
const scale3 = cardTemplate("scale-3.webp");
const scale4 = cardTemplate("scale-4.webp");
const scale5 = cardTemplate("scale-5.webp");
const scale6 = cardTemplate("scale-6.webp");
const scale7 = cardTemplate("scale-7.webp");
const scale8 = cardTemplate("scale-8.webp");
const scale9 = cardTemplate("scale-9.webp");
interface PendulumStatsProps {
	scale: number;
	className?: string;
}
function PendulumStats(props: PendulumStatsProps) {
	const { scale, className } = props;
	const getScaleCombination = (scale: number) => {
		const scales = {
			0: scale0,
			1: scale1,
			2: scale2,
			3: scale3,
			4: scale4,
			5: scale5,
			6: scale6,
			7: scale7,
			8: scale8,
			9: scale9,
		};
		return scales[scale as keyof typeof scales] || scale0;
	};
	return (
		<div className={`absolute -left-5 -bottom-9 z-3 w-[calc(100%+2.5rem)] flex justify-between ${className ?? ""}`.trim()}>
			<div className="relative w-12">
				<img src={greenGem} alt="Gema verde" className="w-full" />
				<p className="size-full absolute top-0 left-0 flex justify-center items-center">
					{scale > 9 && <img src={scale1} alt="Escala 1" className="h-6" />}
					<img
						src={getScaleCombination(scale > 9 ? scale - 10 : scale)}
						className="h-6"
						alt="número de escala"
					/>
				</p>
			</div>
			<div className="relative w-12">
				<img src={yellowGem} alt="Gema amarilla" className="w-full" />
				<p className="size-full absolute top-0 left-0 flex justify-center items-center">
					{scale > 9 && <img src={scale1} alt="Escala 1" className="h-6" />}
					<img
						src={getScaleCombination(scale > 9 ? scale - 10 : scale)}
						className="h-6"
						alt="número de escala"
					/>
				</p>
			</div>
		</div>
	);
}

export default PendulumStats;
