"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Search, Send } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/staff/page-header";
import { StatTile } from "@/components/stat-tile";
import { InvoicePreviewDialog } from "@/components/shared/invoice-preview";
import { getFamilyCharges, isUnpaid, type ChargeStatus, type FamilyCharge } from "@/data/centre";
import { invoiceFromCharge } from "@/data/invoices";
import { addDays, diffInDays, formatRange, formatShort, isWeekend, startOfWeek, toKey } from "@/lib/dates";
import { downloadCsv } from "@/lib/pdf";
import { useNow, type Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const EARLIEST = new Date(2025, 0, 6);

function statusVariant(status: ChargeStatus): BadgeProps["variant"] {
  if (status === "Paid") return "success";
  if (status.startsWith("Overdue")) return "danger";
  return "warning";
}

type Mode = "week" | "day";
type StatusFilter = "All" | "Unpaid" | "Paid" | "Overdue";

function submissionStatus(weekStart: Date, today: Date): { label: string; variant: BadgeProps["variant"]; detail: string } {
  const weeksAgo = Math.round(diffInDays(startOfWeek(today), weekStart) / 7);
  if (weeksAgo >= 2) return { label: "Submitted – accepted", variant: "success", detail: "Session reports accepted by Services Australia" };
  if (weeksAgo === 1) return { label: "Submitted – processing", variant: "info", detail: "Awaiting CCS payment advice" };
  return {
    label: "Draft – not yet due",
    variant: "warning",
    detail: `Session reports due ${formatShort(addDays(weekStart, 20))}`,
  };
}

function CcsContent({ now }: { now: Now }) {
  const { toast, update } = useToast();
  const [mode, setMode] = useState<Mode>("week");
  const [anchor, setAnchor] = useState<Date>(now.today);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(0);
  const [reminded, setReminded] = useState<string[]>([]);
  const [preview, setPreview] = useState<FamilyCharge | null>(null);
  const [exporting, setExporting] = useState(false);

  const weekStart = startOfWeek(anchor);
  const start = mode === "week" ? weekStart : anchor;
  const days = mode === "week" ? 7 : 1;
  const charges = getFamilyCharges(start, days, now.today);
  const periodLabel = mode === "week" ? formatRange(weekStart, addDays(weekStart, 6)) : formatShort(anchor);
  const submission = submissionStatus(weekStart, now.today);

  const totals = charges.reduce(
    (sum, charge) => ({
      gross: sum.gross + charge.grossFee,
      ccs: sum.ccs + charge.ccsSubsidy,
      outstanding: sum.outstanding + (isUnpaid(charge.status) ? charge.balance : 0),
    }),
    { gross: 0, ccs: 0, outstanding: 0 },
  );

  const term = query.trim().toLowerCase();
  const filtered = charges
    .filter((charge) => {
      if (statusFilter === "Paid") return charge.status === "Paid";
      if (statusFilter === "Unpaid") return isUnpaid(charge.status);
      if (statusFilter === "Overdue") return charge.status.startsWith("Overdue");
      return true;
    })
    .filter(
      (charge) =>
        !term ||
        `${charge.family.guardian} ${charge.family.children.map((child) => child.name).join(" ")} ${charge.invoiceNumber}`
          .toLowerCase()
          .includes(term),
    )
    .sort((a, b) => {
      const rank = (charge: FamilyCharge) => (charge.status.startsWith("Overdue") ? 0 : charge.status === "Due" ? 1 : 2);
      return rank(a) - rank(b) || a.family.surname.localeCompare(b.family.surname);
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  function sendReminder(charge: FamilyCharge) {
    setReminded((prev) => [...prev, charge.invoiceNumber]);
    toast({
      title: `Reminder sent to the ${charge.family.surname} family`,
      description: `${charge.family.guardian} was emailed about $${charge.balance.toFixed(2)} (${charge.invoiceNumber}).`,
    });
  }

  function exportCsv() {
    setExporting(true);
    const id = toast({ title: "Preparing CSV export…", description: `${filtered.length} invoices for ${periodLabel}`, variant: "loading" });
    window.setTimeout(() => {
      downloadCsv(`ccs-invoices-${toKey(start)}${mode === "day" ? "" : "-week"}.csv`, [
        ["Invoice", "Family", "Children", "Period", "Sessions", "Gross fee", "CCS subsidy", "Gap fee", "Status", "Paid with"],
        ...filtered.map((charge) => [
          charge.invoiceNumber,
          charge.family.guardian,
          charge.family.children.map((child) => child.name).join("; "),
          periodLabel,
          charge.lines.length,
          charge.grossFee.toFixed(2),
          charge.ccsSubsidy.toFixed(2),
          charge.balance.toFixed(2),
          charge.status,
          charge.paidWith ?? "",
        ]),
      ]);
      setExporting(false);
      update(id, { title: "Export complete", description: `${filtered.length} invoices saved as CSV.` });
    }, 1100);
  }

  const maxDate = mode === "week" ? addDays(startOfWeek(now.today), 6) : now.today;

  return (
    <>
      <PageHeader title="CCS & Payments" subtitle={`Billing period: ${periodLabel}`}>
        <div className="flex rounded-xl bg-muted p-1">
          {(["week", "day"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                if (option === "day" && isWeekend(anchor)) setAnchor(addDays(startOfWeek(anchor), 4));
                setPage(0);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-colors",
                mode === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <DatePicker
          variant="chip"
          mode={mode}
          weekLength={7}
          value={anchor}
          onChange={(date) => {
            setAnchor(date);
            setPage(0);
          }}
          minDate={EARLIEST}
          maxDate={maxDate}
          disableWeekends={mode === "day"}
          prefix="Billing period:"
          align="right"
        />
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          <StatTile label={mode === "week" ? "Total invoiced" : "Fees for the day"} value={`$${Math.round(totals.gross).toLocaleString()}`} />
          <StatTile
            label="CCS subsidy applied"
            value={`$${Math.round(totals.ccs).toLocaleString()}`}
            valueClassName="text-success-foreground"
          />
          <StatTile
            label="Outstanding balance"
            value={`$${Math.round(totals.outstanding).toLocaleString()}`}
            valueClassName="text-accent"
          />
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">CCS submission status</p>
            <Badge variant={submission.variant} className="mt-3">
              {submission.label}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">{submission.detail}</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Family invoices</h2>
              <p className="text-sm text-muted-foreground">
                {charges.length} families billed · {charges.filter((charge) => isUnpaid(charge.status)).length} unpaid
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search family, child or invoice"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-64 pl-9"
                />
              </div>
              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(0);
                  }}
                  className="h-10"
                >
                  <option value="All">All statuses</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="h-10 gap-2" onClick={exportCsv} disabled={exporting}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="pb-3 font-semibold">Family</th>
                <th className="pb-3 font-semibold">Invoice</th>
                <th className="pb-3 font-semibold">Gross Fee</th>
                <th className="pb-3 font-semibold">CCS Subsidy</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((charge) => {
                const sent = reminded.includes(charge.invoiceNumber);
                return (
                  <tr key={charge.invoiceNumber} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-foreground">{charge.family.surname}</p>
                      <p className="text-xs text-muted-foreground">
                        {charge.family.children.map((child) => child.firstName).join(", ")} · {charge.lines.length} session
                        {charge.lines.length === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{charge.invoiceNumber}</td>
                    <td className="py-3 text-foreground">${charge.grossFee.toFixed(2)}</td>
                    <td className="py-3 text-foreground">${charge.ccsSubsidy.toFixed(2)}</td>
                    <td className="py-3 font-semibold text-foreground">${charge.balance.toFixed(2)}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(charge.status)}>{charge.status}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPreview(charge)}>
                          View
                        </Button>
                        {isUnpaid(charge.status) && (
                          <Button
                            size="sm"
                            variant={sent ? "ghost" : "outline"}
                            disabled={sent}
                            onClick={() => sendReminder(charge)}
                            className="w-36 gap-1.5"
                          >
                            {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                            {sent ? "Reminder sent" : "Send Reminder"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No invoices match these filters.</p>
          ) : (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {currentPage + 1} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <InvoicePreviewDialog
        invoice={preview ? invoiceFromCharge(preview) : null}
        onClose={() => setPreview(null)}
        actions={
          preview && isUnpaid(preview.status) ? (
            <Button
              variant="outline"
              className="gap-2"
              disabled={reminded.includes(preview.invoiceNumber)}
              onClick={() => sendReminder(preview)}
            >
              <Send className="h-4 w-4" />
              {reminded.includes(preview.invoiceNumber) ? "Reminder sent" : "Send Reminder"}
            </Button>
          ) : null
        }
      />
    </>
  );
}

export default function CcsPaymentsPage() {
  const now = useNow();
  if (!now) {
    return (
      <>
        <PageHeader title="CCS & Payments" />
        <p className="px-8 py-10 text-sm text-muted-foreground">Loading billing data…</p>
      </>
    );
  }
  return <CcsContent now={now} />;
}
