"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { SUPER_RATE, getPayPeriod, getPayroll, payrollTotals, type PayPeriod } from "@/data/centre";
import { addDays, formatRange, formatShort, toKey } from "@/lib/dates";
import { money } from "@/lib/documents";
import { downloadCsv } from "@/lib/pdf";

export type PayrollStatus = "Paid" | "Ready to process" | "In progress" | "Processed";

export function payrollStatus(period: PayPeriod, today: Date, processed: boolean): PayrollStatus {
  if (processed) return "Processed";
  if (period.payDate < today) return "Paid";
  if (period.end < today) return "Ready to process";
  return "In progress";
}

export const payrollVariant: Record<PayrollStatus, BadgeProps["variant"]> = {
  Paid: "success",
  Processed: "success",
  "Ready to process": "warning",
  "In progress": "info",
};

interface PayrollDialogProps {
  open: boolean;
  onClose: () => void;
  period: PayPeriod;
  today: Date;
  processed: boolean;
  onProcessed: () => void;
}

export function PayrollDialog({ open, onClose, period, today, processed, onProcessed }: PayrollDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"report" | "confirm" | "processing">("report");
  const lines = getPayroll(period);
  const totals = payrollTotals(lines);
  const status = payrollStatus(period, today, processed);
  const canProcess = status === "Ready to process" || status === "In progress";
  const history = [1, 2, 3, 4, 5, 6].map((offset) => {
    const previous = getPayPeriod(addDays(period.start, -14 * offset));
    const previousTotals = payrollTotals(getPayroll(previous));
    return { period: previous, totals: previousTotals, status: payrollStatus(previous, today, false) };
  });

  function close() {
    if (step === "processing") return;
    setStep("report");
    onClose();
  }

  function process() {
    setStep("processing");
    window.setTimeout(() => {
      onProcessed();
      setStep("report");
      toast({
        title: "Payroll processed",
        description: `${lines.length} payslips issued · ${money(totals.gross)} gross paid on ${formatShort(period.payDate)}.`,
        duration: 5000,
      });
    }, 1600);
  }

  function exportCsv() {
    downloadCsv(`payroll-${toKey(period.start)}.csv`, [
      ["Employee", "Role", "Employment", "Shifts", "Hours", "Rate", "Gross", "Super"],
      ...lines.map((line) => [
        line.member.name,
        line.member.role,
        line.member.employment,
        line.shifts,
        line.hours,
        line.member.hourlyRate.toFixed(2),
        line.gross.toFixed(2),
        line.superannuation.toFixed(2),
      ]),
    ]);
    toast({ title: "Payroll exported", description: `payroll-${toKey(period.start)}.csv saved to your downloads.` });
  }

  const periodLabel = formatRange(period.start, period.end);

  return (
    <Dialog
      open={open}
      onClose={close}
      size="xl"
      title="Payroll report"
      description={`Pay period ${periodLabel} · pay date ${formatShort(period.payDate)}`}
      onBack={step === "confirm" ? () => setStep("report") : undefined}
      footer={
        step === "confirm" ? (
          <>
            <Button variant="outline" onClick={() => setStep("report")}>
              Back
            </Button>
            <Button onClick={process}>Confirm &amp; process</Button>
          </>
        ) : step === "processing" ? (
          <Button disabled className="gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing payroll…
          </Button>
        ) : (
          <>
            <Button variant="outline" className="gap-2" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            {canProcess ? (
              <Button onClick={() => setStep("confirm")}>Process Payroll</Button>
            ) : (
              <Button disabled className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> {status}
              </Button>
            )}
          </>
        )
      }
    >
      {step === "confirm" || step === "processing" ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            You&apos;re about to process payroll for <span className="font-semibold">{periodLabel}</span>. Payslips
            will be emailed to staff and payments lodged with the bank for {formatShort(period.payDate)}.
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ["Employees", String(lines.length)],
              ["Total hours", totals.hours.toLocaleString()],
              ["Gross wages", money(totals.gross)],
              [`Super (${SUPER_RATE * 100}%)`, money(totals.superannuation)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-heading text-lg font-bold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          {status === "In progress" && (
            <p className="rounded-xl border border-warning-foreground/20 bg-warning px-4 py-3 text-xs text-warning-foreground">
              This pay period hasn&apos;t finished yet — hours after today are taken from the roster.
            </p>
          )}
          <p className="text-xs text-muted-foreground">Demo only — no payments are made.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={payrollVariant[status]}>{status}</Badge>
            <span className="text-sm text-muted-foreground">
              {lines.length} employees · {totals.hours.toLocaleString()} hours · {money(totals.gross)} gross ·{" "}
              {money(totals.superannuation)} super
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-2 font-semibold">Employee</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 text-right font-semibold">Shifts</th>
                  <th className="pb-2 text-right font-semibold">Hours</th>
                  <th className="pb-2 text-right font-semibold">Rate</th>
                  <th className="pb-2 text-right font-semibold">Gross</th>
                  <th className="pb-2 text-right font-semibold">Super</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.member.id} className="border-b border-border last:border-0">
                    <td className="py-2">
                      <p className="font-medium text-foreground">{line.member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.member.role}
                        {line.member.room && ` · ${line.member.room}`}
                      </p>
                    </td>
                    <td className="py-2 text-foreground">{line.member.employment}</td>
                    <td className="py-2 text-right text-foreground">{line.shifts}</td>
                    <td className="py-2 text-right text-foreground">{line.hours}</td>
                    <td className="py-2 text-right text-foreground">${line.member.hourlyRate.toFixed(2)}</td>
                    <td className="py-2 text-right font-semibold text-foreground">{money(line.gross)}</td>
                    <td className="py-2 text-right text-muted-foreground">{money(line.superannuation)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td className="pt-3 text-foreground" colSpan={3}>
                    Total
                  </td>
                  <td className="pt-3 text-right text-foreground">{totals.hours}</td>
                  <td />
                  <td className="pt-3 text-right text-foreground">{money(totals.gross)}</td>
                  <td className="pt-3 text-right text-foreground">{money(totals.superannuation)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <h3 className="mb-2 font-heading text-base font-bold text-foreground">Previous pay runs</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-2 font-semibold">Pay period</th>
                  <th className="pb-2 font-semibold">Pay date</th>
                  <th className="pb-2 text-right font-semibold">Hours</th>
                  <th className="pb-2 text-right font-semibold">Gross</th>
                  <th className="pb-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.period.index} className="border-b border-border last:border-0">
                    <td className="py-2 text-foreground">{formatRange(entry.period.start, entry.period.end)}</td>
                    <td className="py-2 text-foreground">{formatShort(entry.period.payDate)}</td>
                    <td className="py-2 text-right text-foreground">{entry.totals.hours}</td>
                    <td className="py-2 text-right text-foreground">{money(entry.totals.gross)}</td>
                    <td className="py-2 text-right">
                      <Badge variant={payrollVariant[entry.status]}>{entry.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Dialog>
  );
}
