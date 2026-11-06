import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState } from "react";
import NumberCardLabel from "./numberCardLabel";
import PendulumStats from "./pendulum-stats";
import { SecondaryDescriptionSection } from "./secondary-description-section";

interface SecondaryDescriptionProps {
	pendulumDescription: string;
	isPendulum: boolean;
	isNumber: boolean;
	numberLabelValue: number | null;
	description: string;
	descriptionImage: string;
	spellDescriptionImage: string;
  scale?: number;
	size?: "standard" | "large";
	fontSize: number;
	onHeightChange: (height: number) => void;
}

export function SecondaryDescription(props: SecondaryDescriptionProps) {
	const {
		pendulumDescription,
		isPendulum,
		isNumber,
		numberLabelValue,
		description,
		descriptionImage,
		spellDescriptionImage,
    scale = 0,
		size = "standard",
		fontSize,
		onHeightChange,
	} = props;
	const descriptionRef = useRef<HTMLDivElement | null>(null);
	const pendulumSectionRef = useRef<HTMLDivElement | null>(null);
	const numberDescriptionRef = useRef<HTMLDivElement | null>(null);
	const [pendulumBoundaryY, setPendulumBoundaryY] = useState(0);
	const [numberLabelTop, setNumberLabelTop] = useState(0);
	const hasDescription = description.trim().length > 0;
	const hasPendulumDescription = pendulumDescription.trim().length > 0;

	useLayoutEffect(() => {
		const container = descriptionRef.current;
		if (!container) return;

		const updateLayout = () => {
			onHeightChange(container.getBoundingClientRect().height);
			const pendulumSection = pendulumSectionRef.current;
			const coordinateOrigin =
				container.offsetParent?.getBoundingClientRect().top ??
				container.getBoundingClientRect().top;
			const boundaryY = pendulumSection
				? pendulumSection.getBoundingClientRect().top - coordinateOrigin
				: 0;
			setPendulumBoundaryY((current) =>
				Math.abs(current - boundaryY) < 0.1 ? current + 12 : boundaryY + 12,
			);

			const numberSection = numberDescriptionRef.current;
			const numberTop = numberSection
				? numberSection.getBoundingClientRect().top - coordinateOrigin
				: container.getBoundingClientRect().top - coordinateOrigin;
			setNumberLabelTop((current) =>
				Math.abs(current - numberTop) < 0.1 ? current : numberTop,
			);
		};
		updateLayout();

		const observer = new ResizeObserver(updateLayout);
		observer.observe(container);
		if (pendulumSectionRef.current) {
			observer.observe(pendulumSectionRef.current);
		}
		if (numberDescriptionRef.current) {
			observer.observe(numberDescriptionRef.current);
		}
		return () => observer.disconnect();
	}, [onHeightChange, isPendulum, pendulumDescription, description, fontSize]);

	return (
		<>
			{isNumber && (
				<NumberCardLabel
					className="right-5 -translate-y-full"
					style={{ top: numberLabelTop }}
					value={numberLabelValue}
				/>
			)}
			{isPendulum && (
				<PendulumStats
					scale={scale}
					placement="boundary"
					className="-translate-y-full"
					style={{ top: pendulumBoundaryY }}
				/>
			)}
			<div
				ref={descriptionRef}
				className={cn(
					"relative z-0 flex h-auto max-h-58 w-full flex-col overflow-hidden text-black",
					size === "large" ? "-mx-1.75 min-w-106" : "-mx-2.25 min-w-99.25"
				)}
			>
				{isPendulum ? (
					<>
						{hasPendulumDescription && (
							<div ref={pendulumSectionRef}>
								<SecondaryDescriptionSection
									backgroundImage={spellDescriptionImage}
									className="pb-3"
									text={pendulumDescription}
									fontSize={fontSize}
								/>
							</div>
						)}
						{hasDescription && (
							<div ref={numberDescriptionRef}>
								<SecondaryDescriptionSection
									backgroundImage={descriptionImage}
									className="pb-4.75 max-h-full"
									text={description}
									fontSize={fontSize}
								/>
							</div>
						)}
					</>
				) : (
					hasDescription && (
						<div ref={numberDescriptionRef}>
							<SecondaryDescriptionSection
								backgroundImage={descriptionImage}
								className="pb-4.5 max-h-full"
								text={description}
								fontSize={fontSize}
							/>
						</div>
					)
				)}
			</div>
		</>
	);
}
