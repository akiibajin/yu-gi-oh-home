import { cn } from "cn";

interface SecondaryDescriptionSectionProps {
	backgroundImage: string;
	className: string;
	text: string;
	fontSize: number;
}

export function SecondaryDescriptionSection(
	props: SecondaryDescriptionSectionProps,
) {
	const { backgroundImage, className, text, fontSize } = props;

	return (
		<div className={`relative min-h-0 overflow-hidden`}>
			<img
				src={backgroundImage}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 size-full object-fill"
			/>
			<p
				className={cn("relative z-1 whitespace-pre-line wrap-break-word px-2 pt-3 leading-tight tracking-tighter text-black", className)}
				style={{ fontSize }}
			>
				{text}
			</p>
		</div>
	);
}
