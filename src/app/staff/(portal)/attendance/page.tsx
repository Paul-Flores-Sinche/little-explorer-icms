"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/toast";
import {
  AttendanceBadge,
  WeekPattern,
  WeekPatternLegend,
} from "@/components/staff/attendance-bits";
import { PageHeader } from "@/components/staff/page-header";
import { StatTile } from "@/components/stat-tile";
import {
  childrenInRoom,
  getAttendance,
  roomConfig,
  type AttendanceRecord,
  type Room,
} from "@/data/centre";
import { attendanceRooms, currentStaffUser } from "@/data/mock-data";
import {
  addDays,
  diffInDays,
  formatLong,
  formatTime,
  isSameDay,
  isWeekend,
  toKey,
  weekdayIndex,
} from "@/lib/dates";
import { useNow, type Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const EARLIEST = new Date(2025, 0, 6);
const STAFF_NAME = `${currentStaffUser.name.split(" ")[0][0]}. ${currentStaffUser.name.split(" ")[1]}`;

type Overrides = Record<string, Partial<AttendanceRecord>>;

function AttendanceContent({ now }: { now: Now }) {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get("room");
  const { toast } = useToast();
  const [room, setRoom] = useState<Room>(
    (attendanceRooms as readonly string[]).includes(initialRoom ?? "") ? (initialRoom as Room) : "Kindergarten",
  );
  const [date, setDate] = useState<Date>(now.today);
  const [overrides, setOverrides] = useState<Overrides>({});

  const isToday = isSameDay(date, now.today);
  const closed = isWeekend(date);
  const dateKey = toKey(date);

  function recordFor(childId: string, base: AttendanceRecord): AttendanceRecord {
    const override = overrides[`${childId}|${dateKey}`];
    return override ? { ...base, ...override } : base;
  }

  const rows = childrenInRoom(room)
    .map((child) => ({ child, record: recordFor(child.id, getAttendance(child, date, now)) }))
    .filter(({ record }) => record.status !== "Not booked")
    .sort((a, b) => a.child.surname.localeCompare(b.child.surname));

  const counts = {
    present: rows.filter(({ record }) => record.status === "Present").length,
    checkedOut: rows.filter(({ record }) => record.status === "Checked out").length,
    notCheckedIn: rows.filter(({ record }) => record.status === "Not checked in").length,
    absent: rows.filter(({ record }) => record.status.startsWith("Absent")).length,
  };

  function roomPresentCount(r: Room) {
    return childrenInRoom(r).filter((child) => {
      const record = recordFor(child.id, getAttendance(child, date, now));
      return record.status === "Present" || record.status === "Checked out";
    }).length;
  }

  function checkIn(childId: string, name: string) {
    setOverrides((prev) => ({
      ...prev,
      [`${childId}|${dateKey}`]: { status: "Present", checkIn: now.minutes, checkInBy: STAFF_NAME, note: null },
    }));
    toast({ title: `${name} checked in`, description: `Recorded at ${formatTime(now.minutes)} by ${STAFF_NAME}.` });
  }

  function checkOut(childId: string, name: string) {
    setOverrides((prev) => ({
      ...prev,
      [`${childId}|${dateKey}`]: {
        ...prev[`${childId}|${dateKey}`],
        status: "Checked out",
        checkOut: now.minutes,
        checkOutBy: STAFF_NAME,
      },
    }));
    toast({ title: `${name} checked out`, description: `Recorded at ${formatTime(now.minutes)} by ${STAFF_NAME}.` });
  }

  const lastFriday = addDays(date, 4 - weekdayIndex(date));

  return (
    <>
      <PageHeader title="Attendance" subtitle={formatLong(date)}>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setDate(now.today)}>
            Back to today
          </Button>
        )}
        <DatePicker
          variant="chip"
          value={date}
          onChange={setDate}
          maxDate={now.today}
          minDate={EARLIEST}
          disableWeekends={!isWeekend(now.today)}
          align="right"
        />
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        <div className="flex flex-wrap gap-3">
          {attendanceRooms.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoom(r)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors",
                r === room
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {r}
              {!closed && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    r === room ? "bg-white/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {roomPresentCount(r)}
                </span>
              )}
            </button>
          ))}
        </div>

        {closed ? (
          <Card className="flex flex-col items-center gap-3 p-12 text-center">
            <CalendarX className="h-10 w-10 text-muted-foreground" />
            <p className="font-heading text-lg font-bold text-foreground">Centre closed on weekends</p>
            <p className="text-sm text-muted-foreground">
              Little Explorer operates Monday to Friday, so there are no attendance records for this day.
            </p>
            <Button variant="outline" onClick={() => setDate(lastFriday)}>
              View Friday&apos;s attendance
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <StatTile
                label={isToday ? "Present now" : "Attended"}
                value={isToday ? counts.present : counts.present + counts.checkedOut}
                valueClassName="text-success-foreground"
              />
              <StatTile
                label={isToday ? "Checked out" : "Not checked in"}
                value={isToday ? counts.checkedOut : counts.notCheckedIn}
                valueClassName={isToday ? "text-info-foreground" : "text-warning-foreground"}
              />
              <StatTile
                label={isToday ? "Not yet checked in" : "Absent"}
                value={isToday ? counts.notCheckedIn : counts.absent}
                valueClassName="text-warning-foreground"
              />
              <StatTile
                label="Booked / capacity"
                value={
                  <>
                    {rows.length}{" "}
                    <span className="text-lg text-muted-foreground">/ {roomConfig[room].capacity}</span>
                  </>
                }
              />
            </div>

            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {room} · {rows.length} children booked
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isToday
                      ? "Live sign-in / sign-out register"
                      : `Historical record · ${diffInDays(now.today, date)} day${diffInDays(now.today, date) === 1 ? "" : "s"} ago`}
                  </p>
                </div>
                <WeekPatternLegend />
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Child</th>
                    <th className="pb-3 font-semibold">This week</th>
                    <th className="pb-3 font-semibold">Check-in</th>
                    <th className="pb-3 font-semibold">Check-out</th>
                    <th className="pb-3 font-semibold">Recorded by</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ child, record }) => (
                    <tr key={child.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium text-foreground">
                        <span className="flex items-center gap-1.5">
                          {child.name}
                          {(child.allergies || child.medical) && (
                            <span title={[child.allergies, child.medical].filter(Boolean).join(" · ")}>
                              <AlertTriangle className="h-3.5 w-3.5 text-danger-foreground" />
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3">
                        <WeekPattern child={child} date={date} now={now} onSelectDay={setDate} />
                      </td>
                      <td className="py-3 text-foreground">
                        {record.checkIn !== null ? formatTime(record.checkIn) : "–"}
                      </td>
                      <td className="py-3 text-foreground">
                        {record.checkOut !== null ? formatTime(record.checkOut) : "–"}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {record.checkInBy ? (
                          <>
                            <p>In: {record.checkInBy}</p>
                            {record.checkOutBy && <p>Out: {record.checkOutBy}</p>}
                          </>
                        ) : (
                          "–"
                        )}
                      </td>
                      <td className="py-3">
                        <AttendanceBadge status={record.status} />
                      </td>
                      <td className="py-3 text-right">
                        {record.note ? (
                          <span className="text-sm text-muted-foreground">{record.note}</span>
                        ) : isToday && record.status === "Not checked in" ? (
                          <Button size="sm" onClick={() => checkIn(child.id, child.name)}>
                            Check In
                          </Button>
                        ) : isToday && record.status === "Present" ? (
                          <Button size="sm" variant="outline" onClick={() => checkOut(child.id, child.name)}>
                            Check Out
                          </Button>
                        ) : record.status === "Checked out" ? (
                          <span className="text-xs text-muted-foreground">
                            {record.signedOff ? "Signed by parent" : "Awaiting signature"}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function AttendancePageInner() {
  const now = useNow();
  if (!now) {
    return (
      <>
        <PageHeader title="Attendance" />
        <p className="px-8 py-10 text-sm text-muted-foreground">Loading attendance…</p>
      </>
    );
  }
  return <AttendanceContent now={now} />;
}

export default function AttendancePage() {
  return (
    <Suspense fallback={null}>
      <AttendancePageInner />
    </Suspense>
  );
}
