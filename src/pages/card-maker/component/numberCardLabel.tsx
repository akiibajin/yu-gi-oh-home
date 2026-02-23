import number0 from "@/assets/images/card-templates/number-0.webp";
import number1 from "@/assets/images/card-templates/number-1.webp";
import number2 from "@/assets/images/card-templates/number-2.webp";
import number3 from "@/assets/images/card-templates/number-3.webp";
import number4 from "@/assets/images/card-templates/number-4.webp";
import number5 from "@/assets/images/card-templates/number-5.webp";
import number6 from "@/assets/images/card-templates/number-6.webp";
import number7 from "@/assets/images/card-templates/number-7.webp";
import number8 from "@/assets/images/card-templates/number-8.webp";
import number9 from "@/assets/images/card-templates/number-9.webp";
interface NumberCardLabelProps {
	value?: number | null;
}
function NumberCardLabel(props: NumberCardLabelProps) {
	const { value } = props;

	if (value === null || value === undefined) return null;
	if (!Number.isFinite(value)) return null;

	const normalized = Math.trunc(Math.abs(value));
	const digitsString = String(normalized);
	if (!/^\d+$/.test(digitsString)) return null;
	const digits = digitsString.split("");
	if (digits.length === 0) return null;

	const digitImages = {
		0: number0,
		1: number1,
		2: number2,
		3: number3,
		4: number4,
		5: number5,
		6: number6,
		7: number7,
		8: number8,
		9: number9,
	} as const;

	return (
		<div className="absolute z-3 -top-9 right-0 flex">
			{digits.map((digit, index) => {
				const digitNumber = Number.parseInt(digit, 10);
				const src = digitImages[digitNumber as keyof typeof digitImages];
				if (!src) return null;
				return (
					<img
						key={`${digit}-${index}`}
						src={src}
						className="h-12"
						alt={`digit ${digit}`}
					/>
				);
			})}
		</div>
	);
}

export default NumberCardLabel;
