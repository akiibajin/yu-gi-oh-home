import {
	FIELD_SPELL_ICON,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import getTypeCardBg, { BOX_TEXTURES } from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { cn } from "@/lib/utils";
import redGem from "@/assets/images/card-templates/2026yuaaa.webp";
import blueGem from "@/assets/images/card-templates/2026yuaaaa.webp";
import MonsterLevel from "./monster-level";
import RankImage from "./rank-image";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Unnamed card)";
	const isMonster = draft.cardType === "Monster";
	const isXyz = draft.monsterType?.includes("Xyz");
	const isFusion = draft.monsterType?.includes("Fusion");
	const isSynchro = draft.monsterType?.includes("Synchro");
	const isLink = draft.monsterType?.includes("Link");
	const isPendulum = draft.monsterType?.includes("Pendulum");
	const isVoidDescriptionStatsBox = draft.descriptionStatsBoxColor === "void";
	const showDescription = draft.showDescription ?? true;
	const monsterDescription = draft.description.trim();
	const [imgUrl, setImgUrl] = useState<string | null>(null);
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
	const iconFallback = SPELL_ICONS.Normal;
	useEffect(() => {
		if (!draft.img) {
			setImgUrl(null);
			return;
		}
		if(typeof draft.img === "string") {
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
				(isXyz || isLink) && "**:text-white!",
			)}
		>
			<div
				className={cn(
					"relative px-5 flex flex-col gap-2 pb-6 size-full justify-end items-end w-105 h-154",
				)}
				id="card-preview"
			>
				<img
					src={typeCardImg.border}
					alt={draft.name}
					className="absolute inset-0 size-full z-1"
				/>
				{isLink && (
					<RankImage
						linkMarkers={draft.linkMarkers ?? []}
						linkRating={draft.linkRating ?? 0}
						option="A"
					/>
				)}
				{imgUrl && (
					<div className="absolute h-[calc(100%-1.65rem)] w-[calc(100%-1.4rem)] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
						<img
							src={imgUrl}
							alt={draft.name}
							className="size-full object-fill"
							style={{
								objectFit: draft.objectFit ?? "cover",
							}}
						/>
					</div>
				)}
				{isMonster && (
					<div
						className={cn(
							"absolute top-3.25 left-0 w-full flex h-12.5",
							isLink ? "justify-center" : "justify-around",
						)}
					>
						<div className="relative w-30 flex items-center justify-center">
							{isPendulum && (
								<div className="absolute flex items-center justify-center -right-10 z-1">
									<img src={blueGem} alt="blue-gem" className="size-12" />
									<p className="absolute top-1/2 left-1/2 text-4xl leading-0 transform -translate-x-1/2 -translate-y-2/5 md:-translate-y-1/2 text-black">
										{draft.scale}
									</p>
								</div>
							)}
							<img
								className="min-w-38 opacity-70 absolute"
								src={typeCardImg.stats ?? ""}
								alt="atk"
							/>
							<span
								className={cn(
									"relative -top-1.5 h-full max-h-9 text-5xl text-black",
									isFusion && "text-white!",
								)}
							>
								{draft.stats.atk}
							</span>
						</div>
						{!isLink && (
							<div className="relative w-30 flex items-center justify-center">
								{isPendulum && (
									<div className="absolute flex items-center justify-center -left-10 z-1">
										<img src={redGem} alt="red-gem" className="size-12" />
										<p className="absolute top-1/2 left-1/2 text-4xl leading-0 transform -translate-x-1/2 -translate-y-2/5 md:-translate-y-1/2 text-black">
											{draft.scale}
										</p>
									</div>
								)}
								<img
									className="min-w-38 opacity-70 absolute rotate-y-180"
									src={typeCardImg.stats ?? ""}
									alt="def"
								/>
								<span
									className={cn(
										"relative -top-1.5 h-full max-h-9 text-5xl text-black",
										isFusion && "text-white!",
									)}
								>
									{draft.stats.def}
								</span>
							</div>
						)}
					</div>
				)}
				{showDescription && isPendulum && (
					<div className="relative z-2 w-full flex justify-center pb-1 -mb-2">
						{!isVoidDescriptionStatsBox ? (
							<img
								src={BOX_TEXTURES.Spell.description}
								alt="description"
								className={cn(
									"absolute size-full opacity-50 object-fill",
									(isSynchro || isXyz) && "opacity-80",
								)}
							/>
						) : null}
						<p
							className={cn(
								"text-base relative z-2 tracking-tighter leading-3.5 text-black! max-w-[95%] size-full whitespace-pre-line",
								isVoidDescriptionStatsBox && "text-white! text-shadow-outline",
							)}
						>
							{draft.pendulumDescription}
						</p>
					</div>
				)}
				{showDescription ? (
					<div className="relative py-px z-2 max-h-full w-full flex pb-1.5 flex-col justify-start items-center">
						{!isVoidDescriptionStatsBox ? (
							<img
								src={typeCardImg.description}
								alt="description"
								className={cn(
									"absolute size-full opacity-50 object-fill",
									(isSynchro || isXyz) && "opacity-80",
								)}
							/>
						) : null}
						<p
							className={cn(
								"text-base relative z-2 tracking-tighter leading-3.5 text-black max-w-[95%] size-full whitespace-pre-line",
								isFusion && "text-white!",
								isVoidDescriptionStatsBox && "text-white! text-shadow-outline",
							)}
						>
							{monsterDescription}
						</p>
					</div>
				) : null}
				<div
					className={cn(
						"relative flex items-center overflow-visible h-10 w-full",
						isLink && "h-11",
					)}
				>
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
					<div
						className="relative flex-1 w-full items-center h-8"
						ref={displayNameContainerRef}
					>
						<img
							src={typeCardImg.title}
							alt="title"
							className="absolute w-full opacity-70 h-8"
						/>
						<p
							className={cn(
								"relative top-1/2 -translate-y-1/2 text-lg text-black w-full max-w-[90%] ml-4 z-2 whitespace-nowrap",
								isFusion && "text-white!",
							)}
							ref={displayNameRef}
						>
							{displayName}
						</p>
					</div>
					<div className="size-14 relative z-2 rounded-full border-4 border-black">
						<img
							src={iconImg ? iconImg : iconFallback}
							className={cn("size-full")}
							alt={`${draft.cardType} icon`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
