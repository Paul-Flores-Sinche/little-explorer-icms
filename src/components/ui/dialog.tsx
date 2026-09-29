"use client";

import { useEffect, type ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Shows a back arrow instead of relying only on the close button. */
  onBack?: () => void;
  className?: string;
}

const sizeClass = {
  sm: "md:max-w-md",
  md: "md:max-w-lg",
  lg: "md:max-w-2xl",
  xl: "md:max-w-4xl",
};

/**
 * Modal used across both portals: a bottom sheet on phones and a centred
 * dialog on larger screens (same pattern as the payment sheet).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  onBack,
  className,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card md:rounded-2xl md:shadow-xl",
          sizeClass[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
