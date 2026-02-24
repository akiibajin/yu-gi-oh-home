import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	YUGIOH_ATTRIBUTES,
	YUGIOH_MAX_STARS,
	YUGIOH_MONSTER_TYPES,
} from "@/lib/constants";
import { getMonsterTypesForProfile } from "@/lib/monster-type-icons";
import type {
	MonsterType,
	YugiohCardAttribute,
	YugiohCardDraft,
	YugiohMonsterStats,
	YugiohMonsterType,
} from "@/lib/types";
import { cardDraftSignal } from "@/pages/card-maker/state";
import type { SetDraftField } from "./types";
import { clampInt } from "./utils";

export function CardMakerMonsterOptions(props: {
	draft: YugiohCardDraft;
	isPendulum: boolean;
	isLink: boolean;
	setDraftField: SetDraftField;
	setStatsField: <K extends keyof YugiohMonsterStats>(
		key: K,
		value: YugiohMonsterStats[K],
	) => void;
}) {
	const { draft, isPendulum, isLink, setDraftField, setStatsField } = props;

	return (
		<fieldset className="space-y-4 rounded-md border p-3 sm:p-4">
			<legend className="px-1 text-sm font-medium">Monster Options</legend>

			<div className="grid gap-4 md:grid-cols-2 *:min-w-0">
				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-attribute">
						Attribute
					</label>
					<Select
						value={draft.attribute}
						onValueChange={(value: string) =>
							setDraftField("attribute", value as YugiohCardAttribute)
						}
					>
						<SelectTrigger id="cm-attribute" className="w-full">
							<SelectValue placeholder="Select an attribute" />
						</SelectTrigger>
						<SelectContent>
							{YUGIOH_ATTRIBUTES.map((a) => (
								<SelectItem key={a.title} value={a.title}>
									<img className="size-4" src={a.img} alt={a.title} />
									{a.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-monster-type">
						Monster Type
					</label>
					<Select
						value={draft.monsterType}
						onValueChange={(value: string) =>
							setDraftField("monsterType", value as YugiohMonsterType)
						}
					>
						<SelectTrigger id="cm-monster-type" className="w-full">
							<SelectValue placeholder="Select a type" />
						</SelectTrigger>
						<SelectContent>
							{YUGIOH_MONSTER_TYPES.map((t) => (
								<SelectItem key={t} value={t}>
									{t}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-sub-type">
						Type
					</label>
					<Select
						value={draft.subType}
						onValueChange={(value: string) =>
							setDraftField("subType", value as MonsterType)
						}
					>
						<SelectTrigger id="cm-sub-type" className="w-full">
							<SelectValue placeholder="Select an attribute" />
						</SelectTrigger>
						<SelectContent>
							{getMonsterTypesForProfile(draft.iconProfile).map((a) => (
								<SelectItem key={a.title} value={a.title}>
									<img className="size-4" src={a.img} alt={a.title} />
									{a.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-3 min-w-0 self-end">
					<div className="flex items-center justify-between rounded-md border px-3 py-2">
						<label className="text-sm font-medium" htmlFor="cm-is-tuner">
							Is Tuner?
						</label>
						<Switch
							id="cm-is-tuner"
							type="checkbox"
							checked={draft.isTuner}
							onCheckedChange={(checked: boolean) =>
								setDraftField("isTuner", checked)
							}
						/>
					</div>

					{isPendulum ? (
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="cm-scale">
								Pendulum Scale
							</label>
							<Input
								id="cm-scale"
								className="w-full"
								type="number"
								min={0}
								max={13}
								value={String(draft.scale ?? 0)}
								onInput={(e) => {
									const parsed = Number.parseInt(e.currentTarget.value, 10);
									const next = Number.isFinite(parsed)
										? clampInt(parsed, 0, 13)
										: 0;
									setDraftField("scale", next);
								}}
							/>
						</div>
					) : null}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 *:min-w-0">
				{!isLink ? (
					<div className="space-y-2 min-w-0">
						<label className="text-sm font-medium" htmlFor="cm-level">
							Stars (Level)
						</label>
						<Input
							id="cm-level"
							className="w-full"
							type="number"
							min={1}
							max={YUGIOH_MAX_STARS}
							value={String(draft.stats.level)}
							onInput={(e) => {
								const parsed = Number.parseInt(e.currentTarget.value, 10);
								cardDraftSignal.value = {
									...cardDraftSignal.value,
									stats: {
										...cardDraftSignal.value.stats,
										level: Number.isFinite(parsed)
											? clampInt(parsed, 1, YUGIOH_MAX_STARS)
											: 1,
									},
								};
							}}
						/>
					</div>
				) : null}

				<div className="space-y-2 min-w-0">
					<label className="text-sm font-medium" htmlFor="cm-atk">
						ATK
					</label>
					<Input
						id="cm-atk"
						className="w-full"
						type="text"
						value={String(draft.stats.atk)}
						onInput={(e) => setStatsField("atk", e.currentTarget.value)}
						placeholder="0, ?, ∞, x0000"
					/>
				</div>

				{!isLink ? (
					<div className="space-y-2 min-w-0">
						<label className="text-sm font-medium" htmlFor="cm-def">
							DEF
						</label>
						<Input
							id="cm-def"
							className="w-full"
							type="text"
							value={String(draft.stats.def)}
							onInput={(e) => setStatsField("def", e.currentTarget.value)}
							placeholder="0, ?, ∞, x0000"
						/>
					</div>
				) : null}
			</div>
		</fieldset>
	);
}
