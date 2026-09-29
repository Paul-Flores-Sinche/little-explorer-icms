"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { roomConfig, type Room } from "@/data/centre";
import { attendanceRooms } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface RoomFilterProps {
  value: Room | null;
  onChange: (room: Room | null) => void;
}

/** "All Rooms" dropdown used in the Staff Portal page headers. */
export function RoomFilter({ value, onChange }: RoomFilterProps) {
  const [open, setOpen] = useState(false);
  const options: (Room | null)[] = [null, ...attendanceRooms];

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {value ?? "All Rooms"}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close room filter"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl"
          >
            {options.map((option) => {
              const selected = option === value;
              return (
                <li key={option ?? "all"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted",
                      selected && "bg-muted",
                    )}
                  >
                    <span>
                      <span className="block font-semibold text-foreground">{option ?? "All Rooms"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {option
                          ? `${roomConfig[option].ageRange} · ratio ${roomConfig[option].ratio}`
                          : "Whole centre"}
                      </span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
