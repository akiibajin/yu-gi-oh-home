import { Checkbox } from "@/components/ui/warcraftcn/checkbox";
import { Input } from "@/components/ui/warcraftcn/input";
import { Label } from "@/components/ui/warcraftcn/label";
import type { FC } from "react";
import { CardMakerMonsterOptions } from "./monster-options";
import { CardMakerLinkMarkers } from "./link-markers";
import { CardMakerPendulumEffect } from "./pendulum-effect";
import { YugiohCardDraft, YugiohMonsterStats } from "@/lib/types";
import { SetDraftField } from "./types";
import { CardMakerDescriptionFields } from "./description-fields";
import { splitPendulumDescription } from "@/lib/split-pendulum-description";


interface ContentConfigProps {
  draft: Partial<YugiohCardDraft>;
  setDraftField: SetDraftField;
  setStatsField: <K extends keyof YugiohMonsterStats>(
    key: K,
    value: YugiohMonsterStats[K],
  ) => void;
}

const ContentConfig: FC<ContentConfigProps> = (props) => {
  const { draft, setDraftField, setStatsField } = props;
  const isMonster = draft.cardType === "Monster";
  const isPendulum =
    isMonster && (draft.monsterType?.includes("Pendulum") ?? false);
  const isLink = isMonster && (draft.monsterType?.includes("Link") ?? false);

  const onMonsterEffectInput = (value: string) => {
    if (applySplitIfPresent(value)) return;
    setDraftField("description", value);
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
  return (
    <div>
      <div className="flex items-center">
						<Label className="text-sm font-medium" htmlFor="cm-name">
							Nombre
						</Label>
						<Checkbox
							id="cm-show-name"
							checked={draft.showName ?? true}
							onCheckedChange={(checked: boolean) =>
								setDraftField("showName", checked)
							}
						/>
					</div>
				<Input
					id="cm-name"
					className="w-full md:w-auto"
					value={draft.name}
					onInput={(e) => setDraftField("name", e.currentTarget.value)}
					placeholder="Dark Magician"
      />
      {isMonster && <CardMakerMonsterOptions isLink={isLink} isPendulum={isPendulum} draft={draft} setDraftField={setDraftField} setStatsField={setStatsField} />}
      {isLink && <CardMakerLinkMarkers draft={draft} setDraftField={setDraftField} />}
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
      {isPendulum && <CardMakerPendulumEffect onInput={onPendulumEffectInput} value={draft.pendulumDescription ?? ""} />}
    </div>
  );
};

export default ContentConfig;
