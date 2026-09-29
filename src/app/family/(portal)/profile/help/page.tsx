"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, Phone, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import { centreDetails } from "@/data/centre";
import { helpCentreFaqs } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function HelpCentrePage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(helpCentreFaqs[0].items[0].question);
  const term = query.trim().toLowerCase();

  const groups = helpCentreFaqs
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !term ||
          item.question.toLowerCase().includes(term) ||
          item.answer.toLowerCase().includes(term),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <ProfileSubpage title="Help Centre" description="Answers to common questions">
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search help articles (e.g. CCS, absence, pick-up)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.category}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.category}
            </p>
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {group.items.map((item) => {
                const expanded = open === item.question || Boolean(term);
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(open === item.question ? null : item.question)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-muted"
                    >
                      <span className="text-sm font-semibold text-foreground">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                    {expanded && (
                      <p className="px-4 pb-4 text-sm text-muted-foreground">{item.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No articles match &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>

      <Card className="mt-8 p-5">
        <h2 className="font-heading text-lg font-bold text-foreground">Still need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Our front desk is available {centreDetails.hours}.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a href={`tel:${centreDetails.phone.replace(/\D/g, "")}`} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <Phone className="h-4 w-4" /> {centreDetails.phone}
          </a>
          <a href={`mailto:${centreDetails.email}`} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <Mail className="h-4 w-4" /> Email us
          </a>
          <Link href="/family/enquiry" className={buttonVariants()}>
            Send an enquiry
          </Link>
        </div>
      </Card>
    </ProfileSubpage>
  );
}
