import {
	FIELD_SPELL_ICON,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import { getMonsterTypeIcon } from "@/lib/monster-type-icons";
import getTypeCardBg, { BOX_TEXTURES } from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { cn } from "@/lib/utils";
import MonsterLevel from "./monster-level";
import RankImage from "./rank-image";
import PendulumStats from "./pendulum-stats";
import NumberCardLabel from "./numberCardLabel";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Carta sin nombre)";
	const isMonster = draft.cardType === "Monster";
	const isXyz = isMonster && draft.monsterType?.includes("Xyz");
	const isSynchro = isMonster && draft.monsterType?.includes("Synchro");
	const isLink = isMonster && draft.monsterType?.includes("Link");
	const isPendulum = isMonster && draft.monsterType?.includes("Pendulum");
	const isXyzOrLink = Boolean(isXyz || isLink);
	const isFusion = isMonster && draft.monsterType?.includes("Fusion");
	const isNumber = isXyz && draft.name.toLowerCase().includes("number");
	const descriptionImageOpacity =
		draft.descriptionImageOpacity ?? (isSynchro || isXyz ? 0.8 : 0.5);
	const numberLabelValue = useMemo(() => {
		if (!isNumber) return null;
		const match = draft.name.match(/\bnumber\s*(\d+)/i);
		if (!match) return null;
		const parsed = Number.parseInt(match[1], 10);
		return Number.isFinite(parsed) ? parsed : null;
	}, [draft.name, isNumber]);
	const isVoidDescriptionStatsBox = draft.descriptionStatsBoxColor === "void";
	const isVoidInverseDescriptionStatsBox =
		draft.descriptionStatsBoxColor === "void-inverse";
	const showDescription = draft.showDescription ?? true;
	const monsterDescription = draft.description.trim();
	const descriptionTextColor = draft.descriptionTextColor ?? "auto";
	const descriptionTextSize = draft.descriptionTextSize ?? "normal";
	const descriptionTextSizeClass =
		descriptionTextSize === "small"
			? "text-sm"
			: descriptionTextSize === "big"
				? "text-lg"
				: "text-base";
	const descriptionTextColorClass = isXyzOrLink
		? "text-white!"
		: descriptionTextColor === "white"
			? "text-white!"
			: "text-black!";
	const [imgUrl, setImgUrl] = useState<string | null>(null);
	const [overframeImgUrl, setOverframeImgUrl] = useState<string | null>(null);
	const displayNameContainerRef = useRef<HTMLDivElement | null>(null);
	const displayNameRef = useRef<HTMLParagraphElement | null>(null);
	const baseDisplayNameStyleRef = useRef<{
		fontSizePx: number;
		letterSpacingPx: number;
	} | null>(null);

	const typeCardImg = getTypeCardBg(
		draft.monsterType ?? null,
		draft.cardType,
		draft.descriptionStatsBoxColor,
	);
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

	useEffect(() => {
		const containerEl = displayNameContainerRef.current;
		const titleEl = displayNameRef.current;
		if (!containerEl || !titleEl) return;

		const computedStyle = getComputedStyle(titleEl);
		const computedFontSize = Number.parseFloat(computedStyle.fontSize);
		const computedLetterSpacing = Number.parseFloat(
			computedStyle.letterSpacing,
		);

		if (!baseDisplayNameStyleRef.current) {
			baseDisplayNameStyleRef.current = {
				fontSizePx: Number.isFinite(computedFontSize) ? computedFontSize : 18,
				letterSpacingPx: Number.isFinite(computedLetterSpacing)
					? computedLetterSpacing
					: 0,
			};
		}

		const { fontSizePx: baseFontSizePx, letterSpacingPx: baseLetterSpacingPx } =
			baseDisplayNameStyleRef.current;

		const hasOverflow = () => titleEl.scrollWidth > titleEl.clientWidth;

		const setTextStyle = (fontSizePx: number, letterSpacingPx: number) => {
			titleEl.style.fontSize = `${fontSizePx}px`;
			titleEl.style.letterSpacing = `${letterSpacingPx}px`;
		};

		const fitDisplayName = () => {
			setTextStyle(baseFontSizePx, baseLetterSpacingPx);

			let fittedFontSize = baseFontSizePx;
			if (hasOverflow()) {
				const minFontSizePx = 11;
				let low = minFontSizePx;
				let high = baseFontSizePx;
				let best = minFontSizePx;

				while (high - low > 0.1) {
					const mid = (low + high) / 2;
					setTextStyle(mid, baseLetterSpacingPx);
					if (hasOverflow()) {
						high = mid;
					} else {
						best = mid;
						low = mid;
					}
				}

				fittedFontSize = best;
			}

			setTextStyle(fittedFontSize, baseLetterSpacingPx);

			const fillRatio = titleEl.scrollWidth / Math.max(titleEl.clientWidth, 1);
			if (fillRatio < 0.92 && displayName.length > 1) {
				let low = baseLetterSpacingPx;
				let high = Math.max(baseLetterSpacingPx, 2);
				let best = baseLetterSpacingPx;

				while (high - low > 0.05) {
					const mid = (low + high) / 2;
					setTextStyle(fittedFontSize, mid);
					if (hasOverflow()) {
						high = mid;
					} else {
						best = mid;
						low = mid;
					}
				}

				setTextStyle(fittedFontSize, best);
			}
		};

		let animationFrameId = 0;
		const scheduleFit = () => {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = requestAnimationFrame(fitDisplayName);
		};

		scheduleFit();

		const resizeObserver = new ResizeObserver(() => {
			scheduleFit();
		});
		resizeObserver.observe(containerEl);

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
		};
	}, [displayName]);

	return (
		<div
			className={cn(
				"min-h-65 overflow-x-auto bg-black space-y-3 card-maker-preview",
				// Avoid global text color overrides; apply targeted rules instead.
			)}
		>
			<div
				className={cn(
					"relative px-5 flex flex-col gap-2 pb-2.25 size-full overflow-hidden justify-end items-end w-105 h-154",
				)}
				id="card-preview"
			>
				<img
					src={typeCardImg.border}
					alt={draft.name}
					className="absolute inset-0 size-full z-1"
				/>
				{isLink && !draft.linkMarkersOnDescription && (
					<RankImage
						linkMarkers={draft.linkMarkers ?? []}
						linkRating={draft.linkRating ?? 0}
						option="A"
					/>
				)}
				{imgUrl && (
					<div
						className={cn(
							"absolute h-[calc(100%-1.65rem)] w-[calc(100%-1.4rem)] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
							draft.objectFit === "contain" && "bg-black",
						)}
					>
						<img
							src={imgUrl}
							alt={draft.name}
							className="size-full object-fill"
							style={{
								objectFit: draft.objectFit ?? "cover",
								objectPosition:
									draft.objectFit === "contain" ? "top" : "center",
								transform: `rotate(${draft.imgRotationDeg ?? 0}deg)`,
								transformOrigin: "center",
							}}
						/>
					</div>
				)}
				{overframeImgUrl && (
					<img
						src={overframeImgUrl}
						alt="overframe"
						className="absolute inset-0 size-full object-fill z-3"
						style={{
							objectFit: draft.overframeObjectFit ?? "cover",
							objectPosition: "center",
							transform: `rotate(${draft.overframeImgRotationDeg ?? 0}deg)`,
							transformOrigin: "center",
						}}
					/>
				)}
				{isMonster && (
					<div
						className={cn(
							"absolute top-3.25 left-0 w-full flex h-12",
							isLink ? "justify-start" : "justify-between",
						)}
					>
						<img
							className="w-full opacity-70 absolute"
							src={typeCardImg.stats ?? ""}
							alt="ATK"
						/>
						<div className="relative w-1/2 flex items-center justify-start">
							{isMonster && (
								<MonsterLevel
									level={draft.stats.level}
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
									overframeImgUrl
										? isXyzOrLink || isFusion
											? "text-shadow-outline"
											: "text-shadow-outline-inverse"
										: "",
								)}
							>
								{draft.stats.atk}
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
									overframeImgUrl
										? isXyzOrLink || isFusion
											? "text-shadow-outline"
											: "text-shadow-outline-inverse"
										: "",
									isLink && "opacity-0",
								)}
							>
								{draft.stats.def ?? 0}
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
				{showDescription && isPendulum && (
					<div className="relative mb-3 z-4 w-full flex justify-center pb-1">
						{!isVoidDescriptionStatsBox && !isVoidInverseDescriptionStatsBox ? (
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
								isVoidDescriptionStatsBox && "text-white! text-shadow-outline",
								isVoidInverseDescriptionStatsBox &&
									"text-black! text-shadow-outline-inverse",
							)}
						>
							{draft.pendulumDescription}
						</p>
						<PendulumStats scale={draft.scale ?? 0} />
					</div>
				)}
				{showDescription ? (
					<div
						className={cn(
							"relative py-px z-2 max-h-full z-4 w-full flex pb-1.5 flex-col justify-start items-center",
							isLink && "mb-2",
						)}
					>
						{isLink && draft.linkMarkersOnDescription && (
							<RankImage
								linkMarkers={draft.linkMarkers ?? []}
								linkRating={draft.linkRating ?? 0}
								option="B"
							/>
						)}
						{isNumber && <NumberCardLabel value={numberLabelValue} />}
						{!isVoidDescriptionStatsBox && !isVoidInverseDescriptionStatsBox ? (
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
				<div
					className={cn("relative flex items-end overflow-visible h-6 w-full")}
				>
					<div
						className="relative z-4 flex-1 w-full items-center h-8"
						ref={displayNameContainerRef}
					>
						<p
							id="card-name"
							className={cn(
								"relative top-1/2 left-1/2 text-center -translate-1/2 -translate-y-1/2 text-lg text-white w-full max-w-[80%] z-2 whitespace-nowrap font uppercase",
								isSynchro && "text-black!",
								overframeImgUrl
									? isXyzOrLink || isFusion
										? "text-shadow-outline"
										: "text-shadow-outline-inverse"
									: "",
							)}
							ref={displayNameRef}
						>
							{displayName}
						</p>
					</div>
				</div>
				{!isMonster && (
					<img
						src={iconImg ? iconImg : iconFallback}
						alt={`Icono de ${draft.cardType}`}
						className="size-14 absolute right-4 z-2 top-4"
					/>
				)}
			</div>
		</div>
	);
}
