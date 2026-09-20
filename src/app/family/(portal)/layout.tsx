"use client";

import type { ReactNode } from "react";
import { Bell, CreditCard, Home, User, UserRound } from "lucide-react";

import { BottomNav, type NavItem } from "@/components/bottom-nav";
import { FamilyTopNav } from "@/components/family/top-nav";

const bottomNavItems: NavItem[] = [
  { href: "/family", label: "Home", icon: Home },
  { href: "/family/my-child", label: "My Child", icon: User },
  { href: "/family/billing", label: "Billing", icon: CreditCard },
  { href: "/family/notifications", label: "Alerts", icon: Bell },
  { href: "/family/profile", label: "Profile", icon: UserRound },
];

export default function FamilyPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <FamilyTopNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav items={bottomNavItems} />
    </div>
  );
}
