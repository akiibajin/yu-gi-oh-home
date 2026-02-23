import greenGem from "@/assets/images/card-templates/green-gem.webp";
import yellowGem from "@/assets/images/card-templates/yellow-gem.webp";
import scale0 from "@/assets/images/card-templates/scale-0.webp";
import scale1 from "@/assets/images/card-templates/scale-1.webp";
import scale2 from "@/assets/images/card-templates/scale-2.webp";
import scale3 from "@/assets/images/card-templates/scale-3.webp";
import scale4 from "@/assets/images/card-templates/scale-4.webp";
import scale5 from "@/assets/images/card-templates/scale-5.webp";
import scale6 from "@/assets/images/card-templates/scale-6.webp";
import scale7 from "@/assets/images/card-templates/scale-7.webp";
import scale8 from "@/assets/images/card-templates/scale-8.webp";
import scale9 from "@/assets/images/card-templates/scale-9.webp";
interface PendulumStatsProps {
	scale: number;
}
function PendulumStats(props: PendulumStatsProps) {
	const { scale } = props;
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
		<div className="absolute -left-5 -bottom-9 z-3 w-105 flex justify-between">
			<div className="relative w-12">
				<img src={greenGem} alt="Green Gem" className="w-full" />
				<p className="size-full absolute top-0 left-0 flex justify-center items-center">
					{scale > 9 && <img src={scale1} alt="Scale 1" className="h-6" />}
					<img
						src={getScaleCombination(scale > 9 ? scale - 10 : scale)}
						className="h-6"
						alt="scale num"
					/>
				</p>
			</div>
			<div className="relative w-12">
				<img src={yellowGem} alt="Yellow Gem" className="w-full" />
				<p className="size-full absolute top-0 left-0 flex justify-center items-center">
					{scale > 9 && <img src={scale1} alt="Scale 1" className="h-6" />}
					<img
						src={getScaleCombination(scale > 9 ? scale - 10 : scale)}
						className="h-6"
						alt="scale num"
					/>
				</p>
			</div>
		</div>
	);
}

export default PendulumStats;
