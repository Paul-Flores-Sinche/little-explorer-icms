import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaymentMethodOptionProps {
  label: string;
  icon: ReactNode;
  selected: boolean;
  expandable?: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

export function PaymentMethodOption({
  label,
  icon,
  selected,
  expandable,
  onSelect,
  children,
}: PaymentMethodOptionProps) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex w-full items-center gap-4 py-4 text-left"
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-foreground bg-foreground" : "border-border bg-transparent",
          )}
        >
          {selected && <Check className="h-4 w-4 text-card" strokeWidth={3} />}
        </span>
        <span className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
          {icon}
        </span>
        <span className="flex-1 text-base font-semibold text-foreground">{label}</span>
        {expandable && (
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
              selected && "rotate-180",
            )}
          />
        )}
      </button>
      {selected && children && <div className="pb-4">{children}</div>}
    </div>
  );
}
