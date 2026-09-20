import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
