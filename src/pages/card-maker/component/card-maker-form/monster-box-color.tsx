import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { YUGIOH_DESCRIPTION_STATS_BOX_COLORS } from "@/lib/constants";
import type { YugiohDescriptionStatsBoxColor } from "@/lib/types";

export function CardMakerMonsterBoxColor(props: {
	value: YugiohDescriptionStatsBoxColor | undefined;
	onValueChange: (value: YugiohDescriptionStatsBoxColor) => void;
}) {
	const { value, onValueChange } = props;

	return (
		<div className="space-y-2 rounded-md border p-3 sm:p-4">
			<label className="text-sm font-medium" htmlFor="cm-box-color">
				Description/Stats Box Color
			</label>
			<Select
				value={value ?? "auto"}
				onValueChange={(v: string) => onValueChange(v as YugiohDescriptionStatsBoxColor)}
			>
				<SelectTrigger id="cm-box-color" className="w-full">
					<SelectValue placeholder="Select box color" />
				</SelectTrigger>
				<SelectContent>
					{YUGIOH_DESCRIPTION_STATS_BOX_COLORS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
