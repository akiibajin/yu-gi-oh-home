import { CardPreview } from "./card-preview";
import { Button } from "@/components/ui/warcraftcn/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "preact/hooks";

type CardSize = "large" | "standard";

const STORAGE_KEY = "card-maker.card-size";


function getStoredSize(): CardSize {
  if (typeof window === "undefined") return "standard";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "standard" || stored === "large") return stored;
  return "standard";
}

export function CardPreviewWrapper() {
  const [size, setSize] = useState<CardSize>(getStoredSize);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, size);
  }, [size]);

  return (
    <div className="space-y-2">
      <div className="inline-flex w-fit items-center rounded-md border p-1">
        <Button
          type="button"
          variant="frame"
          onClick={() => setSize("large")}
          className={cn(size === "large" && "bg-accent/50")}
        >
          Magic
        </Button>
        <Button
          type="button"
          variant="frame"
          onClick={() => setSize("standard")}
          className={cn(size === "standard" && "bg-accent/50")}
        >
          Yu-Gi-Oh
        </Button>
      </div>
      <CardPreview size={size} />
    </div>
  );
}
