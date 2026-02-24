import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function CardMakerDescriptionFields(props: {
	showDescription: boolean;
	onShowDescriptionChange: (checked: boolean) => void;
	label: string;
	value: string;
	onInput: (value: string) => void;
	placeholder: string;
}) {
	const {
		showDescription,
		onShowDescriptionChange,
		label,
		value,
		onInput,
		placeholder,
	} = props;

	return (
		<div className="space-y-2 rounded-md border p-3 sm:p-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<label className="text-sm font-medium" htmlFor="cm-show-description">
					Show Description in Preview
				</label>
				<Switch
					id="cm-show-description"
					checked={showDescription}
					onCheckedChange={onShowDescriptionChange}
				/>
			</div>
			<label className="text-sm font-medium" htmlFor="cm-description">
				{label}
			</label>
			<Textarea
				id="cm-description"
				value={value}
				spellcheck={false}
				onInput={(e) => onInput(e.currentTarget.value)}
				placeholder={placeholder}
				rows={5}
				className="w-full resize-none max-h-20"
			/>
		</div>
	);
}
