import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { MobilePageHeader } from "@/components/family/mobile-page-header";

interface ProfileSubpageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Shared frame for Profile & Settings sub-screens (breadcrumb + back). */
export function ProfileSubpage({ title, description, children }: ProfileSubpageProps) {
  return (
    <>
      <MobilePageHeader title={title} subtitle={description} backHref="/family/profile" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <nav className="mb-2 hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <Link href="/family/profile" className="hover:text-foreground">
            Profile &amp; Settings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{title}</span>
        </nav>
        <div className="mb-6 hidden md:block">
          <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </>
  );
}
