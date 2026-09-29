"use client";

import { useState } from "react";
import { ChevronRight, Undo2 } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/staff/page-header";
import { PayrollDialog, payrollStatus, payrollVariant } from "@/components/staff/payroll-dialog";
import {
  formatLeaveDates,
  getLeaveRequests,
  getPayPeriod,
  getPayroll,
  getRoster,
  payrollTotals,
  staffById,
  type LeaveRequest,
} from "@/data/centre";
import { currentStaffUser } from "@/data/mock-data";
import {
  WEEKDAYS_SHORT,
  addDays,
  formatRange,
  formatShort,
  fromKey,
  isSameDay,
  startOfWeek,
  toKey,
} from "@/lib/dates";
import { money } from "@/lib/documents";
import { useNow, type Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const EARLIEST = new Date(2025, 0, 6);
const LEADER_ROLES = ["Room Leader", "Room Leader / ECT"];

const leaveVariant: Record<LeaveRequest["status"], BadgeProps["variant"]> = {
  Pending: "warning",
  Approved: "success",
  Declined: "danger",
};

interface Decision {
  status: "Approved" | "Declined";
  at: string;
}

function StaffManagementContent({ now }: { now: Now }) {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(now.today));
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [processedPeriods, setProcessedPeriods] = useState<number[]>([]);
  const [payrollOpen, setPayrollOpen] = useState(false);

  const requests = getLeaveRequests(weekStart, now.today).map((request) => {
    const decision = decisions[request.id];
    return decision ? { ...request, status: decision.status } : request;
  });
  const approved = requests.filter((request) => request.status === "Approved");
  const roster = getRoster(weekStart, approved);
  const days = [0, 1, 2, 3, 4].map((offset) => addDays(weekStart, offset));
  const gaps = roster.reduce(
    (sum, row) => sum + row.cells.reduce((cellSum, cell) => cellSum + cell.onLeave.length, 0),
    0,
  );

  const period = getPayPeriod(weekStart);
  const payroll = payrollTotals(getPayroll(period));
  const processed = processedPeriods.includes(period.index);
  const status = payrollStatus(period, now.today, processed);

  function decide(request: LeaveRequest, next: Decision["status"]) {
    const time = new Date();
    setDecisions((prev) => ({
      ...prev,
      [request.id]: { status: next, at: `${time.getHours() % 12 || 12}:${String(time.getMinutes()).padStart(2, "0")}${time.getHours() >= 12 ? "pm" : "am"}` },
    }));
    const member = staffById[request.staffId];
    toast({
      title: `${member.displayName}'s leave ${next.toLowerCase()}`,
      description:
        next === "Approved"
          ? `${request.type} · ${formatLeaveDates(request)}. The roster now shows shifts that need cover.`
          : `${member.name} has been notified.`,
    });
  }

  function undo(request: LeaveRequest) {
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[request.id];
      return next;
    });
  }

  return (
    <>
      <PageHeader title="Staff Management" subtitle={`${roster.length} rooms · 20 staff`}>
        {!isSameDay(weekStart, startOfWeek(now.today)) && (
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(now.today))}>
            This week
          </Button>
        )}
        <DatePicker
          variant="chip"
          mode="week"
          weekLength={5}
          value={weekStart}
          onChange={setWeekStart}
          minDate={EARLIEST}
          maxDate={addDays(now.today, 7 * 12)}
          prefix="Week of"
          align="right"
        />
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-[1fr_360px] gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-foreground">Weekly roster</h2>
              <p className="text-xs text-muted-foreground">
                {gaps > 0 ? `${gaps} shift${gaps > 1 ? "s need" : " needs"} cover` : "All shifts covered"} · Room leaders in bold
              </p>
            </div>
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="w-28 pb-3 font-semibold" />
                  {days.map((day, index) => (
                    <th
                      key={toKey(day)}
                      className={cn("pb-3 font-semibold", isSameDay(day, now.today) && "text-primary")}
                    >
                      {WEEKDAYS_SHORT[index]} {day.getDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.map((row) => (
                  <tr key={row.room}>
                    <td className="py-1.5 pr-4 align-top font-medium text-foreground">{row.room}</td>
                    {row.cells.map((cell) => (
                      <td key={cell.date} className="py-1.5 pr-2 align-top">
                        <div
                          className={cn(
                            "space-y-0.5 rounded-lg border px-2.5 py-2 text-xs",
                            cell.onLeave.length > 0
                              ? "border-warning-foreground/30 bg-warning"
                              : row.room === "Nursery"
                                ? "border-success-foreground/20 bg-success"
                                : "border-border bg-card",
                            isSameDay(fromKey(cell.date), now.today) && "ring-2 ring-primary/30",
                          )}
                        >
                          {cell.educators.map((member) => (
                            <p
                              key={member.id}
                              title={`${member.name} · ${member.role}`}
                              className={cn(
                                "truncate text-foreground",
                                LEADER_ROLES.includes(member.role) && "font-bold",
                              )}
                            >
                              {member.surname}
                            </p>
                          ))}
                          {cell.onLeave.map((member) => (
                            <p key={member.id} className="truncate font-semibold text-warning-foreground">
                              Unfilled <span className="font-normal line-through">({member.surname})</span>
                            </p>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Leave requests</h2>
              <div className="space-y-4">
                {requests.map((request) => {
                  const member = staffById[request.staffId];
                  const decision = decisions[request.id];
                  return (
                    <div key={request.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{member.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} · {formatLeaveDates(request)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.reason} · submitted {formatShort(fromKey(request.submitted))}
                          </p>
                        </div>
                        <Badge variant={leaveVariant[request.status]} className="transition-colors">
                          {request.status}
                        </Badge>
                      </div>
                      {request.status === "Pending" ? (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => decide(request, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decide(request, "Declined")}>
                            Decline
                          </Button>
                        </div>
                      ) : decision ? (
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {decision.status} by {currentStaffUser.name} · {decision.at}
                          </span>
                          <button
                            type="button"
                            onClick={() => undo(request)}
                            className="flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <Undo2 className="h-3 w-3" /> Undo
                          </button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">{request.status} by Helen Harrington</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <button type="button" onClick={() => setPayrollOpen(true)} className="block w-full text-left">
              <Card className="p-6 transition-colors hover:bg-muted/60">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="font-heading text-lg font-bold text-foreground">Payroll summary</h2>
                  <Badge variant={payrollVariant[status]}>{status}</Badge>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pay period</dt>
                    <dd className="font-semibold text-foreground">{formatRange(period.start, period.end)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total hours worked</dt>
                    <dd className="font-semibold text-foreground">{payroll.hours.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated payroll</dt>
                    <dd className="font-semibold text-foreground">{money(payroll.gross)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pay date</dt>
                    <dd className="font-semibold text-foreground">{formatShort(period.payDate)}</dd>
                  </div>
                </dl>
                <span className="mt-5 flex items-center justify-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  View payroll report <ChevronRight className="h-4 w-4" />
                </span>
              </Card>
            </button>
          </div>
        </div>
      </div>

      <PayrollDialog
        key={period.index}
        open={payrollOpen}
        onClose={() => setPayrollOpen(false)}
        period={period}
        today={now.today}
        processed={processed}
        onProcessed={() => setProcessedPeriods((prev) => [...prev, period.index])}
      />
    </>
  );
}

export default function StaffManagementPage() {
  const now = useNow();
  if (!now) {
    return (
      <>
        <PageHeader title="Staff Management" />
        <p className="px-8 py-10 text-sm text-muted-foreground">Loading roster…</p>
      </>
    );
  }
  return <StaffManagementContent now={now} />;
}
