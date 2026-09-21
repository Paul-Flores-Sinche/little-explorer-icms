"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/staff/page-header";
import { EnquiryDetailPanel } from "@/components/staff/enquiry-detail-panel";
import { useEnquiries } from "@/components/shared/enquiry-store";
import { dashboardStats, roomOccupancy, type Enquiry, type EnquiryStatus } from "@/data/mock-data";
import { cn } from "@/lib/utils";

const statusVariant: Record<EnquiryStatus, BadgeProps["variant"]> = {
  New: "danger",
  "In progress": "info",
  "Waiting on family": "warning",
  Resolved: "success",
};

const statusOrder: Record<EnquiryStatus, number> = {
  New: 0,
  "In progress": 1,
  "Waiting on family": 2,
  Resolved: 3,
};

function sortEnquiries(enquiries: Enquiry[]) {
  return [...enquiries].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

function EnrolmentsPageContent() {
  const { enquiries } = useEnquiries();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("enquiry");
  const [selectedId, setSelectedId] = useState<string | null>(preselected);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs selection with the ?enquiry= URL param when it changes (e.g. repeated bell-dropdown navigation on the same route)
    if (preselected) setSelectedId(preselected);
  }, [preselected]);

  const sorted = useMemo(() => sortEnquiries(enquiries), [enquiries]);
  const selected = sorted.find((enquiry) => enquiry.id === selectedId) ?? null;

  return (
    <>
      <PageHeader title="Enrolments & Bookings">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search families or children" className="w-72 pl-9" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-[1fr_360px] gap-6 px-8 py-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-6 border-b border-border pb-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              Waitlist &amp; Enquiries
              <Badge variant="neutral">{sorted.length}</Badge>
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
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Family</th>
                <th className="pb-3 font-semibold">Room</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  onClick={() => setSelectedId(enquiry.id)}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-0 hover:bg-muted",
                    selectedId === enquiry.id && "bg-muted",
                  )}
                >
                  <td className="py-3 font-medium text-foreground">{enquiry.childName ?? "—"}</td>
                  <td className="py-3 text-foreground">{enquiry.type}</td>
                  <td className="py-3 text-foreground">{enquiry.family}</td>
                  <td className="py-3 text-foreground">{enquiry.room ?? "—"}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant[enquiry.status]}>{enquiry.status}</Badge>
                  </td>
                  <td className="py-3 text-foreground">{enquiry.date}</td>
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

          <EnquiryDetailPanel enquiry={selected} />
        </div>
      </div>
    </>
  );
}

export default function EnrolmentsPage() {
  return (
    <Suspense fallback={null}>
      <EnrolmentsPageContent />
    </Suspense>
  );
}
