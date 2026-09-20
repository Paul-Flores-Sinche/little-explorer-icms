import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentStaffUser } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <div className="relative hidden overflow-hidden bg-primary px-16 py-16 text-primary-foreground md:flex md:w-[46%] md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-black/10" />

        <div className="relative flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-heading text-lg font-bold">
            Little Explorer
          </span>
        </div>

        <div className="relative">
          <h1 className="font-heading text-4xl font-bold">
            Integrated Childcare
            <br />
            Management System
          </h1>
          <p className="mt-4 max-w-sm text-primary-foreground/80">
            One centralised platform for enrolments, attendance,
            programming, CCS &amp; payments, staffing and compliance.
          </p>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          National Quality Framework aligned · Role-based access
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-background px-6 py-12 sm:px-10 md:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <h1 className="font-heading text-3xl font-extrabold text-foreground md:text-4xl">
            Staff sign in
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access your Administration, Educator, Finance or Director
            workspace.
          </p>

          <div className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={currentStaffUser.email}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <Input id="password" type="password" defaultValue="password123" />
              <div className="flex justify-end pt-1">
                <span className="cursor-default text-sm font-semibold text-primary">
                  Forgot your password?
                </span>
              </div>
            </div>

            <Link
              href="/staff"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Sign In
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Role-based access ensures you only see the records relevant to
            you.
          </p>
        </div>
      </div>
    </div>
  );
}
