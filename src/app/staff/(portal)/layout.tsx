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
import { useEnquiries } from "@/components/shared/enquiry-store";
import { StaffProfileProvider, useStaffProfile } from "@/components/staff/staff-profile-store";
import { currentStaffUser } from "@/data/mock-data";
import { initialsOf } from "@/lib/utils";

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
  { href: "/staff/profile", label: "Settings", icon: Settings, matchPrefix: true },
];

function StaffPortalShell({ children }: { children: ReactNode }) {
  const { resetDemo } = useEnquiries();
  const { profile, resetStaffProfile } = useStaffProfile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={navItems}
        footerItems={footerItems}
        onResetDemo={() => {
          resetDemo();
          resetStaffProfile();
        }}
        user={{ ...currentStaffUser, name: profile.name, initials: initialsOf(profile.name) }}
        userHref="/staff/profile"
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function StaffPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StaffProfileProvider>
      <StaffPortalShell>{children}</StaffPortalShell>
    </StaffProfileProvider>
  );
}
