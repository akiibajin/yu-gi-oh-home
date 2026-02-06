import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FIELD_SPELL_ICON,
	SPELL_ICONS,
	TRAP_ICONS,
	YUGIOH_ATTRIBUTES,
} from "@/lib/constants";
import getTypeCardBg from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useState } from "preact/hooks";
import star from "@/assets/images/card-templates/star.webp";
import rank from "@/assets/images/card-templates/rank.webp";
import statsBar from "@/assets/images/card-templates/stats-bar.webp";
import bottomCard from "@/assets/images/card-templates/bottom-card.webp";
import { cn } from "@/lib/utils";
import RankImage from "@/pages/card-maker/component/rank-image";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Unnamed card)";
	const isMonster = draft.cardType === "Monster";
	const isXyz = draft.monsterType?.includes("Xyz");
	const isLink = draft.monsterType?.includes("Link");
	const isPendulum = draft.monsterType?.includes("Pendulum");
	const pendulumDescription = (draft.pendulumDescription ?? "").trim();
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
		<Card className="card-maker-preview w-full">
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent className="min-h-65 overflow-x-auto space-y-3">
				<div className="relative w-92.5" id="card-preview">
					<img src={typeCardImg.bg} alt={draft.name} className="relative z-1" />
					<p
						className={cn(
							"absolute z-2 font-bold top-4 left-5 text-3xl max-w-[75%] w-full truncate uppercase",
							isXyz && "text-yellow-300",
						)}
					>
						{displayName}
					</p>
					<img
						src={iconImg ? iconImg : iconFallback}
						className={cn(
							"absolute top-4.5 right-4.5 size-12 z-2",
							!isMonster && "size-12.5 right-3.75",
						)}
						alt={`${draft.cardType} icon`}
					/>
					{imgUrl && (
						<div className="absolute size-full max-w-84 max-h-84 top-13.5 left-1/2 -translate-x-1/2">
							<img
								src={imgUrl}
								alt={draft.name}
								className="size-full object-fill"
							/>
						</div>
					)}
					{isMonster && (
						<div
							className={cn(
								"absolute bottom-38 max-h-8 overflow-y-visible w-full max-w-[88%] left-4.5 z-2 flex items-end",
								isPendulum ? "bottom-55" : "",
							)}
						>
							<img
								src={statsBar}
								alt="stats bar"
								className="size-full absolute opacity-80"
							/>
							<div className="relative min-w-12">
								{isLink ? (
									<RankImage card={draft} option="A" />
								) : (
									<>
										<img
											src={isXyz ? rank : star}
											alt="Star"
											className="size-12 object-cover"
										/>
										<p
											className={cn(
												"absolute top-[40%] text-white text-shadow-[0px_0px_2px_black] left-1/2 -translate-x-1/2 -translate-y-[40%] font-extrabold text-3xl",
											)}
										>
											{draft.stats.level}
										</p>
									</>
								)}
							</div>
							<div className="w-full h-8 relative flex items-end justify-center">
								<p className="text-white text-shadow-[0px_0px_2px_black] pl-4 font-bold text-3xl">
									{isLink
										? `ATK ${draft.stats.atk}`
										: `ATK ${draft.stats.atk} / DEF ${draft.stats.def}`}
								</p>
							</div>
						</div>
					)}
					<div className="absolute top-0 z-2 size-full">
						{!isPendulum && (
							<img src={bottomCard} alt={`${draft.name} bottom`} />
						)}
						{isPendulum && (
							<p className="absolute bottom-37 left-6.5 text-sm tracking-tight leading-2.5 max-w-[85%] max-h-17 size-full whitespace-pre-line">
								{pendulumDescription}
							</p>
						)}
						<p
							className={cn(
								"absolute bottom-32.5 text-xl left-6 font-medium",
								isXyz && !isPendulum && "text-white",
								isPendulum && "bottom-26.75 left-18 text-lg",
							)}
						>
							[
							{isMonster ? (draft.subType ? `${draft.subType}|` : "") : draft.cardType}
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
								"absolute text-sm tracking-tight leading-2.5 bottom-6 left-7 max-w-[85%] max-h-26.5 size-full whitespace-pre-line",
								isPendulum && "max-h-18 bottom-6",
							)}
						>
							{monsterDescription}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
