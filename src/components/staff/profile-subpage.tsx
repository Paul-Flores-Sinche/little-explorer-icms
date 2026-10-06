import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/staff/page-header";

interface StaffProfileSubpageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Shared frame for the staff Profile & Settings sub-screens (breadcrumb + header). */
export function StaffProfileSubpage({ title, description, children }: StaffProfileSubpageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <div className="mx-auto max-w-3xl px-8 py-6">
        <nav className="mb-5 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/staff/profile" className="hover:text-foreground">
            Profile &amp; Settings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{title}</span>
        </nav>
        {children}
      </div>
    </>
  );
}
