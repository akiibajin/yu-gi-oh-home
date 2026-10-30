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
import useCardStore from "@/pages/card-maker/state";
import type { SetDraftField } from "./types";
import { clampInt } from "./utils";
import { InputEvent } from "react";
import { Label } from "@/components/ui/warcraftcn/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/warcraftcn/dropdown-menu";
import { Button } from "@/components/ui/warcraftcn/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/warcraftcn/input";

const ATTRIBUTE_LABELS: Record<YugiohCardAttribute, string> = {
  DARK: "OSCURIDAD",
  LIGHT: "LUZ",
  EARTH: "TIERRA",
  WATER: "AGUA",
  FIRE: "FUEGO",
  WIND: "VIENTO",
  DIVINE: "DIVINO",
};

const MONSTER_TYPE_LABELS: Record<YugiohMonsterType, string> = {
  Normal: "Normal",
  Effect: "Efecto",
  Gemini: "Géminis",
  Spirit: "Espíritu",
  Ritual: "Ritual",
  Fusion: "Fusión",
  Synchro: "Sincronía",
  Xyz: "Xyz",
  Link: "Enlace",
  "Pendulum Effect": "Péndulo (Efecto)",
  "Pendulum Normal": "Péndulo (Normal)",
  "Pendulum Fusion": "Péndulo (Fusión)",
  "Pendulum Synchro": "Péndulo (Sincronía)",
  "Pendulum Xyz": "Péndulo (Xyz)",
  "Pendulum Ritual": "Péndulo (Ritual)",
  Token: "Ficha",
  Trap: "Trampa",
};

const SUBTYPE_LABELS: Record<MonsterType, string> = {
  Aqua: "Aqua",
  Beast: "Bestia",
  "Beast-Warrior": "Bestia guerrera",
  "Creator God": "Dios creador",
  Cyberse: "Ciberso",
  Cyborg: "Ciborg",
  Dinosaur: "Dinosaurio",
  "Divine-Beast": "Bestia divina",
  Dragon: "Dragón",
  Fairy: "Hada",
  Fiend: "Demonio",
  Fish: "Pez",
  Galaxy: "Galaxia",
  Insect: "Insecto",
  Illusion: "Ilusión",
  Machine: "Máquina",
  Plant: "Planta",
  Psychic: "Psíquico",
  Pyro: "Piro",
  Reptile: "Reptil",
  Rock: "Roca",
  "Sea Serpent": "Serpiente marina",
  Spellcaster: "Lanzador de conjuros",
  Thunder: "Trueno",
  Warrior: "Guerrero",
  "Winged Beast": "Bestia alada",
  Wyrm: "Wyrm",
  Zombie: "Zombi",
};

export function CardMakerMonsterOptions(props: {
  draft: Partial<YugiohCardDraft>;
  isPendulum: boolean;
  isLink: boolean;
  setDraftField: SetDraftField;
  setStatsField: <K extends keyof YugiohMonsterStats>(
    key: K,
    value: YugiohMonsterStats[K],
  ) => void;
}) {
  const { draft, isPendulum, isLink, setDraftField, setStatsField } = props;
  const card = useCardStore().card;
  const setCard = useCardStore().setCard;

  const handleInput = (e: InputEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(e.currentTarget.value, 10);
    setCard({
      ...card,
      stats: {
        ...card.stats!,
        level: Number.isFinite(parsed)
          ? clampInt(parsed, 1, YUGIOH_MAX_STARS)
          : 1,
      },
    });
  };

  return (
    <fieldset className="space-y-4 rounded-md border p-3 sm:p-4">
      <legend className="px-1 text-sm font-medium">Opciones de monstruo</legend>

      <div className="grid gap-4 md:grid-cols-2 *:min-w-0">
        <div className="space-y-2 min-w-0">
          <Label className="text-sm font-medium" htmlFor="cm-attribute">
            Atributo
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="cm-attribute" className="w-full">
              <Button>Selecciona un atributo</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{card.attribute}</DropdownMenuLabel>
              {YUGIOH_ATTRIBUTES.map((a) => (
                <DropdownMenuItem
                  key={a.title}
                  onClick={() => setCard({ ...card, attribute: a.title })}
                >
                  <img className="size-4" src={a.img} alt={a.title} />
                  {ATTRIBUTE_LABELS[a.title] ?? a.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 min-w-0">
          <Label className="text-sm font-medium" htmlFor="cm-monster-type">
            Tipo de carta monstruo
          </Label>
          <DropdownMenu
          >
            <DropdownMenuTrigger asChild id="cm-monster-type" className="w-full">
              <Button type="button">Selecciona un tipo</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="overflow-auto max-h-120">
              <DropdownMenuLabel>{card.monsterType}</DropdownMenuLabel>
              {YUGIOH_MONSTER_TYPES.map((t) => (
                <DropdownMenuItem key={t} onClick={()=>setCard({...card, monsterType: t})}>
                  {MONSTER_TYPE_LABELS[t] ?? t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 min-w-0">
          <Label className="text-sm font-medium" htmlFor="cm-sub-type">
            Tipo de Monstruo
          </Label>
          <DropdownMenu
          >
            <DropdownMenuTrigger asChild id="cm-sub-type" className="w-full">
              <Button type="button">tipo de monstruo</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-120 overflow-auto">
              <DropdownMenuLabel>{draft.subType}</DropdownMenuLabel>
              {getMonsterTypesForProfile(draft.iconProfile).map((a) => (
                <DropdownMenuItem key={a.title} onClick={()=>setCard({...draft, subType: a.title})}>
                  <img className="size-4" src={a.img} alt={a.title} />
                  {SUBTYPE_LABELS[a.title] ?? a.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3 min-w-0 self-end">
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="text-sm font-medium" htmlFor="cm-is-tuner">
              ¿Es Cantante?
            </Label>
            <Switch
              id="cm-is-tuner"
              checked={draft.isTuner}
              onCheckedChange={(checked: boolean) =>
                setDraftField("isTuner", checked)
              }
            />
          </div>

          {isPendulum ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="cm-scale">
                Escala Péndulo
              </Label>
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
            <Label className="text-sm font-medium" htmlFor="cm-level">
              Estrellas (Nivel)
            </Label>
            <Input
              id="cm-level"
              className="w-full"
              type="number"
              min={1}
              max={YUGIOH_MAX_STARS}
              value={String(draft.stats?.level)}
              onInput={handleInput}
            />
          </div>
        ) : null}

        <div className="space-y-2 min-w-0">
          <Label className="text-sm font-medium" htmlFor="cm-atk">
            ATK
          </Label>
          <Input
            id="cm-atk"
            className="w-full"
            type="text"
            value={String(draft.stats?.atk)}
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
              value={String(draft.stats?.def)}
              onInput={(e) => setStatsField("def", e.currentTarget.value)}
              placeholder="0, ?, ∞, x0000"
            />
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
