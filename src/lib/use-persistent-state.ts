"use client";

import { useCallback, useEffect, useState, type SetStateAction } from "react";

// Same convention as the shared enquiry store: state lives in React, is
// hydrated from localStorage after mount (to avoid SSR mismatches) and is
// written back on every change. Demo-only — nothing leaves the browser.

function read<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures — the demo still works in-memory.
  }
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = read<T>(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage) that isn't available during SSR
    if (stored !== undefined) setValue(stored);
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) write(key, value);
  }, [key, value, hydrated]);

  const update = useCallback((next: SetStateAction<T>) => setValue(next), []);

  return [value, update] as const;
}
