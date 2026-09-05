import { cn } from "@/lib/utils";

const CARD_TEMPLATES_BASE_URL =
  "https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplateUrl = (fileName: string) =>
  `${CARD_TEMPLATES_BASE_URL}${fileName}`;

const digitImages = {
  0: cardTemplateUrl("number-0.webp"),
  1: cardTemplateUrl("number-1.webp"),
  2: cardTemplateUrl("number-2.webp"),
  3: cardTemplateUrl("number-3.webp"),
  4: cardTemplateUrl("number-4.webp"),
  5: cardTemplateUrl("number-5.webp"),
  6: cardTemplateUrl("number-6.webp"),
  7: cardTemplateUrl("number-7.webp"),
  8: cardTemplateUrl("number-8.webp"),
  9: cardTemplateUrl("number-9.webp"),
} as const;
interface NumberCardLabelProps {
  value?: number | null;
  className?: string;
}
function NumberCardLabel(props: NumberCardLabelProps) {
  const { value, className} = props;

  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;

  const normalized = Math.trunc(Math.abs(value));
  const digitsString = String(normalized);
  if (!/^\d+$/.test(digitsString)) return null;
  const digits = digitsString.split("");
  if (digits.length === 0) return null;

  return (
    <div className={cn("absolute z-3 right-0 flex", className)}>
      {digits.map((digit, index) => {
        const digitNumber = Number.parseInt(digit, 10);
        const src = digitImages[digitNumber as keyof typeof digitImages];
        if (!src) return null;
        return (
          <img
            key={`${digit}-${index}`}
            src={src}
            className="h-12"
            alt={`dígito ${digit}`}
          />
        );
      })}
    </div>
  );
}

export default NumberCardLabel;
