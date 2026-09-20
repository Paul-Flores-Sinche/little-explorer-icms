"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { currentFamilyUser, familyProfile } from "@/data/mock-data";
import { cn } from "@/lib/utils";

function ProfileRow({
  label,
  value,
  chevron,
  control,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
  control?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {control ?? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {value}
          {chevron && <ChevronRight className="h-4 w-4" />}
        </span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [faceId, setFaceId] = useState(familyProfile.faceIdLogin);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <MobilePageHeader title="Profile & Settings" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Profile &amp; Settings
        </h1>

        {message && (
          <FakeSuccessBanner
            message={message}
            onDismiss={() => setMessage(null)}
            className="mb-6"
          />
        )}

        <div className="md:flex md:gap-10">
          <div className="mb-8 flex flex-col items-center text-center md:mb-0 md:w-56 md:shrink-0 md:items-start md:text-left">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success font-heading text-2xl font-bold text-success-foreground">
              {currentFamilyUser.initials}
            </div>
            <p className="mt-4 font-semibold text-foreground">
              {familyProfile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {familyProfile.email}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setMessage("Photo updated.")}
            >
              Change Photo
            </Button>
          </div>

          <div className="flex-1 space-y-8">
            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Account
              </p>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                <ProfileRow label="Personal Details" chevron />
                <ProfileRow
                  label="Linked Children"
                  value={familyProfile.linkedChildren.join(", ")}
                />
                <ProfileRow label="Payment Methods" chevron />
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Preferences
              </p>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                <ProfileRow label="Notification Preferences" chevron />
                <ProfileRow
                  label="Face ID Login"
                  control={
                    <Switch
                      checked={faceId}
                      onCheckedChange={setFaceId}
                      aria-label="Face ID Login"
                    />
                  }
                />
                <ProfileRow label="Change Password" chevron />
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Support
              </p>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                <ProfileRow label="Give Feedback" chevron />
                <ProfileRow label="Help Centre" chevron />
              </div>
            </section>

            <Link
              href="/family/login"
              className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
            >
              Log Out
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
