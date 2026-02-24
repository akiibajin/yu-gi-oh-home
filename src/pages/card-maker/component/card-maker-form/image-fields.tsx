import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { YugiohCardDraft } from "@/lib/types";
import type { SetDraftField } from "./types";

export function CardMakerImageFields(props: {
	draft: YugiohCardDraft;
	setDraftField: SetDraftField;
	onImageUpload: (file: File | null) => void;
}) {
	const { draft, setDraftField, onImageUpload } = props;

	return (
		<div className="space-y-3 rounded-md border p-3 sm:p-4">
			<label className="text-sm font-medium" htmlFor="cm-image">
				Card Image
			</label>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center *:min-w-0">
				<Input
					id="cm-image"
					type="file"
					className="md:w-1/2 max-w-full"
					accept="image/*"
					onChange={(e) => {
						const file = e.currentTarget.files?.[0] ?? null;
						onImageUpload(file);
					}}
				/>
				<div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_minmax(10rem,1fr)]">
					<Button
						type="button"
						variant="secondary"
						className="md:col-start-1 md:row-start-2 md:self-center"
						onClick={() => onImageUpload(null)}
						disabled={!draft.img}
					>
						Clear
					</Button>
					<label className="md:col-start-2 md:self-center flex flex-col m-0 gap-2 md:row-start-2">
						<span>Image format</span>
						<Select
							value={draft.objectFit}
							onValueChange={(value: string) =>
								setDraftField(
									"objectFit",
									value as
										| "cover"
										| "contain"
										| "fill"
										| "none"
										| "scale-down",
								)
							}
						>
							<SelectTrigger className="h-8 w-full">
								<SelectValue placeholder="Object Fit" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="contain">Contain</SelectItem>
								<SelectItem value="cover">Cover</SelectItem>
								<SelectItem value="fill">Fill</SelectItem>
								<SelectItem value="scale-down">Scale-down</SelectItem>
								<SelectItem value="none">None</SelectItem>
							</SelectContent>
						</Select>
					</label>
				</div>
			</div>
			{draft.img ? (
				<div className="text-xs text-muted-foreground">
					Selected:{" "}
					{typeof draft.img === "object" && "name" in draft.img
						? (draft.img as File).name
						: "image"}
				</div>
			) : null}
		</div>
	);
}
