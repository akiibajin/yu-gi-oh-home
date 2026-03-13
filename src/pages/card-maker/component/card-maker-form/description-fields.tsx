import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function CardMakerDescriptionFields(props: {
	showDescription: boolean;
	onShowDescriptionChange: (checked: boolean) => void;
	descriptionImageOpacity: number | undefined;
	onDescriptionImageOpacityChange: (value: number | undefined) => void;
	label: string;
	value: string;
	onInput: (value: string) => void;
	placeholder: string;
}) {
	const {
		showDescription,
		onShowDescriptionChange,
		descriptionImageOpacity,
		onDescriptionImageOpacityChange,
		label,
		value,
		onInput,
		placeholder,
	} = props;

	return (
		<div className="space-y-2 rounded-md border p-3 sm:p-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<label className="text-sm font-medium" htmlFor="cm-show-description">
					Mostrar descripción en la vista previa
				</label>
				<Switch
					id="cm-show-description"
					checked={showDescription}
					onCheckedChange={onShowDescriptionChange}
				/>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="cm-description-opacity">
					Opacidad de la imagen de descripción
				</label>
				<Select
					value={
						descriptionImageOpacity === undefined
							? "auto"
							: String(descriptionImageOpacity)
					}
					onValueChange={(value: string) => {
						if (value === "auto") {
							onDescriptionImageOpacityChange(undefined);
							return;
						}
						const parsed = Number.parseFloat(value);
						onDescriptionImageOpacityChange(
							Number.isFinite(parsed) ? parsed : undefined,
						);
					}}
				>
					<SelectTrigger id="cm-description-opacity" className="h-8 w-full">
						<SelectValue placeholder="Opacidad" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="auto">Automático</SelectItem>
						<SelectItem value="0.25">25%</SelectItem>
						<SelectItem value="0.5">50%</SelectItem>
						<SelectItem value="0.75">75%</SelectItem>
						<SelectItem value="1">100%</SelectItem>
					</SelectContent>
				</Select>
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
