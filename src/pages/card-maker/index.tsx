import { CardMakerForm } from "@/pages/card-maker/component/card-maker-form";
import { CardPreview } from "@/pages/card-maker/component/card-preview";
import { DeckImporterForm } from "@/pages/card-maker/component/deck-importer-form";
import { Button } from "@/components/ui/warcraftcn/button";
import { useState } from "preact/hooks";
import type { YugiohCardDraft } from "@/lib/types";

function CardMaker() {
	const [tab, setTab] = useState<"maker" | "deck">("maker");
	const [cards, setCards] = useState<
		(Omit<YugiohCardDraft, "img"> & { imgUrl: string; id: string })[]
	>([]);

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-col gap-4 md:flex-row">
				<div className="w-full md:w-105 md:flex-none">
					<CardPreview />
				</div>
				<div className="min-w-0 flex-1">
					<div className="inline-flex w-fit items-center rounded-md border p-1 mb-4">
						<Button
							type="button"
							variant="frame"
							onClick={() => setTab("maker")}
						>
							Card maker
						</Button>
						<Button
							type="button"
							variant="frame"
							onClick={() => setTab("deck")}
						>
							Import deck
						</Button>
					</div>
					{tab === "maker" ? (
						<CardMakerForm />
					) : (
						<div className="min-w-0">
							<DeckImporterForm cards={cards} setCards={setCards} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default CardMaker;
