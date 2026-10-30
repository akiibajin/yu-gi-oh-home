import { BOX_TEXTURES } from "@/lib/get-type-card-bg";
import { cn } from "@/lib/utils";
import PendulumStats from "./pendulum-stats";
import NumberCardLabel from "./numberCardLabel";
import RankImage from "./rank-image";
import { YugiohCardDraft } from "@/lib/types";

export type PrimaryDescriptionProps = {
  isPendulum: boolean;
  showDescription: boolean;
  isNumber: boolean;
  isVoidDescriptionStatsBox: boolean;
  isVoidInverseDescriptionStatsBox: boolean;
  isSecondaryTemplate: boolean;
  descriptionImageOpacity: number;
  descriptionTextSizeClass: string;
  descriptionTextColorClass: string;
  draft: Partial<YugiohCardDraft>;
  typeCardImg: {
    description: string;
    stats?: string | undefined;
    border?: string | undefined;
  };
  monsterDescription: string;
  numberLabelValue: number | null;
  isLink: boolean;
};

const PrimaryDescription = (props: PrimaryDescriptionProps) => {
  const {
    isPendulum,
    showDescription,
    isNumber,
    isVoidDescriptionStatsBox,
    isVoidInverseDescriptionStatsBox,
    isSecondaryTemplate,
    descriptionImageOpacity,
    descriptionTextSizeClass,
    descriptionTextColorClass,
    draft,
    typeCardImg,
    monsterDescription,
    numberLabelValue,
    isLink,
  } = props;
  return (
    <>
      {isPendulum && (
        <div className="relative mb-3 z-4 w-full flex justify-center pb-0.5">
          {showDescription ? (
            <>
              {!isVoidDescriptionStatsBox &&
              !isVoidInverseDescriptionStatsBox &&
              !isSecondaryTemplate ? (
                <img
                  src={BOX_TEXTURES.Spell.description}
                  alt="descripción"
                  className="absolute size-full object-fill"
                  style={{ opacity: descriptionImageOpacity }}
                />
              ) : null}
              <p
                className={cn(
                  "relative z-2 tracking-tighter leading-3.75! max-w-[95%] size-full whitespace-pre-line",
                  descriptionTextSizeClass,
                  descriptionTextColorClass,
                  isVoidDescriptionStatsBox &&
                    "text-white! text-shadow-outline",
                  isVoidInverseDescriptionStatsBox &&
                    "text-black! text-shadow-outline-inverse",
                )}
              >
                {draft.pendulumDescription}
              </p>
            </>
          ) : null}
          <PendulumStats
            scale={draft.scale ?? 0}
            className={cn(!showDescription && "bottom-50")}
          />
        </div>
      )}
      {showDescription ? (
        <div
          className={cn(
            "relative py-px max-h-full z-4 w-full flex pb-0.5 flex-col justify-start items-center",
          )}
        >
          {isNumber && (
            <NumberCardLabel
              className={cn("-top-9")}
              value={numberLabelValue}
            />
          )}
          {isLink && draft.linkMarkersOnDescription && (
            <RankImage
              linkMarkers={draft.linkMarkers ?? []}
              linkRating={draft.linkRating ?? 0}
              option="B"
            />
          )}
          {!isVoidDescriptionStatsBox &&
          !isVoidInverseDescriptionStatsBox &&
          !isSecondaryTemplate ? (
            <img
              src={typeCardImg.description}
              alt="descripción"
              className="absolute -z-10 size-full object-fill"
              style={{ opacity: descriptionImageOpacity }}
            />
          ) : null}
          <p
            className={cn(
              "relative z-2 tracking-tighter leading-3.75! max-w-[95%] size-full whitespace-pre-line",
              descriptionTextSizeClass,
              descriptionTextColorClass,
              isVoidDescriptionStatsBox && "text-white! text-shadow-outline",
              isVoidInverseDescriptionStatsBox &&
                "text-black! text-shadow-outline-inverse",
            )}
          >
            {monsterDescription}
          </p>
        </div>
      ) : null}
    </>
  );
};

export default PrimaryDescription;
