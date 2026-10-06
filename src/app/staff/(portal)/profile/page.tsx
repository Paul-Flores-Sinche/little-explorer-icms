"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Pencil, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/staff/page-header";
import { useStaffProfile } from "@/components/staff/staff-profile-store";
import { staffById } from "@/data/centre";
import { certStatus, staffComplianceSummary, statusVariantFor } from "@/data/compliance";
import { currentStaffId, staffNotificationCategories } from "@/data/mock-data";
import { addDays, formatShort, fromKey } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { cn, initialsOf } from "@/lib/utils";

const member = staffById[currentStaffId];

function ProfileRow({
  label,
  value,
  href,
  control,
}: {
  label: string;
  value?: string;
  href?: string;
  control?: ReactNode;
}) {
  const content = (
    <>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {control ?? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {value}
          {href && <ChevronRight className="h-4 w-4" />}
        </span>
      )}
    </>
  );

  const className = "flex items-center justify-between gap-4 px-5 py-4";
  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:bg-muted")}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>
      {action}
    </div>
  );
}

export default function StaffProfilePage() {
  const { profile, updateProfile } = useStaffProfile();
  const { toast } = useToast();
  const now = useNow();

  const summary = staffComplianceSummary(member);
  const channelsOn = staffNotificationCategories.filter((category) => profile.preferences[category.id].length > 0).length;

  function handleFaceId(enabled: boolean) {
    updateProfile({ faceId: enabled });
    toast({
      title: enabled ? "Face ID login turned on" : "Face ID login turned off",
      description: enabled
        ? "You can now sign in to the ICMS with Face ID on this device."
        : "You'll need your password to sign in.",
    });
  }

  const details = [
    { label: "Full name", value: profile.name },
    { label: "Role", value: member.role },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Start date", value: formatShort(fromKey(member.startDate)) },
    { label: "Employment", value: member.employment },
  ];

  return (
    <>
      <PageHeader title="Profile & Settings" subtitle="Your ICMS staff account" />

      <div className="mx-auto max-w-5xl px-8 py-6">
        <div className="flex gap-10">
          <div className="flex w-56 shrink-0 flex-col items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success font-heading text-3xl font-bold text-success-foreground">
              {initialsOf(profile.name)}
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            <p className="mt-1 text-sm break-all text-muted-foreground">{profile.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => toast({ title: "Photo updated", description: "Your new profile photo is saved." })}
            >
              Change Photo
            </Button>
          </div>

          <div className="min-w-0 flex-1 space-y-8">
            <section>
              <SectionTitle
                action={
                  <Link
                    href="/staff/profile/personal-details"
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit details
                  </Link>
                }
              >
                Account
              </SectionTitle>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-5">
                  {details.map((detail) => (
                    <div key={detail.label} className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{detail.label}</dt>
                      <dd className="truncate text-sm font-semibold text-foreground">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t border-border">
                  <ProfileRow label="Change Password" href="/staff/profile/change-password" />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle
                action={
                  <Badge variant={statusVariantFor[summary.status]}>
                    {summary.status === "Current" ? "Fully compliant" : summary.status}
                  </Badge>
                }
              >
                My Certifications
              </SectionTitle>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {summary.certs.map((cert) => {
                  const status = certStatus(cert);
                  return (
                    <li key={cert.name} className="flex items-start justify-between gap-3 px-5 py-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.detail}</p>
                        {now && (
                          <p
                            className={cn(
                              "mt-1 text-xs",
                              status === "Current" ? "text-muted-foreground" : "font-semibold text-danger-foreground",
                            )}
                          >
                            {cert.expiresIn === null
                              ? "No expiry · verified on file"
                              : cert.expiresIn < 0
                                ? `Expired ${formatShort(addDays(now.today, cert.expiresIn))} (${-cert.expiresIn} days ago)`
                                : `Expires ${formatShort(addDays(now.today, cert.expiresIn))} (in ${cert.expiresIn} days)`}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusVariantFor[status]} className="shrink-0">
                        {status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
              {summary.status !== "Current" && (
                <p className="mt-3 flex gap-2 rounded-xl border border-danger-foreground/20 bg-danger px-4 py-3 text-sm text-danger-foreground">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Renew certifications before they lapse to stay rostered under Regulations 145–147.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Certificates are verified by the Centre Director. See{" "}
                <Link href="/staff/compliance-reporting" className="font-semibold text-primary hover:underline">
                  Compliance &amp; Reporting
                </Link>{" "}
                for the whole team.
              </p>
            </section>

            <section>
              <SectionTitle>Preferences</SectionTitle>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                <ProfileRow
                  label="Notification Preferences"
                  value={`${channelsOn} of ${staffNotificationCategories.length} on`}
                  href="/staff/profile/notification-preferences"
                />
                <ProfileRow
                  label="Face ID Login"
                  control={
                    <Switch checked={profile.faceId} onCheckedChange={handleFaceId} aria-label="Face ID Login" />
                  }
                />
              </div>
            </section>

            <Link href="/staff/login" className={cn(buttonVariants({ variant: "destructive" }), "w-full")}>
              Log Out
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
