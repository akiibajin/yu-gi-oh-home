
import { cn } from "cn";
import type { CSSProperties } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Draggable, { type ControlPosition } from "react-draggable";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchContentRef,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

const MIN_IMAGE_SCALE = 0.5;
const MAX_IMAGE_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export type InteractiveImageHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

interface InteractiveImageProps {
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition: string;
  enabled: boolean;
  frameClassName?: string;
  frameStyle?: CSSProperties;
}

const InteractiveImage = forwardRef<
  InteractiveImageHandle,
  InteractiveImageProps
>(function InteractiveImage(
  { src, alt, objectFit, objectPosition, enabled, frameClassName, frameStyle },
  ref,
) {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const zoomRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const [position, setPosition] = useState<ControlPosition>({
    x: 0,
    y: 0,
  });

  const [scale, setScale] = useState(1);

  const [frameSize, setFrameSize] = useState({
    width: 0,
    height: 0,
  });

  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  // Measure the image frame.
  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) return;

    const updateSize = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;

      setFrameSize((current) => {
        if (
          current.width === width &&
          current.height === height
        ) {
          return current;
        }

        return { width, height };
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  // Calculate the rendered image dimensions based on object-fit.
  const renderedImageSize = useMemo(() => {
    if (
      !imageSize.width ||
      !imageSize.height ||
      !frameSize.width ||
      !frameSize.height
    ) {
      return {
        width: 0,
        height: 0,
      };
    }

    const widthRatio = frameSize.width / imageSize.width;
    const heightRatio = frameSize.height / imageSize.height;

    let imageScale: number;

    switch (objectFit) {
      case "cover":
        imageScale = Math.max(widthRatio, heightRatio);
        break;

      case "contain":
        imageScale = Math.min(widthRatio, heightRatio);
        break;

      case "scale-down":
        imageScale = Math.min(
          1,
          widthRatio,
          heightRatio,
        );
        break;

      case "none":
        imageScale = 1;
        break;

      case "fill":
        return {
          width: frameSize.width,
          height: frameSize.height,
        };
    }

    return {
      width: imageSize.width * imageScale,
      height: imageSize.height * imageScale,
    };
  }, [imageSize, frameSize, objectFit]);

  // Calculate the available movement based on the actual image size
  // and current zoom level.
  const maxX = Math.max(
    0,
    (renderedImageSize.width * scale - frameSize.width) / 2,
  );

  const maxY = Math.max(
    0,
    (renderedImageSize.height * scale - frameSize.height) / 2,
  );

  // Update the current zoom scale.
  const handleTransform = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      setScale(ref.state.scale);
    },
    [],
  );

  // Keep the image position inside the valid boundaries.
  useEffect(() => {
    setPosition((current) => {
      const x = clamp(current.x, -maxX, maxX);
      const y = clamp(current.y, -maxY, maxY);

      if (x === current.x && y === current.y) {
        return current;
      }

      return { x, y };
    });
  }, [maxX, maxY]);

  // Reset position and zoom when a new image is loaded.
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setScale(1);

    void zoomRef.current?.resetTransform(0);
  }, [src]);

  // Expose zoom controls to the parent component.
  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => {
        void zoomRef.current?.zoomIn(0.25, 150);
      },

      zoomOut: () => {
        void zoomRef.current?.zoomOut(0.25, 150);
      },

      reset: () => {
        setPosition({ x: 0, y: 0 });
        setScale(1);

        void zoomRef.current?.resetTransform(150);
      },
    }),
    [],
  );

  // Calculate the centered position of the image.
  const imageStyle = useMemo(
    () => ({
      width: renderedImageSize.width,
      height: renderedImageSize.height,
      left: "50%",
      top: "50%",
      marginLeft: -renderedImageSize.width / 2,
      marginTop: -renderedImageSize.height / 2,
    }),
    [renderedImageSize],
  );

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative pointer-events-none",
        frameClassName,
        enabled && "overflow-hidden",
      )}
      style={frameStyle}
    >
      <Draggable
        nodeRef={nodeRef}
        disabled={!enabled}
        position={enabled ? position : { x: 0, y: 0 }}
        onDrag={(_event, data) => {
          setPosition({
            x: data.x,
            y: data.y,
          });
        }}
        bounds={{
          left: -maxX,
          right: maxX,
          top: -maxY,
          bottom: maxY,
        }}
      >
        <div
          ref={nodeRef}
          className={cn(
            "absolute",
            enabled && "pointer-events-auto cursor-move",
          )}
          style={imageStyle}
        >
          <TransformWrapper
            ref={zoomRef}
            disabled={!enabled}
            minScale={MIN_IMAGE_SCALE}
            maxScale={MAX_IMAGE_SCALE}
            limitToBounds={false}
            panning={{
              disabled: true,
              velocityDisabled: true,
            }}
            doubleClick={{
              disabled: true,
            }}
            wheel={{
              disabled: !enabled,
              step: 0.08,
            }}
            zoomAnimation={{
              animationTime: 150,
            }}
            customTransform={(_x, _y, nextScale) =>
              `scale(${nextScale})`
            }
            onTransform={handleTransform}
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                transformOrigin: "center center",
              }}
            >
              <img
                src={src}
                alt={alt}
                className="size-full"
                style={{
                  objectFit,
                  objectPosition,
                }}
                onLoad={(event) => {
                  const image = event.currentTarget;

                  setImageSize({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }}
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </Draggable>
    </div>
  );
});

export default InteractiveImage;
