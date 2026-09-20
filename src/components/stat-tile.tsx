import type * as React from "react";

import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

export function StatTile({
  label,
  value,
  valueClassName,
  className,
}: StatTileProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-heading text-3xl font-bold text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
