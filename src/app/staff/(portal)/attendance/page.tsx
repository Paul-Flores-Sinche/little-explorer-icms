"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import { StatTile } from "@/components/stat-tile";
import {
  attendanceByRoom,
  attendanceRooms,
  staffAttendanceDate,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const [room, setRoom] = useState<(typeof attendanceRooms)[number]>(
    "Kindergarten",
  );
  const [message, setMessage] = useState<string | null>(null);
  const data = attendanceByRoom[room];

  return (
    <>
      <PageHeader title="Attendance">
        <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {staffAttendanceDate}
        </span>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {message && (
          <FakeSuccessBanner message={message} onDismiss={() => setMessage(null)} />
        )}

        <div className="flex gap-3">
          {attendanceRooms.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoom(r)}
              className={cn(
                "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors",
                r === room
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatTile
            label="Present"
            value={data.present}
            valueClassName="text-success-foreground"
          />
          <StatTile
            label="Not yet checked in"
            value={data.notCheckedIn}
            valueClassName="text-warning-foreground"
          />
          <StatTile label="Absent (notified)" value={data.absent} />
          <StatTile
            label="Room capacity"
            value={
              <>
                {data.occupied}{" "}
                <span className="text-lg text-muted-foreground">
                  / {data.capacity}
                </span>
              </>
            }
          />
        </div>

        <Card className="p-6">
          {data.children.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No attendance records for this room yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold">Child</th>
                  <th className="pb-3 font-semibold">Check-in</th>
                  <th className="pb-3 font-semibold">Check-out</th>
                  <th className="pb-3 font-semibold">Recorded By</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {data.children.map((child) => (
                  <tr key={child.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{child.name}</td>
                    <td className="py-3 text-foreground">{child.checkIn}</td>
                    <td className="py-3 text-foreground">{child.checkOut}</td>
                    <td className="py-3 text-foreground">{child.recordedBy}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          child.status === "Present"
                            ? "success"
                            : child.status === "Not checked in"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {child.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {child.note ? (
                        <span className="text-sm text-muted-foreground">
                          {child.note}
                        </span>
                      ) : child.status === "Not checked in" ? (
                        <Button
                          size="sm"
                          onClick={() => setMessage(`${child.name} checked in.`)}
                        >
                          Check In
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMessage(`${child.name} checked out.`)}
                        >
                          Check Out
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
