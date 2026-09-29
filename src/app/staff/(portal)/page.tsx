"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/staff/page-header";
import { RoomFilter } from "@/components/staff/room-filter";
import { SendNoticeDialog } from "@/components/staff/send-notice-dialog";
import { StaffNotificationBell } from "@/components/staff/notification-bell";
import { StatTile } from "@/components/stat-tile";
import { useEnquiries } from "@/components/shared/enquiry-store";
import {
  childrenInRoom,
  enrolledChildren,
  getFamilyCharges,
  operatingDay,
  outstandingForRoom,
  roomConfig,
  roomEducators,
  staffMembers,
  staffOnShift,
  summariseRoomDay,
  type Room,
} from "@/data/centre";
import { attendanceRooms } from "@/data/mock-data";
import { formatMedium, isSameDay, startOfWeek } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

function SignOffDonut({ signedOff }: { signedOff: number }) {
  const radius = 60;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - signedOff / 100);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-2xl font-bold text-foreground">{signedOff}%</span>
        <span className="text-xs text-muted-foreground">signed off</span>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const { enquiries } = useEnquiries();
  const now = useNow();

  const openEnquiries = enquiries.filter(
    (enquiry) => enquiry.status !== "Resolved" && (!room || enquiry.room === room),
  );
  const rooms = room ? [room] : [...attendanceRooms];

  const day = now ? operatingDay(now.today) : null;
  const closedToday = now && day ? !isSameDay(day, now.today) : false;
  const summaries = now && day ? rooms.map((r) => summariseRoomDay(r, day, now)) : [];
  const booked = summaries.reduce((sum, entry) => sum + entry.booked, 0);
  const attendedToday = summaries.reduce((sum, entry) => sum + entry.present + entry.checkedOut, 0);
  const signedOff = summaries.reduce((sum, entry) => sum + entry.signedOff, 0);
  const outstanding = now
    ? outstandingForRoom(getFamilyCharges(startOfWeek(now.today), 7, now.today), room)
    : 0;
  const staffTotal = room ? roomEducators[room].length : staffMembers.length;
  const staffToday = day ? staffOnShift(day, room).length : 0;
  const enrolled = room ? childrenInRoom(room).length : enrolledChildren.length;

  return (
    <>
      <PageHeader
        title={room ? `Centre Dashboard · ${room}` : "Centre Dashboard"}
        subtitle={now ? formatMedium(now.today) : " "}
      >
        <RoomFilter value={room} onChange={setRoom} />
        <StaffNotificationBell />
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {closedToday && day && (
          <div className="flex items-center gap-3 rounded-xl border border-info-foreground/20 bg-info px-4 py-3 text-sm text-info-foreground">
            <Info className="h-4 w-4 shrink-0" />
            The centre is closed today — figures below are from {formatMedium(day)}.
          </div>
        )}

        <div className="grid grid-cols-5 gap-4">
          <Link href={`/staff/enrolments?tab=enrolled${room ? `&room=${room}` : ""}`} className="block">
            <StatTile
              label="Enrolled Children"
              value={enrolled}
              className="h-full transition-colors hover:bg-muted"
            />
          </Link>
          <Link href="/staff/attendance" className="block">
            <StatTile
              label={closedToday ? "Attendance (last day)" : "Attendance Today"}
              value={
                <>
                  {now ? attendedToday : "–"}
                  <span className="text-lg text-muted-foreground">/{now ? booked : "–"}</span>
                </>
              }
              className="h-full transition-colors hover:bg-muted"
            />
          </Link>
          <Link href="/staff/ccs-payments" className="block">
            <StatTile
              label="Outstanding Balances"
              value={now ? `$${outstanding.toLocaleString()}` : "–"}
              valueClassName="text-accent"
              className="h-full transition-colors hover:bg-muted"
            />
          </Link>
          <Link href="/staff/staff-management" className="block">
            <StatTile
              label="Staff on Roster"
              value={
                <>
                  {now ? staffToday : "–"}
                  <span className="text-lg text-muted-foreground">/{staffTotal}</span>
                </>
              }
              className="h-full transition-colors hover:bg-muted"
            />
          </Link>
          <Link href="/staff/enrolments" className="block">
            <StatTile
              label="Enquiries to Resolve"
              value={openEnquiries.length}
              valueClassName="text-accent"
              className="h-full transition-colors hover:bg-muted"
            />
          </Link>
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">Room occupancy</h2>
              <p className="text-xs text-muted-foreground">Select a room to see its children</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold">Room</th>
                  <th className="pb-3 font-semibold">Occupancy</th>
                  <th className="pb-3 font-semibold">Vacancies</th>
                  <th className="pb-3 font-semibold">Present</th>
                  <th className="pb-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => {
                  const config = roomConfig[r];
                  const summary = summaries.find((entry) => entry.room === r);
                  const occupied = config.bookedPerDay;
                  const href = `/staff/rooms/${config.slug}`;
                  return (
                    <tr
                      key={r}
                      onClick={() => router.push(href)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted"
                    >
                      <td className="py-3 font-medium text-foreground">
                        <Link href={href} onClick={(e) => e.stopPropagation()} className="hover:underline">
                          {r}
                        </Link>
                        <p className="text-xs font-normal text-muted-foreground">{config.ageRange}</p>
                      </td>
                      <td className="py-3 text-foreground">
                        <div className="flex items-center gap-3">
                          <span className="w-14">
                            {occupied} / {config.capacity}
                          </span>
                          <span className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <span
                              className={cn(
                                "block h-full rounded-full",
                                occupied >= config.capacity ? "bg-accent" : "bg-primary",
                              )}
                              style={{ width: `${(occupied / config.capacity) * 100}%` }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-foreground">{config.capacity - occupied}</td>
                      <td className="py-3 text-foreground">
                        {summary ? summary.present + summary.checkedOut : "–"}
                      </td>
                      <td className="py-3 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card className="flex flex-col items-center gap-4 p-6">
            <h2 className="self-start font-heading text-lg font-bold text-foreground">
              {closedToday ? "Last day's sign-off status" : "Today's sign-off status"}
            </h2>
            <SignOffDonut signedOff={booked ? Math.round((signedOff / booked) * 100) : 0} />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Signed off ({signedOff})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                Pending ({Math.max(booked - signedOff, 0)})
              </span>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/staff/enrolments" className={cn(buttonVariants(), "gap-2")}>
              Review Enquiries
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold">
                {openEnquiries.length}
              </span>
            </Link>
            <Link href="/staff/enrolments" className={buttonVariants({ variant: "outline" })}>
              Enrol Child
            </Link>
            <Link
              href={`/staff/attendance${room ? `?room=${room}` : ""}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Record Attendance
            </Link>
            <Button variant="outline" onClick={() => setNoticeOpen(true)}>
              Send Notice
            </Button>
          </div>
        </div>
      </div>

      <SendNoticeDialog
        key={room ?? "all"}
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        defaultRoom={room}
      />
    </>
  );
}
