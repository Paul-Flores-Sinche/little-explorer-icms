"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BookedDays } from "@/components/staff/attendance-bits";
import { PageHeader } from "@/components/staff/page-header";
import { EnquiryDetailPanel } from "@/components/staff/enquiry-detail-panel";
import { useEnquiries } from "@/components/shared/enquiry-store";
import {
  enrolledChildren,
  familyById,
  roomConfig,
  type EnrolledChild,
  type Room,
} from "@/data/centre";
import { attendanceRooms, roomOccupancy, type Enquiry, type EnquiryStatus } from "@/data/mock-data";
import { WEEKDAYS, formatAge, formatShort, fromKey } from "@/lib/dates";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

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

const ccsVariant = { Active: "success", "Pending CWA": "warning", "Not claimed": "neutral" } as const;

function sortEnquiries(enquiries: Enquiry[]) {
  return [...enquiries].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

function ChildProfilePanel({ child }: { child: EnrolledChild | null }) {
  const today = useToday();
  if (!child) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <UserRound className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Select a child to see their profile</p>
      </Card>
    );
  }
  const family = familyById[child.familyId];
  const siblings = family.children.filter((entry) => entry.id !== child.id);

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">{child.name}</h2>
          <p className="text-sm text-muted-foreground">
            {child.room} · {today ? formatAge(fromKey(child.dob), today) : ""}
          </p>
        </div>
        <Badge variant="success">Enrolled</Badge>
      </div>

      {(child.allergies || child.medical) && (
        <div className="flex gap-2 rounded-xl border border-danger-foreground/20 bg-danger px-3 py-2 text-xs text-danger-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{[child.allergies && `Allergy: ${child.allergies}`, child.medical].filter(Boolean).join(" · ")}</span>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Date of birth</dt>
        <dd className="text-right font-medium text-foreground">{formatShort(fromKey(child.dob))}</dd>
        <dt className="text-muted-foreground">Enrolled since</dt>
        <dd className="text-right font-medium text-foreground">{formatShort(fromKey(child.startDate))}</dd>
        <dt className="text-muted-foreground">Booked days</dt>
        <dd className="text-right font-medium text-foreground">
          {child.bookedDays.length === 5 ? "Mon–Fri" : child.bookedDays.map((day) => WEEKDAYS[day].slice(0, 3)).join(", ")}
        </dd>
        <dt className="text-muted-foreground">CCS</dt>
        <dd className="text-right font-medium text-foreground">
          {child.ccsStatus} · {child.ccsPercent}%
        </dd>
        <dt className="text-muted-foreground">CRN</dt>
        <dd className="text-right font-medium text-foreground">{child.crn}</dd>
      </dl>

      <div className="space-y-1 border-t border-border pt-4 text-sm">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Primary contact</p>
        <p className="font-semibold text-foreground">{family.guardian}</p>
        <p className="text-muted-foreground">{family.phone}</p>
        <p className="break-all text-muted-foreground">{family.email}</p>
        <p className="text-muted-foreground">{family.address}</p>
        {siblings.length > 0 && (
          <p className="pt-1 text-muted-foreground">
            Sibling{siblings.length > 1 ? "s" : ""}: {siblings.map((entry) => `${entry.name} (${entry.room})`).join(", ")}
          </p>
        )}
      </div>

      <Link
        href={`/staff/rooms/${roomConfig[child.room].slug}`}
        className="flex items-center gap-1 text-sm font-semibold text-primary"
      >
        View {child.room} room <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function EnrolmentsPageContent() {
  const { enquiries } = useEnquiries();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("enquiry");
  const today = useToday();
  const [tab, setTab] = useState<"enquiries" | "enrolled">(
    searchParams.get("tab") === "enrolled" ? "enrolled" : "enquiries",
  );
  const [selectedId, setSelectedId] = useState<string | null>(preselected);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState<Room | "All">(
    (attendanceRooms as readonly string[]).includes(searchParams.get("room") ?? "")
      ? (searchParams.get("room") as Room)
      : "All",
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs selection with the ?enquiry= URL param when it changes (e.g. repeated bell-dropdown navigation on the same route)
    if (preselected) setSelectedId(preselected);
    if (preselected) setTab("enquiries");
  }, [preselected]);

  const term = query.trim().toLowerCase();
  const sorted = useMemo(() => sortEnquiries(enquiries), [enquiries]);
  const visibleEnquiries = sorted.filter(
    (enquiry) =>
      !term ||
      `${enquiry.childName ?? ""} ${enquiry.family} ${enquiry.type} ${enquiry.reference}`.toLowerCase().includes(term),
  );
  const selected = sorted.find((enquiry) => enquiry.id === selectedId) ?? null;

  const filteredChildren = enrolledChildren
    .filter((child) => roomFilter === "All" || child.room === roomFilter)
    .filter(
      (child) =>
        !term ||
        child.name.toLowerCase().includes(term) ||
        familyById[child.familyId].guardian.toLowerCase().includes(term),
    )
    .sort((a, b) => a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName));
  const pageCount = Math.max(1, Math.ceil(filteredChildren.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageChildren = filteredChildren.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const selectedChild = enrolledChildren.find((child) => child.id === selectedChildId) ?? null;

  return (
    <>
      <PageHeader title="Enrolments & Bookings">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search families or children"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            className="w-72 pl-9"
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-[1fr_360px] gap-6 px-8 py-6">
        <Card className="min-w-0 p-6">
          <div role="tablist" className="mb-4 flex items-center gap-6 border-b border-border">
            {(
              [
                { id: "enquiries", label: "Waitlist & Enquiries", count: sorted.length },
                { id: "enrolled", label: "Enrolled Children", count: enrolledChildren.length },
              ] as const
            ).map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={tab === entry.id}
                onClick={() => setTab(entry.id)}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors",
                  tab === entry.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
                <Badge variant="neutral">{entry.count}</Badge>
              </button>
            ))}
          </div>

          {tab === "enquiries" ? (
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
                {visibleEnquiries.map((enquiry) => (
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
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {filteredChildren.length} {filteredChildren.length === 1 ? "child" : "children"}
                  {roomFilter !== "All" && ` in ${roomFilter}`}
                  {term && ` matching “${query.trim()}”`}
                </p>
                <div className="w-48">
                  <Select
                    value={roomFilter}
                    onChange={(e) => {
                      setRoomFilter(e.target.value as Room | "All");
                      setPage(0);
                    }}
                    className="h-10"
                  >
                    <option value="All">All rooms</option>
                    {attendanceRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Child</th>
                    <th className="pb-3 font-semibold">Room</th>
                    <th className="pb-3 font-semibold">Age</th>
                    <th className="pb-3 font-semibold">Days</th>
                    <th className="pb-3 font-semibold">Family</th>
                    <th className="pb-3 font-semibold">CCS</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageChildren.map((child) => (
                    <tr
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={cn(
                        "cursor-pointer border-b border-border last:border-0 hover:bg-muted",
                        selectedChildId === child.id && "bg-muted",
                      )}
                    >
                      <td className="py-2.5 font-medium text-foreground">
                        <span className="flex items-center gap-1.5">
                          {child.name}
                          {(child.allergies || child.medical) && (
                            <AlertTriangle className="h-3.5 w-3.5 text-danger-foreground" aria-label="Medical alert" />
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 text-foreground">{child.room}</td>
                      <td className="py-2.5 text-foreground">
                        {today ? formatAge(fromKey(child.dob), today) : "–"}
                      </td>
                      <td className="py-2.5">
                        <BookedDays child={child} />
                      </td>
                      <td className="py-2.5 text-foreground">{familyById[child.familyId].guardian}</td>
                      <td className="py-2.5">
                        <Badge variant={ccsVariant[child.ccsStatus]}>{child.ccsStatus}</Badge>
                      </td>
                      <td className="py-2.5">
                        <Badge variant="success">Active</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredChildren.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No children match your search.</p>
              ) : (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">
                    Showing {currentPage * PAGE_SIZE + 1}–
                    {Math.min((currentPage + 1) * PAGE_SIZE, filteredChildren.length)} of {filteredChildren.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 0}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-muted-foreground">
                      Page {currentPage + 1} of {pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= pageCount - 1}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Room occupancy</h2>
            <div className="space-y-4">
              {roomOccupancy.map((room) => (
                <Link
                  key={room.room}
                  href={`/staff/rooms/${room.room.toLowerCase()}`}
                  className="block rounded-lg transition-colors hover:bg-muted"
                >
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
                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {tab === "enquiries" ? (
            <EnquiryDetailPanel enquiry={selected} />
          ) : (
            <ChildProfilePanel child={selectedChild} />
          )}
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
