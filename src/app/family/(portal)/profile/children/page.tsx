"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import { ava } from "@/data/centre";
import { familyChildren } from "@/data/mock-data";
import { WEEKDAYS_SHORT, formatAge, formatShort, fromKey } from "@/lib/dates";
import { useToday } from "@/lib/use-now";

export default function LinkedChildrenPage() {
  const today = useToday();
  const leo = familyChildren.find((child) => child.id === "leo");

  return (
    <ProfileSubpage title="Linked Children" description="Children connected to your account">
      <div className="space-y-4">
        <Link href="/family/my-child" className="block">
          <Card className="p-5 transition-colors hover:bg-muted">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-heading text-lg font-bold text-accent">
                  A
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground">{ava.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ava.room}
                    {today && ` · ${formatAge(fromKey(ava.dob), today)} old`}
                  </p>
                </div>
              </div>
              <Badge variant="success">Enrolled</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd className="text-right font-medium text-foreground">{formatShort(fromKey(ava.dob))}</dd>
              <dt className="text-muted-foreground">Booked days</dt>
              <dd className="text-right font-medium text-foreground">
                {ava.bookedDays.map((day) => WEEKDAYS_SHORT[day]).join(", ")}
              </dd>
              <dt className="text-muted-foreground">CCS</dt>
              <dd className="text-right font-medium text-foreground">
                {ava.ccsPercent}% · CRN {ava.crn}
              </dd>
              <dt className="text-muted-foreground">Enrolled since</dt>
              <dd className="text-right font-medium text-foreground">{formatShort(fromKey(ava.startDate))}</dd>
            </dl>
            <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
              View attendance &amp; portfolio <ChevronRight className="h-4 w-4" />
            </p>
          </Card>
        </Link>

        {leo && (
          <Link href="/family/enquiry" className="block">
            <Card className="p-5 transition-colors hover:bg-muted">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-info font-heading text-lg font-bold text-info-foreground">
                    L
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold text-foreground">{leo.name}</p>
                    <p className="text-sm text-muted-foreground">Requested room: {leo.room}</p>
                  </div>
                </div>
                <Badge variant="warning">Waitlisted</Badge>
              </div>
              <p className="mt-4 text-sm text-foreground">
                Position <span className="font-bold">#{leo.waitlistPosition}</span> of {leo.waitlistTotal} ·
                Preferred start {leo.preferredStart}
              </p>
              <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                View waitlist &amp; enquiries <ChevronRight className="h-4 w-4" />
              </p>
            </Card>
          </Link>
        )}
      </div>
    </ProfileSubpage>
  );
}
