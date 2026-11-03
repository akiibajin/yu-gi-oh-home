import { Button } from "@/components/ui/button";

function ImageZoomControls({
  label,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  label: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{label}</span>
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        aria-label={`Reducir ${label}`}
        onClick={onZoomOut}
      >
        −
      </Button>
      <Button type="button" variant="secondary" size="xs" onClick={onReset}>
        Restablecer
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        aria-label={`Ampliar ${label}`}
        onClick={onZoomIn}
      >
        +
      </Button>
    </div>
  );
}

export default ImageZoomControls
