import {
  FIELD_SPELL_ICON,
  getMonsterTypeIcon,
  SPELL_ICONS,
  TRAP_ICONS,
  YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import getTypeCardBg from "@/lib/get-type-card-bg";
import getSecondaryTemplate, {
  getSecondaryDescription,
  SECONDARY_DESCRIPTION_FILES,
} from "@/lib/get-secondary-template";
import useCardStore from "@/pages/card-maker/state";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import MonsterLevel from "./monster-level";
import RankImage from "./rank-image";
import NumberCardLabel from "./numberCardLabel";
import { CardNameDisplay } from "./card-name-display";
import { getNameBg } from "@/lib/get-name-bg";
import PrimaryDescription from "./primary-description";
import { SecondaryDescription } from "./secondary-description";
import InteractiveImage, { InteractiveImageHandle } from "./interactive-image";
import ImageZoomControls from "./image-zoom-controls";

interface CardPreviewProps {
  size: "large" | "standard";
}
export function CardPreview(props: CardPreviewProps) {
  const { size } = props;
  const draft = useCardStore().card;
  const showName: boolean = draft.showName ?? true;
  const showNameBox: boolean = draft.showNameBox ?? false;
  const displayName = draft.name?.trim() || "";
  const nameBgUrl = showNameBox
    ? getNameBg(draft.monsterType, draft.cardType!)
    : undefined;
  const isMonster = draft.cardType === "Monster";
  const isXyz = isMonster && (draft.monsterType?.includes("Xyz") ?? false);
  const isSynchro =
    isMonster && (draft.monsterType?.includes("Synchro") ?? false);
  const isLink = isMonster && (draft.monsterType?.includes("Link") ?? false);
  const isPendulum =
    isMonster && (draft.monsterType?.includes("Pendulum") ?? false);
  const isXyzOrLink = Boolean(isXyz || isLink);
  const isFusion =
    isMonster && (draft.monsterType?.includes("Fusion") ?? false);
  const isNumber =
    isXyz &&
    (draft.name?.toLowerCase().includes("number") ||
      draft.name?.toLowerCase().includes("número"));
  const descriptionImageOpacity =
    draft.descriptionImageOpacity ?? (isSynchro || isXyz ? 0.8 : 0.5);
  const numberLabelValue = useMemo(() => {
    if (!isNumber) return null;
    const match =
      draft.name?.match(/\bnumber\s*(\d+)/i) ||
      draft.name?.match(/\bnúmero\s*(\d+)/i);
    if (!match) return null;
    const parsed = Number.parseInt(match[1], 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [draft.name, isNumber]);
  const isVoidDescriptionStatsBox = draft.descriptionStatsBoxColor === "void";
  const isVoidInverseDescriptionStatsBox =
    draft.descriptionStatsBoxColor === "void-inverse";
  const showDescription = draft.showDescription ?? true;
  const monsterDescription = draft.description?.trim();
  const [secondaryDescriptionHeight, setSecondaryDescriptionHeight] =
    useState(0);
  const handleSecondaryDescriptionHeightChange = useCallback(
    (height: number) => {
      setSecondaryDescriptionHeight((current) =>
        current === height ? current : height,
      );
    },
    [],
  );
  const descriptionTextColor = draft.descriptionTextColor ?? "auto";
  const descriptionTextColorClass = isXyzOrLink
    ? "text-white!"
    : descriptionTextColor === "white"
      ? "text-white!"
      : "text-black!";
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [overframeImgUrl, setOverframeImgUrl] = useState<string | null>(null);
  const mainImageRef = useRef<InteractiveImageHandle>(null);
  const overframeImageRef = useRef<InteractiveImageHandle>(null);
  const imageDraggingEnabled = draft.imageDraggingEnabled ?? false;
  const resolvedOverframeImgUrl =
    draft.fullArt && imgUrl ? imgUrl : overframeImgUrl;
  const showMainImage = Boolean(imgUrl) && !draft.fullArt;
  const showOverframeImage = Boolean(resolvedOverframeImgUrl);

  const typeCardImg = getTypeCardBg(
    draft.monsterType ?? null,
    draft.cardType!,
    draft.descriptionStatsBoxColor,
  );
  const isSecondaryTemplate = draft.template === "secondary";
  const borderImg = isSecondaryTemplate
    ? getSecondaryTemplate(draft.monsterType ?? null, draft.cardType!)
    : typeCardImg.border;
  const iconImg = useMemo(() => {
    if (draft.cardType === "Spell") {
      return SPELL_ICONS[draft.spellType as keyof typeof SPELL_ICONS];
    }
    if (draft.cardType === "Trap") {
      return TRAP_ICONS[draft.trapType as keyof typeof TRAP_ICONS];
    }
    if (draft.cardType === "Field") {
      return FIELD_SPELL_ICON;
    }
    return YUGIOH_ATTRIBUTES.find((attr) => attr.title === draft.attribute)
      ?.img;
  }, [draft]);
  const monsterTypeIcon = isMonster
    ? getMonsterTypeIcon(
        draft.attribute === "DIVINE" ? "dark" : draft.iconProfile,
        draft.subType,
      )
    : "";
  const iconFallback = SPELL_ICONS.Normal;

  const getSecondaryImgTop = () =>
    size === "standard" ? 50 : 50;
  useEffect(() => {
    if (!draft.img) {
      setImgUrl(null);
      return;
    }
    if (typeof draft.img === "string") {
      setImgUrl(draft.img);
      return;
    }
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      setImgUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => {
      if (cancelled) return;
      setImgUrl(null);
    };
    reader.readAsDataURL(draft.img);
    return () => {
      cancelled = true;
      try {
        reader.abort();
      } catch {
        // ignore
      }
    };
  }, [draft.img]);


  useEffect(() => {
    if (!draft.overframeImg) {
      setOverframeImgUrl(null);
      return;
    }
    if (typeof draft.overframeImg === "string") {
      setOverframeImgUrl(draft.overframeImg);
      return;
    }
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      setOverframeImgUrl(
        typeof reader.result === "string" ? reader.result : null,
      );
    };
    reader.onerror = () => {
      if (cancelled) return;
      setOverframeImgUrl(null);
    };
    reader.readAsDataURL(draft.overframeImg);
    return () => {
      cancelled = true;
      try {
        reader.abort();
      } catch {
        // ignore
      }
    };
  }, [draft.overframeImg]);

  return (
    <div
      className={cn(
        "min-h-65 overflow-x-auto bg-black space-y-3 card-maker-preview",
      )}
    >
      <div
        className={cn(
          "relative px-5 flex flex-col gap-0.5 pb-2.25 size-full overflow-hidden justify-end items-end w-105 h-154",
          size === "large" && "w-md h-156.5",
          isSecondaryTemplate && "gap-0 pb-4"
        )}
        id="card-preview"
      >
        <img
          src={borderImg}
          alt={draft.name}
          className={cn("absolute inset-0 size-full z-1", imageDraggingEnabled && "z-0")}
        />
        {isLink && !draft.linkMarkersOnDescription && (
          <RankImage
            linkMarkers={draft.linkMarkers ?? []}
            linkRating={draft.linkRating ?? 0}
            option="A"
          />
        )}
        {showMainImage && imgUrl && (
          <InteractiveImage
            ref={mainImageRef}
            src={imgUrl}
            alt={draft.name ?? ""}
            objectFit={draft.objectFit ?? "cover"}
            objectPosition={draft.objectFit === "contain" ? "top" : "center"}
            enabled={true}
            frameClassName={cn(
              "absolute w-[calc(100%-1.42rem)] bg-black left-1/2 -translate-x-1/2",
              !isSecondaryTemplate &&
                "h-[calc(100%-1.65rem)] top-1/2 -translate-y-1/2",
              isSecondaryTemplate && "translate-y-0",
            )}
            frameStyle={
              isSecondaryTemplate
                ? {
                    top: getSecondaryImgTop(),
                    bottom: `calc(${secondaryDescriptionHeight}px + 16px)`,
                  }
                : undefined
            }
          />
        )}
        {resolvedOverframeImgUrl && (
          <InteractiveImage
            ref={overframeImageRef}
            src={resolvedOverframeImgUrl}
            alt="overframe"
            objectFit={draft.overframeObjectFit ?? "cover"}
            objectPosition="center"
            enabled={!!draft.imageDraggingEnabled}
            frameClassName="absolute inset-0 z-3"
          />
        )}
        {isMonster && (
          <div
            className={cn(
              "absolute top-3.25 left-0 w-full flex h-12",
              isLink ? "justify-start pl-1" : "justify-between",
              isSecondaryTemplate && "top-1"
            )}
          >
            {!isSecondaryTemplate && draft.showStatsBox !== false && (
              <img
                className={cn(
                  "w-full opacity-70 absolute",
                  resolvedOverframeImgUrl && "z-0 -mt-4 h-15",
                )}
                src={typeCardImg.stats ?? ""}
                alt="ATK"
              />
            )}
            <div className="relative w-1/2 flex items-center justify-start">
              {isMonster && (
                <MonsterLevel
                  level={draft.stats!.level}
                  isXyz={isXyz}
                  isTuner={draft.isTuner}
                  linkRating={draft.linkRating}
                  linkMarkers={draft.linkMarkers}
                  isLink={isLink}
                />
              )}
              <span
                className={cn(
                  "relative z-4 w-26 -top-1.5 h-full max-h-9 text-5xl text-black tracking-tighter text-center",
                  (isXyzOrLink || isFusion) && "text-white!",
                  resolvedOverframeImgUrl
                    ? isXyzOrLink || isFusion
                      ? "text-shadow-outline"
                      : "text-shadow-outline-inverse"
                    : "",
                )}
              >
                {draft.stats!.atk}
              </span>
            </div>
            <div
              className={cn(
                "relative flex items-center mr-0.5",
                isLink ? "justify-end w-full" : "justify-between",
              )}
            >
              <span
                className={cn(
                  "relative z-4 w-26 -top-1.5 h-full max-h-9 text-5xl text-black tracking-tighter text-center",
                  (isXyzOrLink || isFusion) && "text-white!",
                  resolvedOverframeImgUrl
                    ? isXyzOrLink || isFusion
                      ? "text-shadow-outline"
                      : "text-shadow-outline-inverse"
                    : "",
                  isLink && "opacity-0",
                )}
              >
                {draft.stats!.def ?? 0}
              </span>
              <div className="size-14 relative z-4 rounded-full border-4 border-black">
                <img
                  src={iconImg ? iconImg : iconFallback}
                  className={cn("size-full")}
                  alt={`Icono de ${draft.cardType}`}
                />
                {monsterTypeIcon ? (
                  <img
                    src={monsterTypeIcon}
                    alt={`Icono de ${draft.subType}`}
                    className="size-[95%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
        {isNumber && !showDescription && (
          <NumberCardLabel
            className={cn("bottom-9 right-2.5")}
            value={numberLabelValue}
          />
        )}
        {!isSecondaryTemplate ? (
          <PrimaryDescription
            isPendulum={isPendulum}
            showDescription={showDescription}
            isNumber={!!isNumber}
            isVoidDescriptionStatsBox={isVoidDescriptionStatsBox}
            isVoidInverseDescriptionStatsBox={isVoidInverseDescriptionStatsBox}
            isSecondaryTemplate={isSecondaryTemplate}
            monsterDescription={monsterDescription ?? ""}
            descriptionImageOpacity={descriptionImageOpacity}
            descriptionTextSize={draft.descriptionTextSize ?? "normal"}
            isLink={isLink}
            descriptionTextColorClass={descriptionTextColorClass}
            numberLabelValue={numberLabelValue}
            typeCardImg={typeCardImg}
            draft={draft}
          />
        ) : (
          <SecondaryDescription
            isPendulum={isPendulum}
            isNumber={!!isNumber}
            scale={draft.scale ?? 0}
            numberLabelValue={numberLabelValue}
            pendulumDescription={draft.pendulumDescription ?? ""}
            description={draft.description ?? ""}
            descriptionImage={getSecondaryDescription(
              draft.monsterType ?? null,
              draft.cardType!,
              )}
            size={size}
            fontSize={draft.secondaryDescriptionTextSize ?? (isPendulum ? 10 : 12.5)}
            onHeightChange={handleSecondaryDescriptionHeightChange}
            spellDescriptionImage={SECONDARY_DESCRIPTION_FILES.spell}
          />
        )}
        <CardNameDisplay
          displayName={displayName}
          showName={showName}
          showNameBox={showNameBox}
          isSynchro={isSynchro}
          nameBgUrl={nameBgUrl}
          overframeImgUrl={resolvedOverframeImgUrl}
          isSecondaryTemplate={isSecondaryTemplate}
        />

        {!isMonster && (
          <img
            src={iconImg ? iconImg : iconFallback}
            alt={`Icono de ${draft.cardType}`}
            className={cn("size-14 absolute right-4 z-2 top-4", isSecondaryTemplate && "top-0 right-2")}
          />
        )}
      </div>
      {imageDraggingEnabled && (showMainImage || showOverframeImage) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-3 text-xs text-muted-foreground">
          {showMainImage && (
            <ImageZoomControls
              label="Imagen"
              onZoomIn={() => mainImageRef.current?.zoomIn()}
              onZoomOut={() => mainImageRef.current?.zoomOut()}
              onReset={() => mainImageRef.current?.reset()}
            />
          )}
          {showOverframeImage && (
            <ImageZoomControls
              label={draft.fullArt ? "Imagen" : "Overframe"}
              onZoomIn={() => overframeImageRef.current?.zoomIn()}
              onZoomOut={() => overframeImageRef.current?.zoomOut()}
              onReset={() => overframeImageRef.current?.reset()}
            />
          )}
        </div>
      )}
    </div>
  );
}
