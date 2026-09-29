"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ChevronLeft, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/staff/page-header";
import { AttendanceBadge, BookedDays } from "@/components/staff/attendance-bits";
import { StatTile } from "@/components/stat-tile";
import {
  childrenInRoom,
  familyById,
  getAttendance,
  operatingDay,
  roomConfig,
  roomEducators,
  staffOnShift,
  summariseRoomDay,
  type Room,
} from "@/data/centre";
import { formatAge, formatMedium, formatTime, fromKey } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const ccsVariant = { Active: "success", "Pending CWA": "warning", "Not claimed": "neutral" } as const;

export function RoomDetail({ room }: { room: Room }) {
  const now = useNow();
  const [query, setQuery] = useState("");
  const config = roomConfig[room];
  const children = childrenInRoom(room).sort((a, b) => a.surname.localeCompare(b.surname));
  const day = now ? operatingDay(now.today) : null;
  const summary = now && day ? summariseRoomDay(room, day, now) : null;
  const onShift = day ? staffOnShift(day, room) : [];
  const term = query.trim().toLowerCase();
  const visible = children.filter(
    (child) =>
      !term ||
      child.name.toLowerCase().includes(term) ||
      familyById[child.familyId].guardian.toLowerCase().includes(term),
  );
  const flagged = children.filter((child) => child.allergies || child.medical).length;

  return (
    <>
      <PageHeader title={`${room} room`} subtitle={`${config.ageRange} · educator ratio ${config.ratio}`}>
        <Link href="/staff" className={cn(buttonVariants({ variant: "outline" }), "gap-1")}>
          <ChevronLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href={`/staff/attendance?room=${room}`}
          className={buttonVariants()}
        >
          Open attendance
        </Link>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/staff" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span>Room occupancy</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{room}</span>
        </nav>

        <div className="grid grid-cols-5 gap-4">
          <StatTile label="Enrolled" value={children.length} />
          <StatTile
            label="Booked per day"
            value={
              <>
                {config.bookedPerDay}
                <span className="text-lg text-muted-foreground"> / {config.capacity}</span>
              </>
            }
          />
          <StatTile
            label={day && now && formatMedium(day) !== formatMedium(now.today) ? "Attended (last day)" : "Here today"}
            value={summary ? summary.present + summary.checkedOut : "–"}
            valueClassName="text-success-foreground"
          />
          <StatTile label="Absent" value={summary ? summary.absent : "–"} />
          <StatTile label="Allergy / medical plans" value={flagged} valueClassName="text-accent" />
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Enrolled children</h2>
                <p className="text-sm text-muted-foreground">
                  {day ? `Attendance for ${formatMedium(day)}` : "Loading attendance…"}
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search child or parent"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 w-64 pl-9"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Child</th>
                    <th className="pb-3 font-semibold">Age</th>
                    <th className="pb-3 font-semibold">Booked days</th>
                    <th className="pb-3 font-semibold">Today</th>
                    <th className="pb-3 font-semibold">CCS</th>
                    <th className="pb-3 font-semibold">Primary contact</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((child) => {
                    const family = familyById[child.familyId];
                    const record = now && day ? getAttendance(child, day, now) : null;
                    return (
                      <tr key={child.id} className="border-b border-border align-top last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-foreground">{child.name}</p>
                          {(child.allergies || child.medical) && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-danger-foreground">
                              <AlertTriangle className="h-3 w-3" />
                              {[child.allergies, child.medical].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </td>
                        <td className="py-3 text-foreground">
                          {now ? formatAge(fromKey(child.dob), now.today) : "–"}
                        </td>
                        <td className="py-3">
                          <BookedDays child={child} />
                        </td>
                        <td className="py-3">
                          {record ? (
                            <div className="space-y-1">
                              <AttendanceBadge status={record.status} />
                              {record.checkIn !== null && (
                                <p className="text-xs text-muted-foreground">
                                  In {formatTime(record.checkIn)}
                                  {record.checkOut !== null && ` · Out ${formatTime(record.checkOut)}`}
                                </p>
                              )}
                              {record.note && <p className="text-xs text-muted-foreground">{record.note}</p>}
                            </div>
                          ) : (
                            "–"
                          )}
                        </td>
                        <td className="py-3">
                          <Badge variant={ccsVariant[child.ccsStatus]}>{child.ccsStatus}</Badge>
                          {child.ccsPercent > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">{child.ccsPercent}% subsidy</p>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="text-foreground">{family.guardian}</p>
                          <p className="text-xs text-muted-foreground">{family.phone}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {visible.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No children match your search.</p>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">Educators today</h2>
              <p className="mb-4 text-xs text-muted-foreground">Required ratio {config.ratio}</p>
              <ul className="space-y-3">
                {roomEducators[room].map((member) => {
                  const working = onShift.some((entry) => entry.id === member.id);
                  return (
                    <li key={member.id} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant={working ? "success" : "neutral"}>{working ? "On shift" : "Day off"}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
            <Card className="p-6 text-sm">
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Room details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Licensed places</dt>
                  <dd className="font-semibold text-foreground">{config.capacity}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Daily fee</dt>
                  <dd className="font-semibold text-foreground">${config.dailyFee.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vacancies per day</dt>
                  <dd className="font-semibold text-foreground">{config.capacity - config.bookedPerDay}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
