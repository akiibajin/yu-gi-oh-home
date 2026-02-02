import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cardDraftSignal } from "@/pages/card-maker/state";

export function CardPreview() {
	const draft = cardDraftSignal.value;
	const isMonster = draft.cardType === "Monster";
	const displayName = draft.name.trim() || "(Unnamed card)";
	const description = draft.description.trim() || "(No description yet)";

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent className="min-h-65 space-y-3">
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
