"use client";

import { Bell, Mail, MessageSquare, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFamilyStore } from "@/components/family/family-store";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import {
  notificationCategories,
  type NotificationCategoryId,
  type NotificationChannel,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const channels: { id: NotificationChannel; label: string; icon: LucideIcon }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "push", label: "Push", icon: Bell },
];

const channelName: Record<NotificationChannel, string> = { email: "Email", sms: "SMS", push: "Push" };

export default function NotificationPreferencesPage() {
  const { profile, updateProfile } = useFamilyStore();
  const { toast } = useToast();

  function toggle(category: NotificationCategoryId, channel: NotificationChannel) {
    const current = profile.preferences[category];
    const enabled = !current.includes(channel);
    const next = enabled ? [...current, channel] : current.filter((entry) => entry !== channel);
    updateProfile({ preferences: { ...profile.preferences, [category]: next } });
    const label = notificationCategories.find((entry) => entry.id === category)?.label ?? category;
    toast({
      title: "Preferences saved",
      description: `${label}: ${channelName[channel]} ${enabled ? "on" : "off"}.`,
      duration: 2500,
    });
  }

  return (
    <ProfileSubpage
      title="Notification Preferences"
      description="Choose how we contact you about each type of update"
    >
      <Card className="divide-y divide-border overflow-hidden">
        <div className="hidden grid-cols-[1fr_repeat(3,72px)] items-center gap-2 bg-muted/60 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
          <span>Notification type</span>
          {channels.map((channel) => (
            <span key={channel.id} className="text-center">
              {channel.label}
            </span>
          ))}
        </div>
        {notificationCategories.map((category) => {
          const selected = profile.preferences[category.id];
          return (
            <div
              key={category.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_repeat(3,72px)] sm:items-center sm:gap-2"
            >
              <div>
                <p className="font-semibold text-foreground">{category.label}</p>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                {selected.length === 0 && (
                  <p className="mt-1 text-xs font-medium text-warning-foreground">
                    Muted — you&apos;ll only see these in the portal.
                  </p>
                )}
              </div>
              <div className="flex gap-2 sm:contents">
                {channels.map((channel) => {
                  const on = selected.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${category.label} via ${channel.label}`}
                      onClick={() => toggle(category.id, channel.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors sm:mx-auto sm:h-10 sm:w-14 sm:flex-none sm:px-0",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <channel.icon className="h-4 w-4" />
                      <span className="sm:hidden">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        SMS alerts are sent to {profile.phone}. Emails go to {profile.email}. Urgent health and
        safety alerts are always sent by phone call as well.
      </p>
    </ProfileSubpage>
  );
}
