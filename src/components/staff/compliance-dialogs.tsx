"use client";

import { useState } from "react";
import { Check, Circle, FileText, Image as ImageIcon, Send, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { staffById, type StaffMember } from "@/data/centre";
import {
  certStatus,
  renewalHistory,
  staffComplianceSummary,
  statusVariantFor,
  type QualityArea,
} from "@/data/compliance";
import { addDays, formatShort, fromKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function QualityAreaDialog({
  area,
  today,
  onClose,
}: {
  area: QualityArea | null;
  today: Date;
  onClose: () => void;
}) {
  const { toast } = useToast();
  if (!area) return null;
  const met = area.standards.filter((standard) => standard.met).length;
  const responsible = staffById[area.responsibleId];

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={`${area.code} – ${area.title}`}
      description="National Quality Standard · documentation & evidence"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Upload evidence",
                description: "In the real system this opens the document uploader (demo only).",
                variant: "info",
              })
            }
          >
            Upload evidence
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={area.status === "Complete" ? "success" : "warning"}>{area.status}</Badge>
          <span className="text-sm text-muted-foreground">
            {met} of {area.standards.length} standards met
          </span>
        </div>
        <p className="text-sm text-foreground">{area.summary}</p>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Responsible</dt>
            <dd className="font-semibold text-foreground">{responsible.name}</dd>
            <dd className="text-xs text-muted-foreground">{responsible.role}</dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Last updated</dt>
            <dd className="font-semibold text-foreground">{formatShort(addDays(today, -area.updatedDaysAgo))}</dd>
            <dd className="text-xs text-muted-foreground">
              {area.updatedDaysAgo === 0 ? "Today" : `${area.updatedDaysAgo} days ago`}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 font-heading text-base font-bold text-foreground">Standards</h3>
          <ul className="space-y-2">
            {area.standards.map((standard) => (
              <li key={standard.code} className="flex items-center gap-2 text-sm">
                {standard.met ? (
                  <Check className="h-4 w-4 text-success-foreground" />
                ) : (
                  <Circle className="h-4 w-4 text-warning-foreground" />
                )}
                <span className="font-semibold text-foreground">{standard.code}</span>
                <span className="text-foreground">{standard.title}</span>
                {!standard.met && <Badge variant="warning" className="ml-auto">Working towards</Badge>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-heading text-base font-bold text-foreground">
            Evidence uploaded ({area.evidence.length})
          </h3>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {area.evidence.map((item) => (
              <li key={item.name} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                {item.kind === "Photo" ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.kind} · {item.uploadedBy} · {formatShort(addDays(today, -item.daysAgo))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {area.nextAction && (
          <p className="rounded-xl border border-warning-foreground/20 bg-warning px-4 py-3 text-sm text-warning-foreground">
            <span className="font-semibold">Next action: </span>
            {area.nextAction}
          </p>
        )}
      </div>
    </Dialog>
  );
}

export function StaffComplianceDialog({
  member,
  today,
  onClose,
  reminded,
  onRemind,
}: {
  member: StaffMember | null;
  today: Date;
  onClose: () => void;
  reminded: boolean;
  onRemind: (member: StaffMember) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!member) return null;
  const summary = staffComplianceSummary(member);

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={member.name}
      description={`${member.role}${member.room ? ` · ${member.room}` : ""} · started ${formatShort(fromKey(member.startDate))}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="gap-2" disabled={reminded} onClick={() => onRemind(member)}>
            {reminded ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {reminded ? "Reminder sent" : "Send reminder"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={statusVariantFor[summary.status]}>
            {summary.status === "Current" ? "Fully compliant" : summary.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {summary.issues === 0
              ? "All certifications are current."
              : `${summary.issues} certification${summary.issues > 1 ? "s need" : " needs"} attention.`}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Employment</dt>
            <dd className="font-semibold text-foreground">{member.employment}</dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="truncate font-semibold text-foreground">{member.email}</dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd className="font-semibold text-foreground">{member.phone}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 font-heading text-base font-bold text-foreground">Certifications</h3>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {summary.certs.map((cert) => {
              const status = certStatus(cert);
              const history = renewalHistory(cert, today);
              const open = expanded === cert.name;
              return (
                <li key={cert.name} className="px-3 py-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : cert.name)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                    disabled={history.length === 0}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">{cert.detail}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          status === "Current" ? "text-muted-foreground" : "font-semibold text-danger-foreground",
                        )}
                      >
                        {cert.expiresIn === null
                          ? "No expiry · verified on file"
                          : cert.expiresIn < 0
                            ? `Expired ${formatShort(addDays(today, cert.expiresIn))} (${-cert.expiresIn} days ago)`
                            : `Expires ${formatShort(addDays(today, cert.expiresIn))} (in ${cert.expiresIn} days)`}
                      </p>
                    </div>
                    <Badge variant={statusVariantFor[status]}>{status}</Badge>
                  </button>
                  {open && (
                    <ol className="mt-3 space-y-1 border-l-2 border-border pl-3 text-xs">
                      {history.map((entry) => (
                        <li key={entry.date} className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{entry.date}</span> · {entry.event}
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Select a certification to see its renewal history.</p>
        </div>

        {summary.status !== "Current" && (
          <p className="flex gap-2 rounded-xl border border-danger-foreground/20 bg-danger px-4 py-3 text-sm text-danger-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Staff can&apos;t be rostered once a WWCC or first aid certificate expires (Reg 136 & 145).
          </p>
        )}
      </div>
    </Dialog>
  );
}
