import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  backHref,
}: MobilePageHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4 md:hidden">
      {backHref && (
        <Link href={backHref} aria-label="Back" className="text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
      )}
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
