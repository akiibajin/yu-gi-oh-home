import {
	FIELD_SPELL_ICON,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import getTypeCardBg from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { cn } from "@/lib/utils";
import redGem from "@/assets/images/card-templates/2026yuaaa.webp";
import blueGem from "@/assets/images/card-templates/2026yuaaaa.webp";
import borderCard from "@/assets/images/card-templates/border-card.webp";
import MonsterLevel from "./monster-level";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Unnamed card)";
	const isMonster = draft.cardType === "Monster";
	const isXyz = draft.monsterType?.includes("Xyz");
	const isLink = draft.monsterType?.includes("Link");
	const isPendulum = draft.monsterType?.includes("Pendulum");
	const showDescription = draft.showDescription ?? true;
	const monsterDescription = draft.description.trim();
	const [imgUrl, setImgUrl] = useState<string | null>(null);
	const displayNameContainerRef = useRef<HTMLDivElement | null>(null);
	const displayNameRef = useRef<HTMLParagraphElement | null>(null);
	const baseDisplayNameStyleRef = useRef<{
		fontSizePx: number;
		letterSpacingPx: number;
	} | null>(null);

	const typeCardImg = getTypeCardBg(draft.monsterType ?? null, draft.cardType);
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
				fontSizePx: Number.isFinite(computedFontSize) ? computedFontSize : 24,
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
		<div className="min-h-65 overflow-x-auto space-y-3 card-maker-preview">
			<div
				className={cn(
					"relative px-5 flex flex-col gap-2 pb-6 size-full justify-end items-end w-105 h-154",					
				)}
				id="card-preview"
			>
				<img
					src={borderCard}
					alt={draft.name}
					className="absolute inset-0 size-full z-1"
				/>
				{imgUrl && (
					<div className="absolute size-[calc(100%-1.30rem)] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
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
							"absolute top-1 left-0 w-full flex",
							isLink ? "justify-center" : "justify-around",
						)}
					>
						<div className="relative w-30 flex items-center justify-center">
							{isPendulum && (
								<div className="absolute flex items-center justify-center -right-8 z-1">
									<img src={blueGem} alt="blue-gem" className="size-12" />
									<p className="absolute top-1/2 left-1/2 text-3xl leading-6 transform -translate-x-1/2 -translate-y-2/5 md:-translate-y-1/2 text-white text-shadow-outline">
										{draft.scale}
									</p>
								</div>
							)}
							<img
								className="min-w-30 opacity-50 absolute"
								src={typeCardImg.stats ?? ""}
								alt="atk"
							/>
							<p className="relative mt-2 md:mt-0 md:mb-2 text-5xl text-white text-shadow-outline">
								{draft.stats.atk}
							</p>
						</div>
						{!isLink && (
							<div className="relative w-30 flex items-center justify-center">
								{isPendulum && (
									<div className="absolute flex items-center justify-center -left-8 z-1">
										<img src={redGem} alt="red-gem" className="size-12" />
										<p className="absolute top-1/2 left-1/2 text-3xl leading-6 transform -translate-x-1/2 -translate-y-2/5 md:-translate-y-1/2 text-white text-shadow-outline">
											{draft.scale}
										</p>
									</div>
								)}
								<img
									className="min-w-30 opacity-50 absolute rotate-y-180"
									src={typeCardImg.stats ?? ""}
									alt="def"
								/>
								<p className="relative mt-2 md:mt-0 md:mb-2 text-5xl text-white text-shadow-outline">
									{draft.stats.def}
								</p>
							</div>
						)}
					</div>
				)}
				{showDescription ? (
					<div className="relative z-2 max-h-full w-full flex pb-1.5 flex-col justify-start items-center">
						<img
							src={typeCardImg.description}
							alt="description"
							className="absolute size-full opacity-50 object-fill"
						/>
						<p
							className={cn(
								"text-lg text-shadow-outline relative z-2 font-medium",
								isXyz && !isPendulum && "text-white",
							)}
						>
							[
							{isMonster
								? draft.subType
									? `${draft.subType}|`
									: ""
								: draft.cardType}
							{isMonster
								? draft.isTuner
									? `${draft.monsterType} | Tuner`
									: draft.monsterType
								: draft.cardType === "Spell"
									? draft.spellType
										? ` | ${draft.spellType}`
										: ""
									: draft.cardType === "Trap"
										? draft.trapType
											? ` | ${draft.trapType}`
											: ""
										: ""}
							]
						</p>

						<p
							className={cn(
								"text-sm text-shadow-outline relative z-2 tracking-tight leading-2.5 max-w-11/12 size-full whitespace-pre-line",
							)}
						>
							{isPendulum &&
								`Pendulum Effect: \n${draft.pendulumDescription}\n Monster Effect:\n`}
							{monsterDescription}
						</p>
					</div>
				) : null}
				<div className="relative flex items-center overflow-visible h-8 w-full">
					{isMonster && (
						<MonsterLevel
							level={draft.stats.level}
							link={{ markers: draft.linkMarkers, number: draft.linkRating }}
							isXyz={isXyz}
							isTuner={draft.isTuner}
							isLink={isLink}
						/>
					)}
					<div
						className="relative flex-1 w-full items-center"
						ref={displayNameContainerRef}
					>
						<img
							src={typeCardImg.title}
							alt="title"
							className="absolute w-full opacity-70 h-8"
						/>
						<p
							className="relative text-3xl text-shadow-outline w-full md:leading-7 max-w-[90%] ml-4 z-2 whitespace-nowrap"
							ref={displayNameRef}
						>
							{displayName}
						</p>
					</div>
					<img
						src={iconImg ? iconImg : iconFallback}
						className={cn("size-12", !isMonster && "size-12 right-3.75")}
						alt={`${draft.cardType} icon`}
					/>
				</div>
			</div>
		</div>
	);
}
