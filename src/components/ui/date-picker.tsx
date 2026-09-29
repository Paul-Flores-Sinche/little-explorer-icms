"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { addDays, formatRange, formatShort, isWeekend, startOfWeek } from "@/lib/dates";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disableWeekends?: boolean;
  /** "week" selects the Monday of the clicked week. */
  mode?: "day" | "week";
  /** Number of days shown in week labels (5 = Mon–Fri, 7 = Mon–Sun). */
  weekLength?: number;
  /** "field" looks like a form input, "chip" like the header pills. */
  variant?: "field" | "chip";
  placeholder?: string;
  prefix?: string;
  invalid?: boolean;
  align?: "left" | "right";
  id?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disableWeekends,
  mode = "day",
  weekLength = 5,
  variant = "field",
  placeholder = "Select a date",
  prefix,
  invalid,
  align = "left",
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useToday();

  const label = value
    ? mode === "week"
      ? formatRange(startOfWeek(value), addDays(startOfWeek(value), weekLength - 1))
      : formatShort(value)
    : placeholder;

  const todayAllowed =
    today &&
    (!minDate || today >= minDate) &&
    (!maxDate || today <= maxDate) &&
    !(disableWeekends && isWeekend(today));

  function handleSelect(date: Date) {
    onChange(mode === "week" ? startOfWeek(date) : date);
    setOpen(false);
  }

  return (
    <div className={cn("relative", variant === "field" && "w-full", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 text-sm transition-colors",
          variant === "field"
            ? "h-12 w-full rounded-xl border border-border bg-card px-4 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            : "rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted",
          invalid && "border-danger-foreground/60",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            "flex-1 truncate",
            value ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          {prefix && <span className="text-muted-foreground">{prefix} </span>}
          {label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="dialog"
            aria-label="Choose date"
            className={cn(
              "absolute z-50 mt-2 rounded-2xl border border-border bg-card p-4 shadow-xl",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <Calendar
              selected={value}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              disableWeekends={disableWeekends}
              selectionMode={mode}
              today={today}
            />
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">
                {disableWeekends ? "Centre open Mon–Fri" : mode === "week" ? "Pick any day in a week" : ""}
              </span>
              {todayAllowed && (
                <button
                  type="button"
                  onClick={() => handleSelect(today)}
                  className="font-semibold text-primary hover:underline"
                >
                  {mode === "week" ? "This week" : "Today"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
