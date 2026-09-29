"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  ImageIcon,
  Sparkles,
} from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFamilyStore } from "@/components/family/family-store";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import {
  attended,
  ava,
  eylfLabels,
  eylfOutcomes,
  getAttendance,
  getObservations,
  type AttendanceRecord,
  type EylfOutcome,
  type Observation,
} from "@/data/centre";
import {
  MONTHS_SHORT,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  addDays,
  diffInDays,
  formatLong,
  formatRange,
  formatShort,
  formatTime,
  fromKey,
  isSameDay,
  startOfWeek,
  toKey,
} from "@/lib/dates";
import { useNow, type Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const ENROLLED_FROM = fromKey(ava.startDate);

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

function dayStatus(record: AttendanceRecord, isToday: boolean): { label: string; variant: BadgeProps["variant"] } {
  switch (record.status) {
    case "Present":
      return { label: "In care now", variant: "success" };
    case "Checked out":
      return { label: "Attended", variant: "success" };
    case "Not checked in":
      return { label: isToday ? "Not arrived yet" : "No check-in", variant: "warning" };
    case "Absent – notified":
      return { label: "Absent", variant: "danger" };
    case "Absent – no notice":
      return { label: "Absent – unexplained", variant: "danger" };
    case "Booked":
      return { label: "Booked", variant: "info" };
    default:
      return { label: "Not booked", variant: "neutral" };
  }
}

function financialYearStart(today: Date) {
  const year = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(year, 6, 1);
}

function AttendanceView({ now }: { now: Now }) {
  const currentWeek = startOfWeek(now.today);
  const [weekStart, setWeekStart] = useState(currentWeek);
  const earliestWeek = startOfWeek(ENROLLED_FROM);
  const days = [0, 1, 2, 3, 4].map((offset) => addDays(weekStart, offset));
  const records = days.map((day) => getAttendance(ava, day, now));

  const booked = records.filter((record) => !["Not booked", "Closed"].includes(record.status));
  const attendedCount = records.filter(attended).length;

  const stats = useMemo(() => {
    let bookedDays = 0;
    let attendedDays = 0;
    let absences = 0;
    const fyStart = financialYearStart(now.today);
    for (let date = fyStart; date <= now.today; date = addDays(date, 1)) {
      const record = getAttendance(ava, date, now);
      if (record.status === "Not booked" || record.status === "Closed") continue;
      bookedDays += 1;
      if (attended(record)) attendedDays += 1;
      if (record.status.startsWith("Absent")) absences += 1;
    }
    return { bookedDays, attendedDays, absences };
  }, [now]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Attendance calendar</h2>
            <p className="text-sm text-muted-foreground">
              Week of {formatRange(weekStart, addDays(weekStart, 4))}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous week"
              disabled={weekStart <= earliestWeek}
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isSameDay(weekStart, currentWeek)}
              onClick={() => setWeekStart(currentWeek)}
            >
              This week
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next week"
              disabled={weekStart >= currentWeek}
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-5 md:gap-3">
          {days.map((day, index) => {
            const record = records[index];
            const isToday = isSameDay(day, now.today);
            const status = dayStatus(record, isToday);
            const inactive = record.status === "Not booked";
            return (
              <div
                key={toKey(day)}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-3 md:flex-col md:items-stretch md:gap-3",
                  isToday ? "border-primary bg-primary/5" : "border-border",
                  inactive && "bg-muted/40",
                )}
              >
                <div className="flex w-14 shrink-0 flex-col items-center md:w-auto md:flex-row md:justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {WEEKDAYS_SHORT[index]}
                  </span>
                  <span
                    className={cn(
                      "font-heading text-2xl font-bold",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                      {MONTHS_SHORT[day.getMonth()]}
                    </span>
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {record.checkIn !== null ? (
                    <dl className="space-y-1 text-xs">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Check-in</dt>
                        <dd className="font-semibold text-foreground">{formatTime(record.checkIn)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Check-out</dt>
                        <dd className="font-semibold text-foreground">
                          {record.checkOut !== null ? formatTime(record.checkOut) : "–"}
                        </dd>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        By {record.checkOutBy ?? record.checkInBy}
                      </p>
                    </dl>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {record.note ??
                        (record.status === "Booked"
                          ? "Upcoming booked day"
                          : inactive
                            ? "Not a booked day"
                            : "No check-in recorded")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {booked.length === 0
            ? "No booked days this week."
            : `Attended ${attendedCount} of ${booked.length} booked day${booked.length === 1 ? "" : "s"} this week.`}{" "}
          Ava&apos;s regular days: {ava.bookedDays.map((day) => WEEKDAYS[day]).join(", ")}.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Attendance rate (this FY)</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {stats.bookedDays ? Math.round((stats.attendedDays / stats.bookedDays) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Days attended (this FY)</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{stats.attendedDays}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">CCS absence days used</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {stats.absences}
            <span className="text-base text-muted-foreground"> / 42</span>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Learning portfolio
// ---------------------------------------------------------------------------

const outcomeStyle: Record<EylfOutcome, string> = {
  Identity: "bg-accent/15 text-accent",
  Community: "bg-info text-info-foreground",
  Wellbeing: "bg-success text-success-foreground",
  Learning: "bg-warning text-warning-foreground",
  Communication: "bg-primary/10 text-primary",
};

const photoTint = ["bg-[#e7f0ec]", "bg-[#fbeee6]", "bg-[#e9eef8]"];

/** Days (newest first) with observations, starting from `from` and going back. */
function observationDays(from: Date, count: number, now: Now) {
  const result: { date: Date; observations: Observation[] }[] = [];
  let date = from;
  let guard = 0;
  while (result.length < count && date >= ENROLLED_FROM && guard < 400) {
    const observations = getObservations(ava, date, now);
    if (observations.length > 0) result.push({ date, observations });
    date = addDays(date, -1);
    guard += 1;
  }
  return result;
}

function ObservationCard({ observation }: { observation: Observation }) {
  const { likedObservations, toggleLike } = useFamilyStore();
  const liked = likedObservations.includes(observation.id);

  return (
    <Card className="overflow-hidden">
      {observation.photos > 0 && (
        <div className={cn("grid gap-1 p-1", observation.photos > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {Array.from({ length: Math.min(observation.photos, 3) }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center rounded-xl text-muted-foreground",
                photoTint[index % photoTint.length],
                observation.photos === 1 ? "h-40" : "h-28",
                observation.photos === 3 && index === 0 && "row-span-2 h-auto",
              )}
            >
              <ImageIcon className="h-6 w-6 opacity-60" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{observation.title}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(observation.time)} · {observation.author}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              outcomeStyle[observation.outcome],
            )}
          >
            {observation.outcome}
          </span>
        </div>
        <p className="text-sm text-foreground">{observation.note}</p>
        <div className="flex flex-wrap gap-1.5">
          {observation.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{eylfLabels[observation.outcome]}</p>
        {observation.nextStep && (
          <p className="rounded-xl bg-muted/70 px-3 py-2 text-xs text-foreground">
            <span className="font-semibold">Where to next: </span>
            {observation.nextStep}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <button
            type="button"
            onClick={() => toggleLike(observation.id)}
            aria-pressed={liked}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold transition-colors",
              liked ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
            {liked ? "Loved" : "Love this"}
          </button>
          <span className="text-xs text-muted-foreground">
            {liked ? "Ms. Lee will see your reaction" : "Seen by you"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function PortfolioView({ now }: { now: Now }) {
  const [selected, setSelected] = useState<Date>(
    () => observationDays(now.today, 1, now)[0]?.date ?? now.today,
  );
  const [filter, setFilter] = useState<EylfOutcome | "All">("All");
  const [historyDays, setHistoryDays] = useState(8);

  const selectedObservations = getObservations(ava, selected, now);
  const previousDay = observationDays(addDays(selected, -1), 1, now)[0]?.date ?? null;
  let nextDay: Date | null = null;
  for (let date = addDays(selected, 1); date <= now.today; date = addDays(date, 1)) {
    if (getObservations(ava, date, now).length > 0) {
      nextDay = date;
      break;
    }
  }

  const history = observationDays(addDays(selected, -1), historyDays, now);

  const selectedLabel = isSameDay(selected, now.today)
    ? "Today"
    : diffInDays(now.today, selected) === 1
      ? "Yesterday"
      : formatLong(selected);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous day with observations"
          disabled={!previousDay}
          onClick={() => previousDay && setSelected(previousDay)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Learning on
          </p>
          <p className="font-heading text-lg font-bold text-foreground">{selectedLabel}</p>
          {selectedLabel !== formatLong(selected) && (
            <p className="text-xs text-muted-foreground">{formatShort(selected)}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next day with observations"
          disabled={!nextDay}
          onClick={() => nextDay && setSelected(nextDay)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Card>

      {selectedObservations.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No observations posted yet for this day — educators usually share after morning activities.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {selectedObservations.map((observation) => (
            <ObservationCard key={observation.id} observation={observation} />
          ))}
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-foreground">Portfolio history</h2>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...eylfOutcomes] as const).map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => setFilter(outcome)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  filter === outcome
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {outcome}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {history.map(({ date, observations }) => {
            const visible = observations.filter(
              (observation) => filter === "All" || observation.outcome === filter,
            );
            if (visible.length === 0) return null;
            return (
              <div key={toKey(date)}>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {formatLong(date)}
                </p>
                <div className="space-y-2">
                  {visible.map((observation) => (
                    <button
                      key={observation.id}
                      type="button"
                      onClick={() => {
                        setSelected(date);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="block w-full text-left"
                    >
                      <Card className="flex items-center gap-3 border-l-4 border-l-primary p-4 transition-colors hover:bg-muted">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{observation.title}</p>
                          <p className="truncate text-sm text-muted-foreground">{observation.note}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {observation.author} · {observation.outcome}
                            {observation.photos > 0 && ` · ${observation.photos} photo${observation.photos > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">No earlier observations.</p>
          )}
        </div>

        {history.length >= historyDays && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setHistoryDays((prev) => prev + 8)}
          >
            Load earlier observations
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function MyChildContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "portfolio" ? "portfolio" : "attendance");
  const now = useNow();

  return (
    <>
      <MobilePageHeader title={ava.name} subtitle={`Room: ${ava.room}`} backHref="/family" />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-wrap items-center justify-between gap-4 md:mb-2">
            <div className="hidden md:block">
              <h1 className="font-heading text-3xl font-bold text-foreground">{ava.name}</h1>
              <p className="text-muted-foreground">
                Room: {ava.room} · Enrolled since {formatShort(ENROLLED_FROM)}
              </p>
            </div>
            <TabsList className="w-full md:w-fit">
              <TabsTrigger value="attendance" className="flex-1 gap-1.5 whitespace-nowrap">
                <CalendarCheck className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex-1 gap-1.5 whitespace-nowrap">
                <Sparkles className="h-4 w-4" />
                Learning Portfolio
              </TabsTrigger>
            </TabsList>
          </div>

          {!now ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <TabsContent value="attendance">
                <AttendanceView now={now} />
              </TabsContent>
              <TabsContent value="portfolio">
                <PortfolioView now={now} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </>
  );
}

export default function MyChildPage() {
  return (
    <Suspense fallback={null}>
      <MyChildContent />
    </Suspense>
  );
}
