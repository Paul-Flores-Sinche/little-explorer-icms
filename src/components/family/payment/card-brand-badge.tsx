import { cn } from "@/lib/utils";

import type { CardBrand } from "./utils";

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
  unionpay: "UnionPay",
  maestro: "Maestro",
  interac: "Interac",
  discover: "DISCOVER",
};

const BRAND_CLASS: Record<CardBrand, string> = {
  visa: "bg-[#1A1F71] text-white",
  mastercard: "bg-white text-foreground border border-border",
  amex: "bg-[#2E77BC] text-white",
  unionpay: "bg-gradient-to-r from-[#E21836] via-[#00447C] to-[#007B84] text-white",
  maestro: "bg-white text-foreground border border-border",
  interac: "bg-[#FFD200] text-[#003057]",
  discover: "bg-[#F68121] text-white",
};

interface CardBrandBadgeProps {
  brand: CardBrand;
  className?: string;
}

export function CardBrandBadge({ brand, className }: CardBrandBadgeProps) {
  const showDots = brand === "mastercard" || brand === "maestro";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-bold tracking-wide whitespace-nowrap",
        BRAND_CLASS[brand],
        className,
      )}
    >
      {showDots && (
        <span className="relative flex h-2.5 w-4 shrink-0 items-center">
          <span
            className={cn(
              "absolute left-0 h-2.5 w-2.5 rounded-full",
              brand === "mastercard" ? "bg-[#EB001B]" : "bg-[#0099DF]",
            )}
          />
          <span
            className={cn(
              "absolute left-1.5 h-2.5 w-2.5 rounded-full mix-blend-multiply",
              brand === "mastercard" ? "bg-[#F79E1B]" : "bg-[#ED0006]",
            )}
          />
        </span>
      )}
      {BRAND_LABEL[brand]}
    </span>
  );
}
