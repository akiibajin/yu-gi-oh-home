import { Switch } from "@/components/ui/switch";
import type { YugiohCardDraft, YugiohMonsterStats } from "@/lib/types";
import { splitPendulumDescription } from "@/lib/split-pendulum-description";
import useCardStore from "@/pages/card-maker/state";
import { useState } from "react";
import { exportPreview } from "@/lib/export-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CardMakerBasicFields } from "./card-maker-form/basic-fields";
import { CardMakerDescriptionFields } from "./card-maker-form/description-fields";
import { CardMakerFormActions } from "./card-maker-form/form-actions";
import { CardMakerImageFields } from "./card-maker-form/image-fields";
import { CardMakerLinkMarkers } from "./card-maker-form/link-markers";
import { CardMakerMonsterBoxColor } from "./card-maker-form/monster-box-color";
import { CardMakerMonsterOptions } from "./card-maker-form/monster-options";
import { CardMakerPendulumEffect } from "./card-maker-form/pendulum-effect";
import type { SetDraftField } from "./card-maker-form/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/warcraftcn/accordion";
import { Label } from "@/components/ui/warcraftcn/label";

export type CardMakerFormExportOptions = {
  id: string;
  folderName?: string;
};

export function CardMakerForm(
  props: {
    onReset?: () => void;
    exportOptions?: CardMakerFormExportOptions | null;
  } = {},
) {
  const { onReset, exportOptions } = props;
  const { card, setCard, resetCard } = useCardStore();
  const draft = card;
  const isMonster = draft.cardType === "Monster";
  const isPendulum =
    isMonster && (draft.monsterType?.includes("Pendulum") ?? false);
  const isLink = isMonster && (draft.monsterType?.includes("Link") ?? false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const setDraftField: SetDraftField = <K extends keyof YugiohCardDraft>(
    key: K,
    value: YugiohCardDraft[K],
  ) => {
    setCard({
      ...card,
      [key]: value,
    });
  };

  const setStatsField = <K extends keyof YugiohMonsterStats>(
    key: K,
    value: YugiohMonsterStats[K],
  ) => {
    setCard({
      ...card,
      stats: {
        ...card.stats!,
        [key]: value,
      },
    });
  };
  const onPendulumEffectInput = (value: string) => {
    setDraftField("pendulumDescription", value);
    const currentDescription = draft.description;
    if (!currentDescription) return;
    const split = splitPendulumDescription(currentDescription);
    if (!split.didSplit) return;
    setDraftField("description", split.monsterDescription);
  };

  const applySplitIfPresent = (value: string) => {
    if (!isPendulum) return false;
    const split = splitPendulumDescription(value);
    if (!split.didSplit) return false;
    setDraftField("pendulumDescription", split.pendulumDescription);
    setDraftField("description", split.monsterDescription);
    return true;
  };

  const onMonsterEffectInput = (value: string) => {
    if (applySplitIfPresent(value)) return;
    setDraftField("description", value);
  };

  const handleImageUpload = (file: File | null) => {
    setDraftField("img", file);
  };

  const handleOverframeImageUpload = (file: File | null) => {
    setDraftField("overframeImg", file);
  };

  const onExport = async () => {
    setExporting(true);
    setSaveStatus("Exportando...");
    try {
      const res = await exportPreview(draft, exportOptions ?? undefined);
      const shownPath =
        res.dir && res.filename ? `${res.dir}/${res.filename}` : res.path;
      setSaveStatus(`exportado en: ${shownPath}`);
    } catch (err) {
      console.error(err);
      setSaveStatus(
        err instanceof Error ? err.message : "No se pudo exportar.",
      );
    } finally {
      setExporting(false);
    }
  };
  console.log({ type: draft.descriptionStatsBoxColor })
  return (
    <Card className="w-full md:max-h-[85vh] md:overflow-auto min-w-0">
      <CardHeader>
        <CardTitle>Configuraciones de la carta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-6 min-w-0 **:data-[slot=select-trigger]:max-w-full **:data-[slot=select-trigger]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full">
        <Accordion type="single" collapsible>
          <AccordionItem value="template">
            <AccordionTrigger>Ajustes de plantilla</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center justify-between border-t p-2 sm:p-3">
                <Label className="text-sm" htmlFor="cm-secondary-template">
                  Plantilla alternativa
                </Label>
                <Switch
                  id="cm-secondary-template"
                  checked={draft.template === "secondary"}
                  onCheckedChange={(checked: boolean) =>
                    setDraftField("template", checked ? "secondary" : "primary")
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="basic">
            <AccordionTrigger>Basicos</AccordionTrigger>
            <AccordionContent>
              <CardMakerBasicFields
                draft={draft}
                setDraftField={setDraftField}
                isSecondaryTemplate={draft.template === "secondary"}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="image">
            <AccordionTrigger>opciones de imagen Imagen</AccordionTrigger>
            <AccordionContent>
              <CardMakerImageFields
                draft={draft}
                setDraftField={setDraftField}
                onImageUpload={handleImageUpload}
                onOverframeImageUpload={handleOverframeImageUpload}
                isSecondaryTemplate={draft.template === "secondary"}
              />
            </AccordionContent>
          </AccordionItem>
          {isMonster && (
            <AccordionItem value="monster">
              <AccordionTrigger>Opciones de Monstruo</AccordionTrigger>
              <AccordionContent>
                <CardMakerMonsterOptions
                  draft={draft}
                  isPendulum={isPendulum}
                  isLink={isLink}
                  setDraftField={setDraftField}
                  setStatsField={setStatsField}
                />
              </AccordionContent>
            </AccordionItem>
          )}
          {isLink && (
            <AccordionItem value="link">
              <AccordionTrigger>Opciones de monstruos enlace</AccordionTrigger>
              <AccordionContent>
                <CardMakerLinkMarkers
                  draft={draft}
                  setDraftField={setDraftField}
                />
              </AccordionContent>
            </AccordionItem>
          )}
          {isPendulum && (
            <AccordionItem value="pendulum">
              <AccordionTrigger>Opciones de monstruo pendulo</AccordionTrigger>
              <AccordionContent>
                <CardMakerPendulumEffect
                  value={draft.pendulumDescription ?? ""}
                  onInput={onPendulumEffectInput}
                />
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="description">
            <AccordionTrigger>Descripción</AccordionTrigger>
            <AccordionContent>
              <CardMakerDescriptionFields
                descriptionType={draft.descriptionStatsBoxColor!}
                onDescriptionTypeChange={(value) =>
                  setDraftField("descriptionStatsBoxColor", value)}
                showDescription={draft.showDescription ?? true}
                isSecondaryTemplate={draft.template === "secondary"}
                onShowDescriptionChange={(checked) =>
                  setDraftField("showDescription", checked)
                }
                descriptionImageOpacity={draft.descriptionImageOpacity}
                onDescriptionImageOpacityChange={(value) =>
                  setDraftField("descriptionImageOpacity", value)
                }
                descriptionTextColor={draft.descriptionTextColor ?? "auto"}
                onDescriptionTextColorChange={(value) =>
                  setDraftField("descriptionTextColor", value)
                }
                descriptionTextSize={draft.descriptionTextSize ?? "normal"}
                onDescriptionTextSizeChange={(value) =>
                  setDraftField("descriptionTextSize", value)
                }
                label={isPendulum ? "Efecto de monstruo" : "Descripción"}
                value={draft.description ?? ""}
                onInput={onMonsterEffectInput}
                placeholder={
                  isPendulum
                    ? "Texto del efecto del monstruo..."
                    : "Texto del efecto de la carta..."
                }
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="format">
            <AccordionTrigger>Formato</AccordionTrigger>
            <AccordionContent><Label className="text-sm font-medium" htmlFor="cm-export-format">
              Formato de exportación
            </Label>
            <Select
              value={draft.exportFormat ?? "webp"}
              onValueChange={(value: string) => {
                setDraftField(
                  "exportFormat",
                  value as "webp" | "png" | "jpg",
                );
              }}
            >
              <SelectTrigger id="cm-export-format" className="w-full">
                <SelectValue placeholder="Selecciona un formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select></AccordionContent>
          </AccordionItem>
        </Accordion>
        <CardMakerFormActions
          onReset={onReset ?? resetCard}
          onExport={onExport}
          exporting={exporting}
          saveStatus={saveStatus}
        />
      </CardContent>
    </Card>
  );
}
