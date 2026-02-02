import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cardDraftSignal } from "@/pages/card-maker/state";
import { useEffect, useState } from "preact/hooks";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const isMonster = draft.cardType === "Monster";
	const displayName = draft.name.trim() || "(Unnamed card)";
	const description = draft.description.trim() || "(No description yet)";
	const [imgUrl, setImgUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!draft.img) {
			setImgUrl(null);
			return;
		}
		const url = URL.createObjectURL(draft.img);
		setImgUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [draft.img]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent className="min-h-65 space-y-3">
				{imgUrl ? (
					<img
						src={imgUrl}
						alt={displayName}
						className="w-full rounded-md border object-cover"
						style={{ aspectRatio: "1 / 1" }}
					/>
				) : (
					<div
						className="w-full rounded-md border bg-muted"
						style={{ aspectRatio: "1 / 1" }}
					/>
				)}

				<div className="space-y-1">
					<div className="text-lg font-semibold leading-tight">{displayName}</div>
					<div className="text-sm text-muted-foreground">{draft.cardType}</div>
				</div>

				{isMonster ? (
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div>
							<span className="text-muted-foreground">Attribute:</span> {draft.attribute}
						</div>
						<div>
							<span className="text-muted-foreground">Type:</span> {draft.monsterType}
						</div>
						<div>
							<span className="text-muted-foreground">Level:</span> {draft.stats.level}
						</div>
						<div>
							<span className="text-muted-foreground">ATK/DEF:</span> {draft.stats.atk}/{draft.stats.def}
						</div>
					</div>
				) : null}

				<div className="whitespace-pre-wrap text-sm leading-relaxed">{description}</div>
			</CardContent>
		</Card>
	);
}
