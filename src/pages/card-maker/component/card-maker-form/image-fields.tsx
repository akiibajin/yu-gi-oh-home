import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { YugiohCardDraft } from "@/lib/types";
import type { SetDraftField } from "./types";

export function CardMakerImageFields(props: {
	draft: YugiohCardDraft;
	setDraftField: SetDraftField;
	onImageUpload: (file: File | null) => void;
	onOverframeImageUpload: (file: File | null) => void;
	isSecondaryTemplate: boolean;
}) {
	const { draft, setDraftField, onImageUpload, onOverframeImageUpload, isSecondaryTemplate } = props;

	return (
		<div className="space-y-3 rounded-md border p-3 sm:p-4">
			<label className="text-sm font-medium" htmlFor="cm-image">
				Imagen de la carta
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
						Limpiar
					</Button>
					<label className="md:col-start-2 md:self-center flex flex-col m-0 gap-2 md:row-start-2">
						<span>Formato de imagen</span>
						<Select
							value={draft.objectFit}
							onValueChange={(value: string) =>
								setDraftField(
									"objectFit",
									value as "cover" | "contain" | "fill" | "none" | "scale-down",
								)
							}
						>
							<SelectTrigger className="h-8 w-full">
								<SelectValue placeholder="Ajuste" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="contain">Contener</SelectItem>
								<SelectItem value="cover">Cubrir</SelectItem>
								<SelectItem value="fill">Rellenar</SelectItem>
								<SelectItem value="scale-down">Reducir</SelectItem>
								<SelectItem value="none">Ninguno</SelectItem>
							</SelectContent>
						</Select>
					</label>
					<label className="md:col-start-2 md:self-center flex flex-col m-0 gap-2 md:row-start-3">
						<span>Rotación (°)</span>
						<Input
							type="number"
							inputMode="numeric"
							className="h-8"
							value={String(draft.imgRotationDeg ?? 0)}
							onInput={(e) => {
								const raw = e.currentTarget.value;
								const parsed = Number.parseFloat(raw);
								setDraftField(
									"imgRotationDeg",
									Number.isFinite(parsed) ? parsed : 0,
								);
							}}
						/>
					</label>
				</div>
			</div>
			{draft.img ? (
				<div className="text-xs text-muted-foreground">
					Seleccionado:{" "}
					{typeof draft.img === "object" && "name" in draft.img
						? (draft.img as File).name
						: "imagen"}
				</div>
			) : null}

      {!isSecondaryTemplate && <div className="flex items-center justify-between gap-2 pt-2">
        <label className="text-sm font-medium" htmlFor="cm-overframe">
          Overframe
        </label>
        <Switch
          id="cm-overframe"
          checked={draft.overframe ?? false}
          onCheckedChange={(checked: boolean) => {
            setDraftField("overframe", checked);
            if (!checked) setDraftField("overframeImg", null);
          }}
        />
      </div>}

			{draft.overframe ? (
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="cm-overframe-image">
						Imagen overframe
					</label>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center *:min-w-0">
						<Input
							id="cm-overframe-image"
							type="file"
							className="md:w-1/2 max-w-full"
							accept="image/*"
							onChange={(e) => {
								const file = e.currentTarget.files?.[0] ?? null;
								onOverframeImageUpload(file);
							}}
						/>
						<Button
							type="button"
							variant="secondary"
							onClick={() => onOverframeImageUpload(null)}
							disabled={!draft.overframeImg}
						>
							Limpiar
						</Button>
					</div>
					{draft.overframeImg ? (
						<div className="text-xs text-muted-foreground">
							Seleccionado:{" "}
							{typeof draft.overframeImg === "object" && "name" in draft.overframeImg
								? (draft.overframeImg as File).name
								: "imagen"}
						</div>
					) : null}
					<div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_minmax(10rem,1fr)]">
						<label className="flex flex-col gap-2">
							<span>Formato overframe</span>
							<Select
								value={draft.overframeObjectFit}
								onValueChange={(value: string) =>
									setDraftField(
										"overframeObjectFit",
										value as "cover" | "contain" | "fill" | "none" | "scale-down",
									)
								}
							>
								<SelectTrigger className="h-8 w-full">
									<SelectValue placeholder="Ajuste" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="contain">Contener</SelectItem>
									<SelectItem value="cover">Cubrir</SelectItem>
									<SelectItem value="fill">Rellenar</SelectItem>
									<SelectItem value="scale-down">Reducir</SelectItem>
									<SelectItem value="none">Ninguno</SelectItem>
								</SelectContent>
							</Select>
						</label>
						<label className="flex flex-col gap-2">
							<span>Rotación overframe (°)</span>
							<Input
								type="number"
								inputMode="numeric"
								className="h-8"
								value={String(draft.overframeImgRotationDeg ?? 0)}
								onInput={(e) => {
									const raw = e.currentTarget.value;
									const parsed = Number.parseFloat(raw);
									setDraftField(
										"overframeImgRotationDeg",
										Number.isFinite(parsed) ? parsed : 0,
									);
								}}
							/>
						</label>
					</div>
				</div>
			) : null}

      {!isSecondaryTemplate && <div className="flex items-center justify-between gap-2 pt-2">
        <label className="text-sm font-medium" htmlFor="cm-full-art">
          Utilizar imagen como full art
        </label>
        <Switch
          id="cm-full-art"
          checked={draft.fullArt ?? false}
          onCheckedChange={(checked: boolean) =>
            setDraftField("fullArt", checked)
          }
        />
      </div>}
		</div>
	);
}
