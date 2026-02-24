import { Textarea } from "@/components/ui/textarea";

export function CardMakerPendulumEffect(props: {
	value: string;
	onInput: (value: string) => void;
}) {
	const { value, onInput } = props;
	return (
		<div className="space-y-2 rounded-md border p-3 sm:p-4">
			<label className="text-sm font-medium" htmlFor="cm-pendulum-description">
				Pendulum Effect
			</label>
			<Textarea
				id="cm-pendulum-description"
				value={value}
				spellcheck={false}
				className="w-full resize-none max-h-20"
				onInput={(e) => onInput(e.currentTarget.value)}
				placeholder="Pendulum effect text..."
				rows={4}
			/>
		</div>
	);
}
