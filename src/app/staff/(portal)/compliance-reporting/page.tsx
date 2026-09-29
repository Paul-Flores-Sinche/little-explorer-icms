"use client";

import { useState } from "react";
import { Check, ChevronRight, CircleAlert, Eye, Send, X } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/staff/page-header";
import { QualityAreaDialog, StaffComplianceDialog } from "@/components/staff/compliance-dialogs";
import { ReportGenerator, ReportPreviewDialog } from "@/components/staff/report-generator";
import { staffById, type StaffMember } from "@/data/centre";
import {
  allStaffCompliance,
  documentStatus,
  qualityAreas,
  requiredDocuments,
  statusVariantFor,
  type QualityArea,
} from "@/data/compliance";
import { addDays, formatShort } from "@/lib/dates";
import type { ReportDocument } from "@/lib/documents";
import { useNow, type Now } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const documentVariant: Record<ReturnType<typeof documentStatus>, BadgeProps["variant"]> = {
  Current: "success",
  "Review due": "warning",
  Missing: "danger",
};

function ComplianceContent({ now }: { now: Now }) {
  const { toast } = useToast();
  const [area, setArea] = useState<QualityArea | null>(null);
  const [member, setMember] = useState<StaffMember | null>(null);
  const [reminded, setReminded] = useState<string[]>([]);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [preview, setPreview] = useState<ReportDocument | null>(null);
  const [recent, setRecent] = useState<ReportDocument[]>([]);

  const staff = allStaffCompliance();
  const alerts = staff.filter((entry) => entry.status !== "Current");
  const listed = showAllStaff ? staff : alerts;
  const completeAreas = qualityAreas.filter((entry) => entry.status === "Complete").length;
  const documentsCurrent = requiredDocuments.filter((doc) => documentStatus(doc) === "Current").length;

  function remind(target: StaffMember) {
    setReminded((prev) => [...prev, target.id]);
    const summary = staff.find((entry) => entry.member.id === target.id);
    toast({
      title: `Reminder sent to ${target.displayName}`,
      description: summary?.worst && summary.status !== "Current"
        ? `Renew ${summary.worst.name.split(" (")[0]} — emailed to ${target.email}.`
        : `Compliance check-in emailed to ${target.email}.`,
    });
  }

  function handleGenerated(report: ReportDocument) {
    setRecent((prev) => [report, ...prev].slice(0, 5));
  }

  return (
    <>
      <PageHeader title="Compliance & Reporting" subtitle="National Quality Framework · ACECQA">
        <Button onClick={() => setGeneratorOpen(true)}>Generate Report</Button>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  NQF quality areas – documentation status
                </h2>
                <p className="text-xs text-muted-foreground">
                  {completeAreas} of {qualityAreas.length} complete
                </p>
              </div>
              <div className="divide-y divide-border">
                {qualityAreas.map((qa) => {
                  const met = qa.standards.filter((standard) => standard.met).length;
                  return (
                    <button
                      key={qa.code}
                      type="button"
                      onClick={() => setArea(qa)}
                      className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground">
                          {qa.code} – {qa.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {met}/{qa.standards.length} standards met · {qa.evidence.length} evidence items · updated{" "}
                          {formatShort(addDays(now.today, -qa.updatedDaysAgo))} · {staffById[qa.responsibleId].name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={qa.status === "Complete" ? "success" : "warning"}>{qa.status}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-lg font-bold text-foreground">Required documentation checklist</h2>
                <p className="text-xs text-muted-foreground">
                  {documentsCurrent} of {requiredDocuments.length} current
                </p>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold" />
                    <th className="pb-3 font-semibold">Document</th>
                    <th className="pb-3 font-semibold">Regulation</th>
                    <th className="pb-3 font-semibold">Owner</th>
                    <th className="pb-3 font-semibold">Last reviewed</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredDocuments.map((doc) => {
                    const status = documentStatus(doc);
                    return (
                      <tr key={doc.name} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-2">
                          {status === "Current" ? (
                            <Check className="h-4 w-4 text-success-foreground" />
                          ) : status === "Missing" ? (
                            <X className="h-4 w-4 text-danger-foreground" />
                          ) : (
                            <CircleAlert className="h-4 w-4 text-warning-foreground" />
                          )}
                        </td>
                        <td className="py-2.5 font-medium text-foreground">{doc.name}</td>
                        <td className="py-2.5 text-muted-foreground">{doc.regulation}</td>
                        <td className="py-2.5 text-foreground">{staffById[doc.ownerId].displayName}</td>
                        <td className="py-2.5 text-foreground">
                          {doc.missing ? "—" : formatShort(addDays(now.today, -doc.reviewedDaysAgo))}
                        </td>
                        <td className="py-2.5">
                          <Badge variant={documentVariant[status]}>{status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-lg font-bold text-foreground">Staff compliance alerts</h2>
                <button
                  type="button"
                  onClick={() => setShowAllStaff((prev) => !prev)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {showAllStaff ? "Show alerts only" : `View all staff (${staff.length})`}
                </button>
              </div>
              <div className={cn("space-y-1", showAllStaff && "max-h-[420px] overflow-y-auto pr-1")}>
                {listed.map((entry) => {
                  const sent = reminded.includes(entry.member.id);
                  const worst = entry.worst;
                  return (
                    <div
                      key={entry.member.id}
                      className="flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 hover:bg-muted"
                    >
                      <button
                        type="button"
                        onClick={() => setMember(entry.member)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate font-semibold text-foreground">
                          {entry.member.displayName}
                          {entry.status !== "Current" && worst && ` – ${worst.name.split(" (")[0]}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.status === "Current" || !worst || worst.expiresIn === null
                            ? `${entry.member.role} · all certificates current`
                            : worst.expiresIn < 0
                              ? `Expired ${formatShort(addDays(now.today, worst.expiresIn))}`
                              : `Expires ${formatShort(addDays(now.today, worst.expiresIn))}`}
                        </p>
                      </button>
                      <Badge variant={statusVariantFor[entry.status]} className="shrink-0">
                        {entry.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        aria-label={sent ? "Reminder sent" : `Send reminder to ${entry.member.displayName}`}
                        title={sent ? "Reminder sent" : "Send reminder"}
                        disabled={sent}
                        onClick={() => remind(entry.member)}
                      >
                        {sent ? <Check className="h-4 w-4 text-success-foreground" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Select a staff member for their full compliance profile.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Generate operational report</h2>
              <ReportGenerator now={now} onGenerated={handleGenerated} onView={setPreview} />
            </Card>

            {recent.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Recent reports</h2>
                <ul className="space-y-2">
                  {recent.map((report) => (
                    <li key={report.reference}>
                      <button
                        type="button"
                        onClick={() => setPreview(report)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left hover:bg-muted"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">{report.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {report.reference} · {report.period}
                          </span>
                        </span>
                        <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>

      <QualityAreaDialog area={area} today={now.today} onClose={() => setArea(null)} />
      <StaffComplianceDialog
        key={member?.id ?? "none"}
        member={member}
        today={now.today}
        onClose={() => setMember(null)}
        reminded={member ? reminded.includes(member.id) : false}
        onRemind={remind}
      />
      <Dialog
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        size="sm"
        title="Generate report"
        description="Operational reports cover the whole centre for NQF / ACECQA audits."
      >
        <ReportGenerator
          now={now}
          onGenerated={handleGenerated}
          onView={(report) => {
            setGeneratorOpen(false);
            setPreview(report);
          }}
        />
      </Dialog>
      <ReportPreviewDialog report={preview} onClose={() => setPreview(null)} />
    </>
  );
}

export default function ComplianceReportingPage() {
  const now = useNow();
  if (!now) {
    return (
      <>
        <PageHeader title="Compliance & Reporting" />
        <p className="px-8 py-10 text-sm text-muted-foreground">Loading compliance data…</p>
      </>
    );
  }
  return <ComplianceContent now={now} />;
}
