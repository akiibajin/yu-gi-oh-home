import { useEffect, useRef } from "preact/hooks";
import { cn } from "@/lib/utils";
import fitty from "fitty";

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const titleEl = textRef.current;
    if (!titleEl) return;

    const baseFontSizePx = 18;

    const instance = fitty(titleEl, {
      minSize: 11,
      maxSize: baseFontSizePx,
      multiLine: true,
    });

    return () => {
      instance.unsubscribe();
    };
  }, [displayName, showName, overframeImgUrl, nameBgUrl]);

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
          "relative z-20 flex flex-1 w-full max-w-80 justify-center items-center",
          showNameBox && nameBgUrl ? "mx-auto h-10" : undefined,
        )}
        ref={containerRef}
      >
        <p
          id="card-name"
          className={cn(
            "text-center text-lg z-2 font uppercase absolute top-0.5 tracking-tighter! mx-auto leading-5 inline-block",
            isSynchro ? "text-black" : "text-white",
            overframeImgUrl
              ? nameBgUrl
                ? ""
                : "text-black! text-shadow-outline-inverse -top-3.25"
              : "",
          )}
          ref={textRef}
        >
          {displayName}
        </p>
      </div>
    </div>
  );
}
