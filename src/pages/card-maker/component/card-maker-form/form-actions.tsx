import { Button } from "@/components/ui/button";

export function CardMakerFormActions(props: {
	onReset: () => void;
	onExport: () => void | Promise<void>;
	exporting: boolean;
	saveStatus: string;
}) {
	const { onReset, onExport, exporting, saveStatus } = props;

	return (
		<>
			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="secondary"
					onClick={onReset}
					className="w-full sm:w-auto"
				>
					Restablecer
				</Button>
				<Button
					type="button"
					onClick={onExport}
					disabled={exporting}
					className="w-full sm:w-auto"
				>
					{exporting ? "Exportando..." : "Exportar"}
				</Button>
			</div>

			{saveStatus ? (
				<div className="text-sm text-muted-foreground">{saveStatus}</div>
			) : null}
		</>
	);
}
