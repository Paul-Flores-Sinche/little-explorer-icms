"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { currentFamilyUser, hasUnreadNotifications } from "@/data/mock-data";

const links = [
  { href: "/family", label: "Home" },
  { href: "/family/my-child", label: "My Child" },
  { href: "/family/billing", label: "Billing" },
  { href: "/family/notifications", label: "Notifications" },
];

export function FamilyTopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden items-center justify-between border-b border-border bg-card px-8 py-4 md:flex">
      <div className="flex items-center gap-10">
        <Link href="/family" className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-heading text-lg font-bold">
            Little Explorer
          </span>
        </Link>
        <nav className="flex items-center gap-7">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-5">
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
        <Link href="/family/profile" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-xs font-bold text-success-foreground">
            {currentFamilyUser.initials}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {currentFamilyUser.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
