"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Download, Eye, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { buildReport, reportTypes, type ReportTypeId } from "@/data/compliance";
import type { Room } from "@/data/centre";
import { attendanceRooms, currentStaffUser } from "@/data/mock-data";
import { addDays } from "@/lib/dates";
import { buildReportPdf, type ReportDocument } from "@/lib/documents";
import type { Now } from "@/lib/use-now";

const EARLIEST = new Date(2025, 0, 1);

export function downloadReport(report: ReportDocument) {
  buildReportPdf(report).save(`${report.reference}.pdf`);
}

interface ReportGeneratorProps {
  now: Now;
  onGenerated: (report: ReportDocument) => void;
  onView: (report: ReportDocument) => void;
}

/** Report type + date range form with a simulated generation step. */
export function ReportGenerator({ now, onGenerated, onView }: ReportGeneratorProps) {
  const { toast } = useToast();
  const [type, setType] = useState<ReportTypeId>("ar");
  const [from, setFrom] = useState<Date>(() => addDays(now.today, -60));
  const [to, setTo] = useState<Date>(now.today);
  const [room, setRoom] = useState<Room | "All">("All");
  const [status, setStatus] = useState<"idle" | "generating">("idle");
  const [result, setResult] = useState<ReportDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowsRoom = reportTypes.find((entry) => entry.id === type)?.roomFilter ?? false;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from > to) {
      setError("The start date must be before the end date.");
      return;
    }
    setError(null);
    setStatus("generating");
    window.setTimeout(() => {
      const report = buildReport(
        { type, from, to, room: allowsRoom && room !== "All" ? room : null },
        now,
        currentStaffUser.name,
      );
      setResult(report);
      setStatus("idle");
      onGenerated(report);
      toast({ title: "Report generated", description: `${report.title} (${report.reference}) is ready.` });
    }, 1400);
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xl border border-success-foreground/20 bg-success px-4 py-3 text-sm text-success-foreground">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{result.title}</p>
            <p className="text-xs">
              {result.reference} · {result.scope} · {result.period}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="gap-2" onClick={() => onView(result)}>
            <Eye className="h-4 w-4" /> View
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              downloadReport(result);
              toast({ title: "Report downloaded", description: `${result.reference}.pdf saved to your downloads.` });
            }}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
        <Button variant="ghost" className="w-full" onClick={() => setResult(null)}>
          Generate another report
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Report type</label>
        <Select value={type} onChange={(e) => setType(e.target.value as ReportTypeId)}>
          {reportTypes.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">
          {allowsRoom
            ? "Centre-wide by default — optionally narrow it to one room."
            : "Regulatory reports cover the whole centre for the selected dates."}
        </p>
      </div>

      {allowsRoom && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Room (optional)</label>
          <Select value={room} onChange={(e) => setRoom(e.target.value as Room | "All")}>
            <option value="All">Whole centre</option>
            {attendanceRooms.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Date range</label>
        <div className="grid grid-cols-2 gap-3">
          <DatePicker value={from} onChange={setFrom} minDate={EARLIEST} maxDate={to} invalid={Boolean(error)} />
          <DatePicker value={to} onChange={setTo} minDate={from} maxDate={now.today} align="right" invalid={Boolean(error)} />
        </div>
        {error && <p className="text-xs text-danger-foreground">{error}</p>}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={status === "generating"}>
        {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {status === "generating" ? "Generating report…" : "Generate"}
      </Button>
    </form>
  );
}

export function ReportPreviewDialog({ report, onClose }: { report: ReportDocument | null; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Dialog
      open={report !== null}
      onClose={onClose}
      size="xl"
      title={report?.title ?? ""}
      description={report ? `${report.reference} · ${report.scope} · ${report.period}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              if (!report) return;
              downloadReport(report);
              toast({ title: "Report downloaded", description: `${report.reference}.pdf saved to your downloads.` });
            }}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </>
      }
    >
      {report && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">
              Generated {report.generatedAt} by {report.generatedBy}
            </p>
            <p className="mt-2 text-sm text-foreground">{report.summary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {report.metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-heading text-2xl font-bold text-primary">{metric.value}</p>
              </div>
            ))}
          </div>
          {report.tables.map((table) => (
            <div key={table.title}>
              <h3 className="mb-2 font-heading text-base font-bold text-foreground">{table.title}</h3>
              {table.rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No records for this period.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                        {table.columns.map((column) => (
                          <th key={column} className="px-3 py-2 font-semibold">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, index) => (
                        <tr key={index} className="border-t border-border">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
