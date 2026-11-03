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
import { Label } from "@/components/ui/warcraftcn/label";
import { Checkbox } from "@/components/ui/warcraftcn/checkbox";
import useFactionStore from "@/lib/faction-store";

export function CardMakerImageFields(props: {
	draft: Partial<YugiohCardDraft>;
	setDraftField: SetDraftField;
}) {
  const { draft, setDraftField } = props;
  const faction = useFactionStore().faction
  const isSecondaryTemplate = draft.template === "secondary"

  const handleImageUpload = (file: File | null) => {
    setDraftField("img", file);
  };

  const handleOverframeImageUpload = (file: File | null) => {
    setDraftField("overframeImg", file);
  };

	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium" htmlFor="cm-image">
				Imagen de la carta
			</Label>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center *:min-w-0">
				<Input
					id="cm-image"
					type="file"
					className="md:w-1/2 max-w-full"
					accept="image/*"
					onChange={(e) => {
						const file = e.currentTarget.files?.[0] ?? null;
						handleImageUpload(file);
					}}
        />
        <Button
						type="button"
						variant="secondary"
						className="md:col-start-1 md:row-start-1 md:row-span-2 md:self-center"
						onClick={() => handleImageUpload(null)}
						disabled={!draft.img}
					>
						Limpiar
					</Button>
				<div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_minmax(10rem,1fr)]">
					<Label className="md:col-start-2 md:self-center flex flex-col m-0 gap-2 md:row-start-2">
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
					</Label>
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

			<div className="border-t pt-3">
        <Checkbox
          faction={faction}
					id="cm-image-dragging"
					checked={draft.imageDraggingEnabled ?? false}
					onCheckedChange={(checked) =>
						setDraftField("imageDraggingEnabled", checked === true)
					}
				>
					Habilitar Movimiento y Zoom de Imagen <small>Deshabilitar una vez finalizados los cambios</small>
				</Checkbox>
			</div>

      {!isSecondaryTemplate && <div className="flex items-center gap-2 pt-2">
        <Label className="text-sm font-medium" htmlFor="cm-overframe">
          Overframe
        </Label>
        <Checkbox
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
					<Label className="text-sm font-medium" htmlFor="cm-overframe-image">
						Imagen overframe
					</Label>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center *:min-w-0">
						<Input
							id="cm-overframe-image"
							type="file"
							className="md:w-1/2 max-w-full"
							accept="image/*"
							onChange={(e) => {
								const file = e.currentTarget.files?.[0] ?? null;
								handleOverframeImageUpload(file);
							}}
						/>
						<Button
							type="button"
							variant="secondary"
							onClick={() => handleOverframeImageUpload(null)}
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
						<Label className="flex flex-col gap-2">
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
						</Label>
					</div>
				</div>
			) : null}

      {!isSecondaryTemplate && <div className="flex items-center gap-2 pt-2">
        <Label className="text-sm font-medium" htmlFor="cm-full-art">
          Utilizar imagen como full art
        </Label>
        <Checkbox
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
