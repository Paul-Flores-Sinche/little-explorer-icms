"use client";

import { CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FakeSuccessBannerProps {
  message: string;
  onDismiss: () => void;
  className?: string;
}

export function FakeSuccessBanner({
  message,
  onDismiss,
  className,
}: FakeSuccessBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-success-foreground/20 bg-success px-4 py-3 text-sm font-medium text-success-foreground",
        className,
      )}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-success-foreground/70 hover:text-success-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
