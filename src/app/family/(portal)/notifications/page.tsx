"use client";

import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CircleDollarSign,
  ImageIcon,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFamilyStore } from "@/components/family/family-store";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { familyNotifications, type FamilyNotification } from "@/data/mock-data";
import { formatLong, fromKey, toKey } from "@/lib/dates";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const iconByType: Record<
  FamilyNotification["icon"],
  { icon: LucideIcon; className: string }
> = {
  invoice: { icon: Calendar, className: "bg-accent/15 text-accent" },
  payment: { icon: CircleDollarSign, className: "bg-success text-success-foreground" },
  portfolio: { icon: ImageIcon, className: "bg-success text-success-foreground" },
  notice: { icon: ShieldCheck, className: "bg-muted text-foreground" },
  alert: { icon: AlertCircle, className: "bg-muted text-foreground" },
};

function NotificationCard({ item }: { item: FamilyNotification }) {
  const { isUnread, markRead } = useFamilyStore();
  const { icon: Icon, className } = iconByType[item.icon];
  const unread = isUnread(item);

  const content = (
    <Card
      className={cn(
        "flex gap-4 p-4 transition-colors",
        item.link && "hover:bg-muted",
        unread && "border-accent/40",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          className,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-foreground">{item.title}</p>
          {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
      </div>
    </Card>
  );

  return item.link ? (
    <Link href={item.link} onClick={() => markRead(item.id)} className="block">
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => markRead(item.id)} className="block w-full text-left">
      {content}
    </button>
  );
}

export default function NotificationsPage() {
  const { notifications, markAllRead, hasUnread } = useFamilyStore();
  const today = useToday();
  const todayKey = today ? toKey(today) : null;

  // Session notifications (e.g. payment receipts) go on top of "Today";
  // anything created on an earlier day gets its own dated group.
  const fresh = notifications.filter((item) => item.date === todayKey);
  const older = notifications.filter((item) => item.date !== todayKey);
  const olderGroups = [...new Set(older.map((item) => item.date))].map((date) => ({
    group: formatLong(fromKey(date)),
    items: older.filter((item) => item.date === date),
  }));

  const groups = familyNotifications.map((group) =>
    group.group === "Today" ? { ...group, items: [...fresh, ...group.items] } : group,
  );

  return (
    <>
      <MobilePageHeader title="Notifications" backHref="/family" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="hidden font-heading text-3xl font-bold text-foreground md:block">
            Notifications
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={!hasUnread}
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>

        <div className="space-y-8">
          {[...groups, ...olderGroups].map((group) => (
            <div key={group.group}>
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.group}
              </p>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
