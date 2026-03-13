import { CardMakerForm } from "@/pages/card-maker/component/card-maker-form";
import { CardPreview } from "@/pages/card-maker/component/card-preview";
import { DeckImporterForm } from "@/pages/card-maker/component/deck-importer-form";
import { Button } from "@/components/ui/warcraftcn/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "preact/hooks";
import type { MonsterTypeIconProfile, YugiohCardDraft } from "@/lib/types";
import { cardDraftSignal } from "@/pages/card-maker/state";

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
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<div className="inline-flex w-fit items-center rounded-md border p-1">
							<Button
								type="button"
								variant="frame"
								onClick={() => setTab("maker")}
							>
								Creador de cartas
							</Button>
							<Button
								type="button"
								variant="frame"
								onClick={() => setTab("deck")}
							>
								Importar mazo
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm font-medium" htmlFor="icon-profile">
								Perfil
							</label>
							<Select
								value={cardDraftSignal.value.iconProfile ?? "light"}
								onValueChange={(value: string) => {
									cardDraftSignal.value = {
										...cardDraftSignal.value,
										iconProfile: value as MonsterTypeIconProfile,
									};
								}}
							>
								<SelectTrigger id="icon-profile" className="w-40">
									<SelectValue placeholder="Selecciona un perfil" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Claro</SelectItem>
									<SelectItem value="dark">Oscuro</SelectItem>
								</SelectContent>
							</Select>
						</div>
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
