import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { CardBrandBadge } from "./card-brand-badge";
import { formatCardNumber, formatExpiry, type CardBrand } from "./utils";

export interface CardFormValues {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
}

export type CardFormErrors = Partial<Record<"number" | "name" | "expiry" | "cvv", string>>;

interface CardFormProps {
  values: CardFormValues;
  errors: CardFormErrors;
  brand: CardBrand | null;
  onFieldChange: <K extends keyof CardFormValues>(field: K, value: CardFormValues[K]) => void;
  onUseTestCard: () => void;
}

export function CardForm({ values, errors, brand, onFieldChange, onUseTestCard }: CardFormProps) {
  return (
    <div className="space-y-3 rounded-xl bg-muted p-4">
      <button
        type="button"
        onClick={onUseTestCard}
        className="text-xs font-semibold text-primary underline underline-offset-2"
      >
        Use test card
      </button>

      <div>
        <label htmlFor="card-number" className="mb-1 block text-xs font-medium text-muted-foreground">
          Card number
        </label>
        <div className="relative">
          <Input
            id="card-number"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234 1234 1234 1234"
            value={values.number}
            onChange={(e) => onFieldChange("number", formatCardNumber(e.target.value))}
            maxLength={23}
            className={cn("pr-20", errors.number && "border-danger-foreground/60")}
          />
          {brand && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2">
              <CardBrandBadge brand={brand} />
            </span>
          )}
        </div>
        {errors.number && <p className="mt-1 text-xs text-danger-foreground">{errors.number}</p>}
      </div>

      <div>
        <label htmlFor="card-name" className="mb-1 block text-xs font-medium text-muted-foreground">
          Name on card
        </label>
        <Input
          id="card-name"
          autoComplete="off"
          placeholder="Sarah Thompson"
          value={values.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          className={cn(errors.name && "border-danger-foreground/60")}
        />
        {errors.name && <p className="mt-1 text-xs text-danger-foreground">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="card-expiry" className="mb-1 block text-xs font-medium text-muted-foreground">
            Expiry (MM/YY)
          </label>
          <Input
            id="card-expiry"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/YY"
            value={values.expiry}
            onChange={(e) => onFieldChange("expiry", formatExpiry(e.target.value))}
            maxLength={5}
            className={cn(errors.expiry && "border-danger-foreground/60")}
          />
          {errors.expiry && <p className="mt-1 text-xs text-danger-foreground">{errors.expiry}</p>}
        </div>
        <div>
          <label htmlFor="card-cvv" className="mb-1 block text-xs font-medium text-muted-foreground">
            CVV
          </label>
          <Input
            id="card-cvv"
            inputMode="numeric"
            autoComplete="off"
            placeholder="123"
            value={values.cvv}
            onChange={(e) => onFieldChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
            maxLength={4}
            className={cn(errors.cvv && "border-danger-foreground/60")}
          />
          {errors.cvv && <p className="mt-1 text-xs text-danger-foreground">{errors.cvv}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 pt-1 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.saveCard}
          onChange={(e) => onFieldChange("saveCard", e.target.checked)}
          className="h-4 w-4 rounded border-border accent-[#2F6F5E]"
        />
        Save this card for future payments
      </label>
    </div>
  );
}
