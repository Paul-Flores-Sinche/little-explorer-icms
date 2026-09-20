"use client";

import { useState } from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import { StatTile } from "@/components/stat-tile";
import { ccsPayments, type FamilyInvoiceRow } from "@/data/mock-data";

const statusVariant: Record<FamilyInvoiceRow["status"], BadgeProps["variant"]> = {
  Due: "warning",
  Paid: "success",
  "Overdue – 6 days": "danger",
};

export default function CcsPaymentsPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="CCS & Payments">
        <span className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          Billing period: {ccsPayments.billingPeriod}
        </span>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {message && (
          <FakeSuccessBanner message={message} onDismiss={() => setMessage(null)} />
        )}

        <div className="grid grid-cols-4 gap-4">
          <StatTile
            label="Total invoiced"
            value={`$${ccsPayments.totalInvoiced.toLocaleString()}`}
          />
          <StatTile
            label="CCS subsidy applied"
            value={`$${ccsPayments.ccsSubsidyApplied.toLocaleString()}`}
            valueClassName="text-success-foreground"
          />
          <StatTile
            label="Outstanding balance"
            value={`$${ccsPayments.outstandingBalance.toLocaleString()}`}
            valueClassName="text-accent"
          />
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">CCS submission status</p>
            <Badge variant="success" className="mt-3">
              {ccsPayments.submissionStatus}
            </Badge>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Family invoices
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("Invoices exported to CSV.")}
            >
              Export CSV
            </Button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="pb-3 font-semibold">Family</th>
                <th className="pb-3 font-semibold">Gross Fee</th>
                <th className="pb-3 font-semibold">CCS Subsidy</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {ccsPayments.familyInvoices.map((invoice) => (
                <tr key={invoice.family} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-foreground">{invoice.family}</td>
                  <td className="py-3 text-foreground">${invoice.grossFee.toFixed(2)}</td>
                  <td className="py-3 text-foreground">
                    ${invoice.ccsSubsidy.toFixed(2)}
                  </td>
                  <td className="py-3 font-semibold text-foreground">
                    ${invoice.balance.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <Badge variant={statusVariant[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    {invoice.status === "Paid" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setMessage(`Viewing ${invoice.family} invoice.`)
                        }
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setMessage(`Reminder sent to ${invoice.family}.`)
                        }
                      >
                        Send Reminder
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
