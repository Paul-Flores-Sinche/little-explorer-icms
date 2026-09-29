"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Home, RefreshCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useFamilyStore } from "@/components/family/family-store";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { usePayment } from "@/components/family/payment/payment-context";
import { useEnquiries } from "@/components/shared/enquiry-store";
import { familyProfile } from "@/data/mock-data";
import { cn, initialsOf } from "@/lib/utils";

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

  const className = "flex items-center justify-between gap-4 px-4 py-4";
  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:bg-muted")}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function ProfilePage() {
  const { profile, updateProfile, resetFamilyDemo } = useFamilyStore();
  const { resetPayments } = usePayment();
  const { resetDemo } = useEnquiries();
  const { toast } = useToast();

  function handleResetDemo() {
    resetDemo();
    resetFamilyDemo();
    resetPayments();
    toast({ title: "Demo data has been reset", variant: "info" });
  }

  function handleFaceId(enabled: boolean) {
    updateProfile({ faceId: enabled });
    toast({
      title: enabled ? "Face ID login turned on" : "Face ID login turned off",
      description: enabled
        ? "You can now log in with Face ID on this device."
        : "You'll need your password to log in.",
    });
  }

  return (
    <>
      <MobilePageHeader title="Profile & Settings" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Profile &amp; Settings
        </h1>

        <div className="md:flex md:gap-10">
          <div className="mb-8 flex flex-col items-center text-center md:mb-0 md:w-56 md:shrink-0 md:items-start md:text-left">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success font-heading text-2xl font-bold text-success-foreground">
              {initialsOf(profile.name)}
            </div>
            <p className="mt-4 font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm break-all text-muted-foreground">{profile.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => toast({ title: "Photo updated", description: "Your new profile photo is saved." })}
            >
              Change Photo
            </Button>
          </div>

          <div className="flex-1 space-y-8">
            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Account
              </p>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                <ProfileRow label="Personal Details" href="/family/profile/personal-details" />
                <ProfileRow
                  label="Linked Children"
                  value={familyProfile.linkedChildren.join(", ")}
                  href="/family/profile/children"
                />
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Preferences
              </p>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                <ProfileRow
                  label="Notification Preferences"
                  href="/family/profile/notification-preferences"
                />
                <ProfileRow
                  label="Face ID Login"
                  control={
                    <Switch
                      checked={profile.faceId}
                      onCheckedChange={handleFaceId}
                      aria-label="Face ID Login"
                    />
                  }
                />
                <ProfileRow label="Change Password" href="/family/profile/change-password" />
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Support
              </p>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                <ProfileRow label="Give Feedback" href="/family/profile/feedback" />
                <ProfileRow label="Help Centre" href="/family/profile/help" />
              </div>
            </section>

            <Link
              href="/family/login"
              className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
            >
              Log Out
            </Link>

            <div className="flex items-center justify-center gap-5">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" />
                Back to home
              </Link>
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
