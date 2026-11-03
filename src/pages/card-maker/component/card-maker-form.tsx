import type { YugiohCardDraft, YugiohMonsterStats } from "@/lib/types";
import useCardStore from "@/pages/card-maker/state";
import { FC, useState } from "react";
import { exportPreview } from "@/lib/export-card";
import { CardMakerFormActions } from "./card-maker-form/form-actions";
import { CardMakerImageFields } from "./card-maker-form/image-fields";
import type { SetDraftField } from "./card-maker-form/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import CardConfig from "./card-maker-form/card-config";
import ContentConfig from "./card-maker-form/content-config";

export type CardMakerFormExportOptions = {
  id: string;
  folderName?: string;
};
const TABS: {
  name: "card-config" | "image-options" | "content-config";
  label: string;
}[] = [
  { name: "card-config", label: "Ajustes de carta" },
  { name: "image-options", label: "Imagen" },
  { name: "content-config", label: "Contenido" },
];

export function CardMakerForm(
  props: {
    onReset?: () => void;
    exportOptions?: CardMakerFormExportOptions | null;
  } = {},
) {
  const { onReset, exportOptions } = props;
  const [currentTab, setCurrentTab] = useState<
    "card-config" | "image-options" | "content-config"
  >("card-config");
  const { card, setCard, resetCard } = useCardStore();
  const draft = card;
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const setDraftField: SetDraftField = <K extends keyof YugiohCardDraft>(
    key: K,
    value: YugiohCardDraft[K],
  ) => {
    setCard({
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
  const configElements: Record<
    "card-config" | "image-options" | "content-config",
    FC<{
      draft: Partial<YugiohCardDraft>;
      setDraftField: SetDraftField;
      setStatsField: <K extends keyof YugiohMonsterStats>(
        key: K,
        value: YugiohMonsterStats[K],
      ) => void;
    }>
  > = {
    "card-config": CardConfig,
    "image-options": CardMakerImageFields,
    "content-config": ContentConfig,
  };
  const CurrentConfig =
    configElements?.[currentTab] ?? configElements["card-config"];
  return (
    <Card className="w-full flex flex-col flex-1 px-15! min-w-0">
      <CardHeader>
        <CardTitle>Configuraciones de la carta</CardTitle>
        <div className="flex gap-2 flex-nowrap overflow-auto">
          {TABS.map((tab) => (
            <Button
              className="p-3"
              onClick={() => setCurrentTab(tab.name)}
              key={tab.name}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 min-w-0 **:data-[slot=select-trigger]:max-w-full **:data-[slot=select-trigger]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full md:flex-1 md:max-h-full md:overflow-auto">
        <CurrentConfig
          draft={draft}
          setStatsField={setStatsField}
          setDraftField={setDraftField}
        />
      </CardContent>
      <CardFooter className="justify-end">
        <CardMakerFormActions
          onReset={onReset ?? resetCard}
          onExport={onExport}
          exporting={exporting}
          saveStatus={saveStatus}
        />
      </CardFooter>
    </Card>
  );
}
