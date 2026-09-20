import Link from "next/link";
import { AlertCircle, Calendar, ImageIcon, ShieldCheck, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { familyNotifications, type FamilyNotification } from "@/data/mock-data";
import { cn } from "@/lib/utils";

const iconByType: Record<
  FamilyNotification["icon"],
  { icon: LucideIcon; className: string }
> = {
  invoice: { icon: Calendar, className: "bg-accent/15 text-accent" },
  portfolio: { icon: ImageIcon, className: "bg-success text-success-foreground" },
  notice: { icon: ShieldCheck, className: "bg-muted text-foreground" },
  alert: { icon: AlertCircle, className: "bg-muted text-foreground" },
};

function NotificationCard({ item }: { item: FamilyNotification }) {
  const { icon: Icon, className } = iconByType[item.icon];

  const content = (
    <Card className="flex gap-4 p-4">
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
          {item.unread && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
      </div>
    </Card>
  );

  return item.link ? <Link href={item.link}>{content}</Link> : content;
}

export default function NotificationsPage() {
  return (
    <>
      <MobilePageHeader title="Notifications" backHref="/family" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Notifications
        </h1>

        <div className="space-y-8">
          {familyNotifications.map((group) => (
            <div key={group.group}>
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.group}
              </p>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <NotificationCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
