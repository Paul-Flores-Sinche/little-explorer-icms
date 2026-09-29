"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Check,
  CirclePlus,
  ImageIcon,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFamilyStore } from "@/components/family/family-store";
import { usePayment } from "@/components/family/payment/payment-context";
import { PaymentSheet } from "@/components/family/payment/payment-sheet";
import { InvoicePreviewDialog } from "@/components/shared/invoice-preview";
import { useEnquiries } from "@/components/shared/enquiry-store";
import { ava, getAttendance, getObservations } from "@/data/centre";
import { familyInvoiceDocument } from "@/data/invoices";
import { familyBilling } from "@/data/mock-data";
import { addDays, formatLong, formatTime } from "@/lib/dates";
import type { InvoiceDocument } from "@/lib/documents";
import { useNow, type Now } from "@/lib/use-now";
import { initialsOf } from "@/lib/utils";

const CURRENT_FAMILY = "Thompson";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

function greetingFor(minutes: number | undefined) {
  if (minutes === undefined) return "Hello";
  if (minutes < 12 * 60) return "Good morning";
  if (minutes < 17 * 60) return "Good afternoon";
  return "Good evening";
}

function avaStatus(now: Now | null): { label: string; variant: BadgeProps["variant"] } {
  if (!now) return { label: "Loading…", variant: "neutral" };
  const record = getAttendance(ava, now.today, now);
  switch (record.status) {
    case "Present":
      return { label: `Checked in · ${formatTime(record.checkIn ?? 0)}`, variant: "success" };
    case "Checked out":
      return { label: `Picked up · ${formatTime(record.checkOut ?? 0)}`, variant: "info" };
    case "Not checked in":
      return { label: "Not checked in yet", variant: "warning" };
    case "Absent – notified":
      return { label: "Absent today", variant: "neutral" };
    case "Closed":
      return { label: "Centre closed today", variant: "neutral" };
    default:
      return { label: "Not booked today", variant: "neutral" };
  }
}

function latestObservation(now: Now | null) {
  if (!now) return null;
  for (let offset = 0; offset < 14; offset += 1) {
    const observations = getObservations(ava, addDays(now.today, -offset), now);
    if (observations.length > 0) return observations[observations.length - 1];
  }
  return null;
}

export default function FamilyHomePage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [preview, setPreview] = useState<InvoiceDocument | null>(null);
  const { balance, invoices, markPaid } = usePayment();
  const { profile, hasUnread: hasUnreadNotifications } = useFamilyStore();
  const { enquiries } = useEnquiries();
  const { toast } = useToast();
  const now = useNow();
  const hasUnread =
    hasUnreadNotifications ||
    enquiries.some((enquiry) => enquiry.family === CURRENT_FAMILY && enquiry.familyUnread);

  const firstName = profile.name.split(" ")[0];
  const greeting = greetingFor(now?.minutes);
  const status = avaStatus(now);
  const observation = latestObservation(now);

  const quickActions: QuickAction[] = [
    { label: "New Enquiry", icon: CirclePlus, href: "/family/enquiry" },
    {
      label: "Confirm Pickup",
      icon: Check,
      onClick: () =>
        toast({
          title: "Pickup confirmed",
          description: `The Kindergarten team knows you're collecting Ava today.`,
        }),
    },
    { label: "Give Feedback", icon: Star, href: "/family/profile/feedback" },
  ];

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:hidden">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-heading text-xl font-bold text-foreground">Hi, {firstName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/family/notifications"
            aria-label="Notifications"
            className="relative text-foreground"
          >
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>
          <Link
            href="/family/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-sm font-bold text-success-foreground"
          >
            {initialsOf(profile.name)}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-8 hidden md:block">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">{now ? formatLong(now.today) : " "}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Link href="/family/my-child" className="block">
              <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 font-heading text-lg font-bold text-accent">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{ava.name}</p>
                    <p className="text-sm text-muted-foreground">Room: {ava.room}</p>
                  </div>
                </div>
                <Badge variant={status.variant} className="shrink-0">
                  {status.label}
                </Badge>
              </Card>
            </Link>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Latest portfolio update
                </h2>
                <Link
                  href="/family/my-child?tab=portfolio"
                  className="text-sm font-semibold text-primary"
                >
                  View all
                </Link>
              </div>
              <Card className="flex gap-4 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                {observation ? (
                  <div>
                    <p className="font-semibold text-foreground">{observation.title}</p>
                    <p className="mt-1 text-foreground">&ldquo;{observation.note}&rdquo;</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {observation.author} · {ava.room} · {formatTime(observation.time)}
                    </p>
                  </div>
                ) : (
                  <p className="self-center text-sm text-muted-foreground">
                    {now ? "No observations posted yet." : "Loading…"}
                  </p>
                )}
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground md:hidden">
                Billing
              </h2>
              <Card className="space-y-4 border-none bg-primary p-5 text-primary-foreground">
                <div>
                  <p className="text-sm text-primary-foreground/70">Current balance</p>
                  <p className="font-heading text-3xl font-bold">${balance.toFixed(2)}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="accent"
                    className="flex-1"
                    disabled={balance <= 0}
                    onClick={() => setPaymentOpen(true)}
                  >
                    {balance <= 0 ? "Paid" : "Pay Now"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10"
                    onClick={() => setPreview(familyInvoiceDocument(invoices[0], profile))}
                  >
                    View Invoice
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
                Quick actions
              </h2>
              <div className="grid grid-cols-3 gap-3 md:flex md:flex-col">
                {quickActions.map((action) => {
                  const content = (
                    <Card className="flex h-full flex-col items-center gap-2 p-4 text-center transition-colors hover:bg-muted md:flex-row md:justify-start md:gap-3 md:text-left">
                      <action.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {action.label}
                      </span>
                    </Card>
                  );

                  if (action.href) {
                    return (
                      <Link key={action.label} href={action.href}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="text-left"
                      onClick={action.onClick}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentSheet
        open={paymentOpen}
        amount={familyBilling.currentBalance}
        onClose={() => setPaymentOpen(false)}
        onSuccess={markPaid}
      />
      <InvoicePreviewDialog invoice={preview} onClose={() => setPreview(null)} />
    </>
  );
}
