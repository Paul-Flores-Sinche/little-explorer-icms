"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  MONTHS,
  WEEKDAYS_SHORT,
  addDays,
  addMonths,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfWeek,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disableWeekends?: boolean;
  /** "week" highlights the whole Monday–Sunday week of the selection. */
  selectionMode?: "day" | "week";
  today?: Date | null;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  disableWeekends,
  selectionMode = "day",
  today,
}: CalendarProps) {
  const [month, setMonth] = useState(() => {
    const base = selected ?? today ?? maxDate ?? minDate ?? new Date(2026, 0, 1);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;
  const firstCell = startOfWeek(month);
  const cells = Array.from({ length: 42 }, (_, index) => addDays(firstCell, index));
  const weeks = [0, 1, 2, 3, 4, 5]
    .map((row) => cells.slice(row * 7, row * 7 + 7))
    .filter((week) => week.some((day) => day.getMonth() === month.getMonth()));

  const canGoBack = !min || addMonths(month, 0) > min;
  const canGoForward = !max || addMonths(month, 1) <= max;

  const minYear = min ? min.getFullYear() : month.getFullYear() - 10;
  const maxYear = max ? max.getFullYear() : month.getFullYear() + 5;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  function isDisabled(day: Date) {
    if (min && day < min) return true;
    if (max && day > max) return true;
    if (disableWeekends && isWeekend(day)) return true;
    return false;
  }

  const selectedWeek = selected && selectionMode === "week" ? startOfWeek(selected) : null;

  return (
    <div className="w-72 select-none">
      <div className="mb-3 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => setMonth((prev) => addMonths(prev, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          <select
            aria-label="Month"
            value={month.getMonth()}
            onChange={(e) => setMonth(new Date(month.getFullYear(), Number(e.target.value), 1))}
            className="rounded-lg bg-transparent px-1 py-1 font-heading text-sm font-bold text-foreground hover:bg-muted"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={month.getFullYear()}
            onChange={(e) => setMonth(new Date(Number(e.target.value), month.getMonth(), 1))}
            className="rounded-lg bg-transparent px-1 py-1 font-heading text-sm font-bold text-foreground hover:bg-muted"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canGoForward}
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS_SHORT.map((day) => (
          <span key={day} className="pb-1 text-[11px] font-semibold text-muted-foreground uppercase">
            {day.slice(0, 2)}
          </span>
        ))}
        {weeks.flat().map((day) => {
          const outside = day.getMonth() !== month.getMonth();
          const disabled = isDisabled(day);
          const isSelected =
            selectionMode === "day"
              ? selected && isSameDay(day, selected)
              : selectedWeek && isSameDay(startOfWeek(day), selectedWeek);
          const isToday = today && isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                "mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors",
                outside ? "text-muted-foreground/60" : "text-foreground",
                !disabled && !isSelected && "hover:bg-muted",
                disabled && "cursor-not-allowed text-muted-foreground/30 line-through",
                isToday && !isSelected && "font-bold text-primary ring-1 ring-primary/40",
                isSelected && "bg-primary font-semibold text-primary-foreground",
                selectionMode === "week" && isSelected && "w-full rounded-none",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
