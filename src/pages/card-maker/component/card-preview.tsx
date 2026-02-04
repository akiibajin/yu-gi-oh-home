import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPELL_ICONS, TRAP_ICONS, YUGIOH_ATTRIBUTES } from "@/lib/constants";
import getTypeCardBg from "@/lib/get-type-card-bg";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useMemo, useState } from "preact/hooks";
import star from "@/assets/images/card-templates/Duel2026estrella.png";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const displayName = draft.name.trim() || "(Unnamed card)";
	const isMonster = draft.cardType === "Monster";
	const description = draft.description.trim() || "(No description yet)";
	const [imgUrl, setImgUrl] = useState<string | null>(null);

	const typeCardImg = getTypeCardBg(draft.monsterType ?? null, draft.cardType);
	const iconImg = useMemo(() => {
		if (draft.cardType === "Spell") {
			return SPELL_ICONS[draft.spellType as keyof typeof SPELL_ICONS];
		}
		if (draft.cardType === "Trap") {
			return TRAP_ICONS[draft.trapType as keyof typeof TRAP_ICONS];
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
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent className="min-h-65 space-y-3">
				<div className="relative" id="card-preview">
					<img src={typeCardImg.bg} alt={draft.name} className="relative z-1" />
					<p className="absolute z-2 font-bold top-4.5 left-4.5 text-xl max-w-[75%] w-full truncate uppercase">
						{displayName}
					</p>
					<img
						src={iconImg ? iconImg : iconFallback}
						className="absolute top-4.5 right-4.5 size-12.5 z-2 object-fill"
						alt={`${draft.cardType} icon`}
					/>
					{imgUrl && (
						<div className="absolute size-full max-w-82.5 max-h-84 top-13 left-1/2 -translate-x-1/2">
							<img
								src={imgUrl}
								alt={draft.name}
								className="size-full object-fill"
							/>
						</div>
					)}
					{isMonster && (
						<div className="absolute bottom-38.5 max-h-8 overflow-y-visible bg-black/60 w-full max-w-[88%] left-4.5 z-2 flex items-end">
							<div className="relative min-w-12">
								<img src={star} alt="Star" className="size-12 object-fill" />
								<p className="absolute top-[40%] text-white text-shadow-[0px_0px_2px_black] left-1/2 -translate-x-1/2 -translate-y-[40%] font-extrabold text-3xl">
									{draft.stats.level}
								</p>
							</div>
							<div className="w-full h-8 flex items-end justify-start">
								<p className="text-white text-shadow-[0px_0px_2px_black] pl-4 font-bold text-xl">
									ATK {draft.stats.atk} / DEF {draft.stats.def}
								</p>
							</div>
						</div>
					)}
					<div className="absolute z-2 bottom-0 left-0 w-full">
						<img src={typeCardImg.bottom} alt={`${draft.name} bottom`} />
						<p className="absolute -top-0.5 left-6 font-medium">
							[{isMonster ? draft.subType : draft.cardType} |{" "}
							{isMonster
								? draft.isTuner
									? `${draft.monsterType} | Tuner`
									: draft.monsterType
								: draft.cardType === "Spell"
									? draft.spellType
									: draft.trapType}
							]
						</p>
						<p className="absolute text-[10px] tracking-tight leading-3 top-6 left-7 max-w-[85%] max-h-[55%] size-full">
							{description}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
