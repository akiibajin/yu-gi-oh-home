import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	SPELL_ICONS,
	SPELL_TYPES,
	TRAP_ICONS,
	TRAP_TYPES,
	YUGIOH_CARD_TYPES,
} from "@/lib/constants";
import type {
	YugiohCardDraft,
	YugiohCardType,
	YugiohSpellType,
	YugiohTrapType,
} from "@/lib/types";
import type { SetDraftField } from "./types";

const CARD_TYPE_LABELS: Record<YugiohCardType, string> = {
	Monster: "Monstruo",
	Spell: "Magia",
	Trap: "Trampa",
	Field: "Campo",
};

const SPELL_TYPE_LABELS: Record<YugiohSpellType, string> = {
	Normal: "Normal",
	Continuous: "Continua",
	Equip: "Equipo",
	"Quick-Play": "Juego rápido",
	Ritual: "Ritual",
};

const TRAP_TYPE_LABELS: Record<YugiohTrapType, string> = {
	Normal: "Normal",
	Continuous: "Continua",
	Counter: "Contraefecto",
};

export function CardMakerBasicFields(props: {
	draft: YugiohCardDraft;
	setDraftField: SetDraftField;
}) {
	const { draft, setDraftField } = props;
	const isMonster = draft.cardType === "Monster";
	const isFieldSpell = draft.cardType === "Field";

	return (
		<div className="space-y-4 rounded-md border p-3 sm:p-4">
			<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-name">
						Nombre
					</label>
					<Input
						id="cm-name"
						className="w-full"
						value={draft.name}
						onInput={(e) => setDraftField("name", e.currentTarget.value)}
						placeholder="Dark Magician"
					/>
				</div>

				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-card-type">
						Tipo de carta
					</label>
					<Select
						value={draft.cardType}
						onValueChange={(value: string) =>
							setDraftField("cardType", value as YugiohCardType)
						}
					>
						<SelectTrigger id="cm-card-type" className="w-full">
							<SelectValue placeholder="Tipo" />
						</SelectTrigger>
						<SelectContent>
							{YUGIOH_CARD_TYPES.map((t) => (
								<SelectItem key={t} value={t}>
									{CARD_TYPE_LABELS[t] ?? t}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{!isFieldSpell && !isMonster ? (
					<div className="space-y-2 min-w-0 md:col-span-2">
						<label className="text-sm font-medium" htmlFor="cm-spell-trap-type">
							Tipo de Magia/Trampa
						</label>
						<Select
							value={
								draft.cardType === "Spell" ? draft.spellType : draft.trapType
							}
							onValueChange={(value: string) =>
								setDraftField(
									draft.cardType === "Spell" ? "spellType" : "trapType",
									value as YugiohSpellType | YugiohTrapType,
								)
							}
						>
							<SelectTrigger id="cm-spell-trap-type" className="w-full">
								<SelectValue placeholder="Selecciona tipo de Magia/Trampa" />
							</SelectTrigger>
							<SelectContent>
								{draft.cardType === "Spell"
									? SPELL_TYPES.map((t) => (
											<SelectItem key={t} value={t}>
												<img
													src={SPELL_ICONS[t]}
													alt={SPELL_TYPE_LABELS[t] ?? t}
													className="size-4"
												/>
												{SPELL_TYPE_LABELS[t] ?? t}
											</SelectItem>
										))
									: TRAP_TYPES.map((t) => (
											<SelectItem key={t} value={t}>
												<img
													src={TRAP_ICONS[t]}
													alt={TRAP_TYPE_LABELS[t] ?? t}
													className="size-4"
												/>
												{TRAP_TYPE_LABELS[t] ?? t}
											</SelectItem>
										))}
							</SelectContent>
						</Select>
					</div>
				) : null}
			</div>
		</div>
	);
}
