import {
	FIELD_SPELL_ICON,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import getTypeCardBg from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useState } from "preact/hooks";
import { cn } from "@/lib/utils";
import borderCard from "@/assets/images/card-templates/border-card.webp";
import MonsterLevel from "./monster-level";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Unnamed card)";
	const isMonster = draft.cardType === "Monster";
	const isXyz = draft.monsterType?.includes("Xyz");
	const isLink = draft.monsterType?.includes("Link");
	const isPendulum = draft.monsterType?.includes("Pendulum");
	const monsterDescription = draft.description.trim();
	const [imgUrl, setImgUrl] = useState<string | null>(null);

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
	return (
		<div className="min-h-65 overflow-x-auto space-y-3 card-maker-preview">
			<div
				className="relative px-5 flex flex-col gap-2 pb-6 size-full justify-end items-end w-105 h-154"
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
							<img
								className="min-w-30 absolute"
								src={typeCardImg.stats ?? ""}
								alt="atk"
							/>
							<p className="relative mb-2 text-5xl text-white text-shadow-outline">
								{draft.stats.atk}
							</p>
						</div>
						{!isLink && (
							<div className="relative w-30 flex items-center justify-center">
								<img
									className="min-w-30 absolute"
									src={typeCardImg.stats ?? ""}
									alt="def"
								/>
								<p className="relative mb-2 text-5xl text-white text-shadow-outline">
									{draft.stats.def}
								</p>
							</div>
						)}
					</div>
				)}
				<div className="relative z-2 max-h-full w-full flex pb-1.5 flex-col justify-start items-center">
					<img
						src={typeCardImg.description}
						alt="description"
						className="absolute size-full opacity-60 object-fill"
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
						{monsterDescription}
					</p>
				</div>
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
					<div className="relative flex-1 w-full items-center">
						<img
							src={typeCardImg.title}
							alt="title"
							className="absolute w-full opacity-80 h-8"
						/>
						<p className="relative text-shadow-outline w-full leading-7 max-w-[70%] ml-4 z-2">
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
