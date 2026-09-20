import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentFamilyUser } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function FamilyLoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-background px-6 py-12 sm:px-10 md:px-20">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 md:hidden" />

        <div className="relative mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-heading text-lg font-bold">
              Little Explorer
            </span>
          </div>

          <div className="md:hidden">
            <h1 className="font-heading text-3xl font-extrabold text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Log in to your Family Portal to see Ava&apos;s day.
            </p>
          </div>
          <div className="hidden md:block">
            <h1 className="font-heading text-4xl font-extrabold text-foreground">
              Family Portal
            </h1>
            <p className="mt-2 text-muted-foreground">
              Log in to see your child&apos;s day, anywhere — phone, tablet or
              computer.
            </p>
          </div>

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
                defaultValue={currentFamilyUser.email}
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
              href="/family"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Log In
            </Link>
          </div>

          <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            New to Little Explorer?
            <span className="h-px flex-1 bg-border" />
          </div>

          <Link
            href="/family/enquiry"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full",
            )}
          >
            Start an Enquiry
          </Link>

          <p className="mt-10 text-center text-sm text-muted-foreground md:hidden">
            By continuing you agree to the Centre&apos;s Privacy Policy.
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary px-16 py-16 text-primary-foreground md:flex md:w-[42%] md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -top-10 right-0 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-black/10" />
        <div className="relative mt-24">
          <h2 className="font-heading text-4xl font-bold">
            See Ava&apos;s day, wherever you are.
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/80">
            Attendance, learning portfolio, notices and billing — the same
            Family Portal on your phone or your computer.
          </p>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          Little Explorer Early Learning Centre
        </p>
      </div>
    </div>
  );
}
