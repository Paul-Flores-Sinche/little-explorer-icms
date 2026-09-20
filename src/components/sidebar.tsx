"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarUser {
  name: string;
  role: string;
  initials: string;
}

interface SidebarProps {
  items: SidebarNavItem[];
  footerItems?: SidebarNavItem[];
  user: SidebarUser;
}

function SidebarLink({ href, label, icon: Icon }: SidebarNavItem) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white/10",
        active && "bg-white/15 font-semibold text-primary-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function Sidebar({ items, footerItems, user }: SidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-primary px-4 py-6 text-primary-foreground md:flex">
      <div className="flex items-center gap-2 px-2 pb-8">
        <ShieldCheck className="h-6 w-6" />
        <span className="font-heading text-lg font-bold">Little Explorer</span>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <SidebarLink {...item} />
            </li>
          ))}
        </ul>
      </nav>

      {footerItems && footerItems.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-white/10 pt-4">
          {footerItems.map((item) => (
            <li key={item.href}>
              <SidebarLink {...item} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 border-t border-white/10 pt-4 mt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-primary-foreground/70">
            {user.role}
          </p>
        </div>
      </div>
    </aside>
  );
}
