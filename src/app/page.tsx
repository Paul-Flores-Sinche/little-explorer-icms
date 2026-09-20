import Link from "next/link";
import { ArrowRight, Monitor, ShieldCheck, Smartphone } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="mb-6 inline-flex w-fit items-center gap-2 text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-heading text-base font-bold">
            Little Explorer Early Learning Centre
          </span>
        </div>

        <h1 className="font-heading text-4xl leading-tight font-extrabold text-foreground sm:text-5xl">
          Integrated Childcare
          <br />
          Management System
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Interactive prototype for PRT631, Group 13 — a Family Portal for
          parents and an ICMS staff app for educators and admin, all in one
          demo.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/family/login" className="group block">
            <Card className="flex h-full flex-col gap-4 p-6 transition-shadow group-hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Family Portal
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Home, enquiries &amp; waitlist, my child, billing,
                  notifications and profile — built for Sarah and Ava
                  Thompson.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open Family Portal <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>

          <Link href="/staff" className="group block">
            <Card className="flex h-full flex-col gap-4 p-6 transition-shadow group-hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Monitor className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Staff Portal
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dashboard, enrolments, attendance, CCS &amp; payments,
                  staff management and compliance — for Admin Officer Maria
                  Reyes.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Open Staff Portal <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
