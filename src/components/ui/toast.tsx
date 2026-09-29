"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "error" | "loading";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Loading toasts never auto-dismiss. */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => number;
  update: (id: number, input: ToastInput) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "bg-success text-success-foreground" },
  info: { icon: Info, className: "bg-info text-info-foreground" },
  error: { icon: XCircle, className: "bg-danger text-danger-foreground" },
  loading: { icon: Loader2, className: "bg-muted text-primary" },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const schedule = useCallback(
    (id: number, input: ToastInput) => {
      if (input.variant === "loading") return;
      window.setTimeout(() => dismiss(id), input.duration ?? 4000);
    },
    [dismiss],
  );

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { ...input, id }]);
      schedule(id, input);
      return id;
    },
    [schedule],
  );

  const update = useCallback(
    (id: number, input: ToastInput) => {
      setToasts((prev) => prev.map((item) => (item.id === id ? { ...input, id } : item)));
      schedule(id, input);
    },
    [schedule],
  );

  const value = useMemo(() => ({ toast, update, dismiss }), [toast, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:items-end"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "success";
          const { icon: Icon, className } = variantStyles[variant];
          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  className,
                )}
              >
                <Icon className={cn("h-4 w-4", variant === "loading" && "animate-spin")} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(item.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
