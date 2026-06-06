import { useEffect, useRef, useState } from "preact/hooks";
import { cn } from "@/lib/utils";

export function CardNameDisplay(props: {
  displayName: string;
  showName: boolean;
  showNameBox: boolean;
  nameBgUrl: string | undefined;
  overframeImgUrl: string | null;
  isSynchro: boolean;
}) {
  const {
    displayName,
    showName,
    showNameBox,
    nameBgUrl,
    overframeImgUrl,
    isSynchro,
  } = props;
  const [hasWidthOverflow, setHasWidthOverflow] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const baseStyleRef = useRef<{
    fontSizePx: number;
    letterSpacingPx: number;
  } | null>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const titleEl = textRef.current;
    if (!containerEl || !titleEl) return;

    const computedStyle = getComputedStyle(titleEl);
    const computedFontSize = Number.parseFloat(computedStyle.fontSize);
    const computedLetterSpacing = Number.parseFloat(
      computedStyle.letterSpacing,
    );

    if (!baseStyleRef.current) {
      baseStyleRef.current = {
        fontSizePx: Number.isFinite(computedFontSize) ? computedFontSize : 18,
        letterSpacingPx: Number.isFinite(computedLetterSpacing)
          ? computedLetterSpacing
          : 0,
      };
    }

    const { fontSizePx: baseFontSizePx, letterSpacingPx: baseLetterSpacingPx } =
      baseStyleRef.current;

    const hasWidthOverflow = () => titleEl.scrollWidth > titleEl.clientWidth;
    const hasHeightOverflow = () => titleEl.scrollHeight > titleEl.clientHeight;

    const setTextStyle = (fontSizePx: number, letterSpacingPx: number) => {
      titleEl.style.fontSize = `${fontSizePx}px`;
      titleEl.style.letterSpacing = `${letterSpacingPx}px`;
    };

    const fitDisplayName = () => {
      titleEl.style.whiteSpace = "nowrap";
      setTextStyle(baseFontSizePx, baseLetterSpacingPx);

      let fittedFontSize = baseFontSizePx;

      if (hasWidthOverflow()) {
        const minFontSizePx = 11;
        let low = minFontSizePx;
        let high = baseFontSizePx;
        let best = minFontSizePx;

        while (high - low > 0.1) {
          const mid = (low + high) / 2;
          setTextStyle(mid, baseLetterSpacingPx);
          if (hasWidthOverflow()) {
            high = mid;
          } else {
            best = mid;
            low = mid;
          }
        }

        fittedFontSize = best;
        setTextStyle(fittedFontSize, baseLetterSpacingPx);
      }

      if (hasWidthOverflow()) {
        titleEl.style.whiteSpace = "";
        const multiMinFontSizePx = 8;
        let low = multiMinFontSizePx;
        let high = fittedFontSize;
        let best = fittedFontSize;

        while (high - low > 0.5) {
          const mid = (low + high) / 2;
          titleEl.style.fontSize = `${mid}px`;
          if (hasHeightOverflow()) {
            high = mid;
          } else {
            best = mid;
            low = mid;
          }
        }

        titleEl.style.fontSize = `${best}px`;
        titleEl.style.letterSpacing = `${baseLetterSpacingPx}px`;
        setHasWidthOverflow(true);
        return;
      }

      const fillRatio = titleEl.scrollWidth / Math.max(titleEl.clientWidth, 1);
      if (fillRatio < 0.92 && displayName.length > 1) {
        let low = baseLetterSpacingPx;
        let high = Math.max(baseLetterSpacingPx, 2);
        let best = baseLetterSpacingPx;

        while (high - low > 0.05) {
          const mid = (low + high) / 2;
          setTextStyle(fittedFontSize, mid);
          if (hasWidthOverflow()) {
            high = mid;
          } else {
            best = mid;
            low = mid;
          }
        }

        setTextStyle(fittedFontSize, best);
      }

      setHasWidthOverflow(false);
    };

    let animationFrameId = 0;
    const scheduleFit = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(fitDisplayName);
    };

    scheduleFit();

    const resizeObserver = new ResizeObserver(() => {
      scheduleFit();
    });
    resizeObserver.observe(containerEl);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [displayName, showName]);

  if (!showName) return null;

  return (
    <div
      className={cn(
        "relative flex min-h-8 justify-center",
        showNameBox && nameBgUrl
          ? "-bottom-2.5 w-105 items-end -mx-5"
          : "items-center w-full",
      )}
    >
      {showNameBox && nameBgUrl ? (
        <img
          src={nameBgUrl}
          alt="name background"
          className="absolute w-105 max-w-105 object-fill z-5"
        />
      ) : null}
      <div
        className={cn(
          "relative z-20 flex-1 w-full items-center",
          showNameBox && nameBgUrl ? "max-w-75 mx-auto h-10" : undefined,
        )}
        ref={containerRef}
      >
        <p
          id="card-name"
          className={cn(
            "text-center text-lg w-full z-2 font uppercase mx-auto leading-normal",
            isSynchro ? "text-black" : "text-white",
            overframeImgUrl
              ? nameBgUrl
                ? "absolute  top-1.5!"
                : "text-black! text-shadow-outline-inverse"
              : "relative max-w-[80%]",
            overframeImgUrl && nameBgUrl && !hasWidthOverflow && "text-xs!",
            hasWidthOverflow && "-mb-4.25",
          )}
          ref={textRef}
        >
          {displayName}
        </p>
      </div>
    </div>
  );
}
