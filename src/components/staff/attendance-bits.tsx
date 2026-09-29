import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  getAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
  type EnrolledChild,
} from "@/data/centre";
import { WEEKDAYS, WEEKDAYS_SHORT, addDays, formatShort, isSameDay, startOfWeek } from "@/lib/dates";
import type { Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export const attendanceVariant: Record<AttendanceStatus, BadgeProps["variant"]> = {
  Present: "success",
  "Checked out": "info",
  "Not checked in": "warning",
  "Absent – notified": "neutral",
  "Absent – no notice": "danger",
  "Not booked": "neutral",
  Booked: "neutral",
  Closed: "neutral",
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return <Badge variant={attendanceVariant[status]}>{status}</Badge>;
}

function patternClass(record: AttendanceRecord) {
  switch (record.status) {
    case "Present":
    case "Checked out":
      return "bg-success-foreground text-white";
    case "Absent – notified":
      return "bg-warning-foreground/80 text-white";
    case "Absent – no notice":
      return "bg-danger-foreground text-white";
    case "Not checked in":
      return "border-2 border-warning-foreground/60 text-warning-foreground";
    case "Booked":
      return "border-2 border-dashed border-border text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground/50";
  }
}

/** Mon–Fri row of dots showing a child's attendance for the week of `date`. */
export function WeekPattern({
  child,
  date,
  now,
  onSelectDay,
}: {
  child: EnrolledChild;
  date: Date;
  now: Now;
  onSelectDay?: (date: Date) => void;
}) {
  const monday = startOfWeek(date);
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((offset) => {
        const day = addDays(monday, offset);
        const record = getAttendance(child, day, now);
        const selected = isSameDay(day, date);
        return (
          <button
            key={offset}
            type="button"
            disabled={!onSelectDay || day > now.today}
            onClick={() => onSelectDay?.(day)}
            title={`${WEEKDAYS[offset]} ${formatShort(day)} — ${record.status}`}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold disabled:cursor-default",
              patternClass(record),
              selected && "ring-2 ring-primary ring-offset-1",
            )}
          >
            {WEEKDAYS_SHORT[offset][0]}
          </button>
        );
      })}
    </div>
  );
}

export function WeekPatternLegend() {
  const items = [
    { label: "Attended", className: "bg-success-foreground" },
    { label: "Absent (notified)", className: "bg-warning-foreground/80" },
    { label: "Absent (no notice)", className: "bg-danger-foreground" },
    { label: "Not yet arrived", className: "border-2 border-warning-foreground/60" },
    { label: "Booked (upcoming)", className: "border-2 border-dashed border-border" },
    { label: "Not booked", className: "bg-muted" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded-full", item.className)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function BookedDays({ child }: { child: EnrolledChild }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((day) => (
        <span
          key={day}
          title={WEEKDAYS[day]}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
            child.bookedDays.includes(day) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/40",
          )}
        >
          {WEEKDAYS_SHORT[day][0]}
        </span>
      ))}
    </div>
  );
}
