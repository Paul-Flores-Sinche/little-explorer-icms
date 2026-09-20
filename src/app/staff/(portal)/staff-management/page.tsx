"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import { leaveRequests, payrollSummary, weeklyRoster } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function StaffManagementPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Staff Management">
        <span className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          {weeklyRoster.weekLabel}
        </span>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {message && (
          <FakeSuccessBanner message={message} onDismiss={() => setMessage(null)} />
        )}

        <div className="grid grid-cols-[1fr_360px] gap-6">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              Weekly roster
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold" />
                  {weeklyRoster.days.map((day) => (
                    <th key={day} className="pb-3 font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyRoster.rooms.map((row) => (
                  <tr key={row.room}>
                    <td className="py-1.5 pr-4 font-medium text-foreground">
                      {row.room}
                    </td>
                    {row.assignments.map((name, index) => (
                      <td key={index} className="py-1.5 pr-3">
                        <span
                          className={cn(
                            "block rounded-lg border px-3 py-2 text-center text-sm",
                            name === "Unfilled"
                              ? "border-warning-foreground/30 bg-warning text-warning-foreground"
                              : row.room === "Nursery"
                                ? "border-success-foreground/20 bg-success text-success-foreground"
                                : "border-border bg-card text-foreground",
                          )}
                        >
                          {name}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Leave requests
              </h2>
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.staff}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {request.staff}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.type} · {request.dates}
                        </p>
                      </div>
                      <Badge
                        variant={request.status === "Approved" ? "success" : "warning"}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.status === "Pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            setMessage(`${request.staff}'s leave approved.`)
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setMessage(`${request.staff}'s leave declined.`)
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Payroll summary
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pay period</dt>
                  <dd className="font-semibold text-foreground">
                    {payrollSummary.payPeriod}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total hours worked</dt>
                  <dd className="font-semibold text-foreground">
                    {payrollSummary.totalHoursWorked}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estimated payroll</dt>
                  <dd className="font-semibold text-foreground">
                    ${payrollSummary.estimatedPayroll.toLocaleString()}
                  </dd>
                </div>
              </dl>
              <Button
                className="mt-5 w-full"
                onClick={() =>
                  setMessage(
                    `Payroll processed for ${payrollSummary.payPeriod}.`,
                  )
                }
              >
                Process Payroll
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
