"use client";

import type { ReactNode } from "react";
import {
  ClipboardCheck,
  CircleDollarSign,
  Home,
  LayoutDashboard,
  Settings,
  SquareCheck,
  Users,
} from "lucide-react";

import { Sidebar, type SidebarNavItem } from "@/components/sidebar";
import { currentStaffUser } from "@/data/mock-data";

const navItems: SidebarNavItem[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/enrolments", label: "Enrolments & Bookings", icon: Home },
  { href: "/staff/attendance", label: "Attendance", icon: SquareCheck },
  { href: "/staff/ccs-payments", label: "CCS & Payments", icon: CircleDollarSign },
  { href: "/staff/staff-management", label: "Staff Management", icon: Users },
  {
    href: "/staff/compliance-reporting",
    label: "Compliance & Reporting",
    icon: ClipboardCheck,
  },
];

const footerItems: SidebarNavItem[] = [
  { href: "#", label: "Settings", icon: Settings },
];

export default function StaffPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={navItems} footerItems={footerItems} user={currentStaffUser} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
