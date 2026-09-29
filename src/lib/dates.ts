// Small, dependency-free date helpers. All dates are local-time and
// normalised to midnight unless stated otherwise.

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3));
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -weekdayIndex(date));
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isWeekend(date: Date) {
  return weekdayIndex(date) >= 5;
}

export function diffInDays(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

export function toKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "29 Sep 2026" */
export function formatShort(date: Date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "29 Sep" */
export function formatDayMonth(date: Date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "Tuesday, 29 September 2026" */
export function formatLong(date: Date) {
  return `${WEEKDAYS[weekdayIndex(date)]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Tue, 29 September 2026" */
export function formatMedium(date: Date) {
  return `${WEEKDAYS_SHORT[weekdayIndex(date)]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "29/09/2026" */
export function formatNumeric(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

/** "28 Sep – 2 Oct 2026" (or "1–5 Sep 2026" within one month). */
export function formatRange(start: Date, end: Date) {
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDayMonth(start)} – ${formatDayMonth(end)} ${end.getFullYear()}`;
  }
  return `${formatShort(start)} – ${formatShort(end)}`;
}

/** Minutes since midnight -> "8:02am" */
export function formatTime(minutes: number) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")}${suffix}`;
}

/** "3y 4m" style age at `reference`. */
export function formatAge(dob: Date, reference: Date) {
  let months =
    (reference.getFullYear() - dob.getFullYear()) * 12 + (reference.getMonth() - dob.getMonth());
  if (reference.getDate() < dob.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}m`;
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-randomness, so generated demo data is stable across
// renders, reloads and between the Family and Staff portals.
// ---------------------------------------------------------------------------

export function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: string | number) {
  let state = typeof seed === "number" ? seed >>> 0 : hashString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(random: () => number, items: readonly T[]) {
  return items[Math.floor(random() * items.length)];
}
