import { useLayoutEffect, useRef } from "preact/hooks";
import { cn } from "@/lib/utils";
import NumberCardLabel from "./numberCardLabel";
import PendulumStats from "./pendulum-stats";

interface SecondaryDescriptionProps {
  pendulumDescription: string;
  isPendulum: boolean;
  isNumber: boolean;
  numberLabelValue: number | null;
  description: string;
  minSize?: number;
  maxSize?: number;
  scale?: number;
}

export function SecondaryDescription(props: SecondaryDescriptionProps) {
  const {
    pendulumDescription,
    isPendulum,
    isNumber,
    numberLabelValue,
    description,
    minSize = 8,
    maxSize = 16,
    scale = 0,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      let low = minSize;
      let high = maxSize;
      let fitted = minSize;
      while (low <= high) {
        const size = Math.round((low + high) / 2);
        text.style.fontSize = `${size}px`;
        if (text.scrollWidth <= width && text.scrollHeight <= height) {
          fitted = size;
          low = size + 1;
        } else {
          high = size - 1;
        }
      }
      text.style.fontSize = `${fitted}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [pendulumDescription, description, minSize, maxSize]);

  return (
    <>
      {isNumber && (
        <NumberCardLabel
          className={cn("top-90 right-5")}
          value={numberLabelValue}
        />
      )}
      {isPendulum &&  <PendulumStats
        scale={scale ?? 0}
        className={"mb-3 top-85 w-full! left-1/2 -translate-x-1/2 h-min"}
      />}
    <div
      ref={containerRef}
      className={cn("w-full relative z-2 text-black overflow-hidden", isPendulum ? "h-43.5" : "h-38")}
    >
      <p
        ref={textRef}
        className={cn(
          "size-full whitespace-pre-line tracking-tighter",
        )}
        style={{ fontSize: `${maxSize}px`, lineHeight: 1.15 }}
      >
        {pendulumDescription && `Efecto Pendulo: ${pendulumDescription}`}
        {pendulumDescription ? <hr /> : null}
        {pendulumDescription ? `Efecto monstruo: ${description}` : description}
      </p>
      </div>
    </>
  );
}
