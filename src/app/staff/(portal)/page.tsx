"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, CirclePlus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import { StatTile } from "@/components/stat-tile";
import {
  dashboardStats,
  roomOccupancy,
  signOffStatus,
  staffDashboardDate,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

function SignOffDonut({ signedOff }: { signedOff: number }) {
  const radius = 60;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - signedOff / 100);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-2xl font-bold text-foreground">
          {signedOff}%
        </span>
        <span className="text-xs text-muted-foreground">signed off</span>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Centre Dashboard" subtitle={staffDashboardDate}>
        <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          All Rooms
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </span>
        <button type="button" aria-label="Notifications" className="text-foreground">
          <Bell className="h-5 w-5" />
        </button>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {message && (
          <FakeSuccessBanner message={message} onDismiss={() => setMessage(null)} />
        )}

        <div className="grid grid-cols-4 gap-4">
          <StatTile
            label="Enrolled Children"
            value={dashboardStats.enrolledChildren}
          />
          <StatTile
            label="Attendance Today"
            value={
              <>
                {dashboardStats.attendanceToday.present}
                <span className="text-lg text-muted-foreground">
                  /{dashboardStats.attendanceToday.total}
                </span>
              </>
            }
          />
          <StatTile
            label="Outstanding Balances"
            value={`$${dashboardStats.outstandingBalances.toLocaleString()}`}
            valueClassName="text-accent"
          />
          <StatTile
            label="Staff on Roster"
            value={
              <>
                {dashboardStats.staffOnRoster.present}
                <span className="text-lg text-muted-foreground">
                  /{dashboardStats.staffOnRoster.total}
                </span>
              </>
            }
          />
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-6">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              Room occupancy
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold">Room</th>
                  <th className="pb-3 font-semibold">Occupancy</th>
                  <th className="pb-3 font-semibold">Vacancies</th>
                </tr>
              </thead>
              <tbody>
                {roomOccupancy.map((room) => (
                  <tr key={room.room} className="border-b border-border last:border-0">
                    <td className="py-3 text-foreground">{room.room}</td>
                    <td className="py-3 text-foreground">
                      {room.occupied} / {room.capacity}
                    </td>
                    <td className="py-3 text-foreground">
                      {room.capacity - room.occupied}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="flex flex-col items-center gap-4 p-6">
            <h2 className="self-start font-heading text-lg font-bold text-foreground">
              Today&apos;s sign-off status
            </h2>
            <SignOffDonut signedOff={signOffStatus.signedOff} />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Signed off
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                Pending
              </span>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
            Quick actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/staff/enrolments"
              className={cn(buttonVariants(), "gap-2")}
            >
              <CirclePlus className="h-4 w-4" />
              New Enquiry
            </Link>
            <Link
              href="/staff/enrolments"
              className={buttonVariants({ variant: "outline" })}
            >
              Enrol Child
            </Link>
            <Link
              href="/staff/attendance"
              className={buttonVariants({ variant: "outline" })}
            >
              Record Attendance
            </Link>
            <Button
              variant="outline"
              onClick={() => setMessage("Notice sent to families.")}
            >
              Send Notice
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
