"use client";

import { useState, type FormEvent } from "react";
import { CirclePlus, Search } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import {
  dashboardStats,
  roomOccupancy,
  waitlistEnquiries,
  type WaitlistEntry,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const statusVariant: Record<WaitlistEntry["status"], BadgeProps["variant"]> = {
  "Waitlisted #1": "warning",
  "Waitlisted #2": "warning",
  "Waitlisted #3": "warning",
  "New enquiry": "info",
  Enrolled: "success",
};

export default function EnrolmentsPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <PageHeader title="Enrolments & Bookings">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search families or children" className="w-72 pl-9" />
        </div>
        <a href="#new-enquiry-form" className={cn(buttonVariants(), "gap-2")}>
          <CirclePlus className="h-4 w-4" />
          New Enquiry
        </a>
      </PageHeader>

      <div className="grid grid-cols-[1fr_360px] gap-6 px-8 py-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-6 border-b border-border pb-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              Waitlist &amp; Enquiries
              <Badge variant="neutral">{waitlistEnquiries.length}</Badge>
            </span>
            <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              Enrolled Children
              <Badge variant="neutral">{dashboardStats.enrolledChildren}</Badge>
            </span>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="pb-3 font-semibold">Child</th>
                <th className="pb-3 font-semibold">Family</th>
                <th className="pb-3 font-semibold">Room Requested</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {waitlistEnquiries.map((entry) => (
                <tr key={entry.child} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-foreground">{entry.child}</td>
                  <td className="py-3 text-foreground">{entry.family}</td>
                  <td className="py-3 text-foreground">{entry.room}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
                  </td>
                  <td className="py-3 text-foreground">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              Room occupancy
            </h2>
            <div className="space-y-4">
              {roomOccupancy.map((room) => (
                <div key={room.room}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{room.room}</span>
                    <span className="text-muted-foreground">
                      {room.occupied} / {room.capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        room.occupied >= room.capacity ? "bg-accent" : "bg-primary",
                      )}
                      style={{
                        width: `${(room.occupied / room.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card id="new-enquiry-form" className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              New enquiry
            </h2>
            {submitted ? (
              <FakeSuccessBanner
                message="Child added to the waitlist."
                onDismiss={() => setSubmitted(false)}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Child name
                  </label>
                  <Input placeholder="Full name" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Preferred room
                  </label>
                  <Select defaultValue="Nursery">
                    <option>Nursery</option>
                    <option>Toddlers</option>
                    <option>Kindergarten</option>
                    <option>Preschool</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Preferred start date
                  </label>
                  <Input placeholder="dd/mm/yyyy" required />
                </div>
                <Button type="submit" className="w-full">
                  Add to Waitlist
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
