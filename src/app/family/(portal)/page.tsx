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

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import {
  currentFamilyUser,
  familyBilling,
  familyChildren,
  hasUnreadNotifications,
  learningPortfolio,
  todayLabel,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const ava = familyChildren[0];
const latestObservation = learningPortfolio[0];

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  message?: string;
}

export default function FamilyHomePage() {
  const [message, setMessage] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    { label: "New Enquiry", icon: CirclePlus, href: "/family/enquiry" },
    {
      label: "Confirm Pickup",
      icon: Check,
      message: "Pickup confirmed for Ava today.",
    },
    {
      label: "Give Feedback",
      icon: Star,
      message: "Thanks for your feedback!",
    },
  ];

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:hidden">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon</p>
          <h1 className="font-heading text-xl font-bold text-foreground">
            Hi, Sarah
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/family/notifications"
            aria-label="Notifications"
            className="relative text-foreground"
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>
          <Link
            href="/family/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-sm font-bold text-success-foreground"
          >
            {currentFamilyUser.initials}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-8 hidden md:block">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Good afternoon, Sarah
          </h1>
          <p className="mt-1 text-muted-foreground">{todayLabel}</p>
        </div>

        {message && (
          <FakeSuccessBanner
            message={message}
            onDismiss={() => setMessage(null)}
            className="mb-6"
          />
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 font-heading text-lg font-bold text-accent">
                  A
                </div>
                <div>
                  <p className="font-semibold text-foreground">{ava.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Room: {ava.room}
                  </p>
                </div>
              </div>
              <Badge variant="success" className="shrink-0">
                Checked in · {ava.checkedInAt}
              </Badge>
            </Card>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Today&apos;s portfolio update
                </h2>
                <Link
                  href="/family/my-child"
                  className="text-sm font-semibold text-primary"
                >
                  View all
                </Link>
              </div>
              <Card className="flex gap-4 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground">
                    &ldquo;{latestObservation.note}&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {latestObservation.author} · {ava.room}
                  </p>
                </div>
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
                  <p className="text-sm text-primary-foreground/70">
                    Current balance
                  </p>
                  <p className="font-heading text-3xl font-bold">
                    ${familyBilling.currentBalance.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={() =>
                      setMessage("Payment received — thank you!")
                    }
                  >
                    Pay Now
                  </Button>
                  <Link
                    href="/family/billing"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "flex-1 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10",
                    )}
                  >
                    View Invoice
                  </Link>
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
                    <Card className="flex flex-col items-center gap-2 p-4 text-center transition-colors hover:bg-muted md:flex-row md:justify-start md:gap-3 md:text-left">
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
                      onClick={() => setMessage(action.message ?? null)}
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
    </>
  );
}
