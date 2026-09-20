import Link from "next/link";
import { Compass, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10" />

      <div className="relative mb-6 flex items-center gap-2 text-primary">
        <ShieldCheck className="h-6 w-6" />
        <span className="font-heading text-lg font-bold">Little Explorer</span>
      </div>

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
      </div>

      <h1 className="relative mt-6 font-heading text-4xl font-extrabold text-foreground">
        Page not found
      </h1>
      <p className="relative mt-3 max-w-sm text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have moved,
        or the link might be out of date.
      </p>

      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "relative mt-8")}
      >
        Back to home
      </Link>
    </main>
  );
}
