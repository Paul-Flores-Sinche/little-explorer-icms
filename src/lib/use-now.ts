"use client";

import { useMemo, useSyncExternalStore } from "react";

import { fromKey, toKey } from "@/lib/dates";

// The real current date/time only exists in the browser. Pages are
// prerendered at build time, so reading `new Date()` during render would
// cause hydration mismatches. These hooks return `null` on the server (and
// during hydration) and the live value afterwards, ticking once a minute.

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  const now = new Date();
  return `${toKey(now)}|${now.getHours() * 60 + now.getMinutes()}`;
}

function getServerSnapshot() {
  return null;
}

export interface Now {
  /** Today at midnight (local time). */
  today: Date;
  /** Minutes elapsed since midnight. */
  minutes: number;
}

export function useNow(): Now | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!snapshot) return null;
    const [key, minutes] = snapshot.split("|");
    return { today: fromKey(key), minutes: Number(minutes) };
  }, [snapshot]);
}

export function useToday(): Date | null {
  return useNow()?.today ?? null;
}
