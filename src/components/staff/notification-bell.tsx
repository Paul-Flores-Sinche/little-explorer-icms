"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell } from "lucide-react";

import { useEnquiries } from "@/components/shared/enquiry-store";

export function StaffNotificationBell() {
  const [open, setOpen] = useState(false);
  const { enquiries } = useEnquiries();
  const newEnquiries = enquiries.filter((enquiry) => enquiry.status === "New");

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-foreground"
      >
        <Bell className="h-5 w-5" />
        {newEnquiries.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-foreground px-1 text-[10px] font-bold text-white">
            {newEnquiries.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-xl">
            <p className="px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Enquiries to resolve
            </p>
            {newEnquiries.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No new enquiries.</p>
            ) : (
              <ul className="max-h-80 space-y-1 overflow-y-auto">
                {newEnquiries.map((enquiry) => (
                  <li key={enquiry.id}>
                    <Link
                      href={`/staff/enrolments?enquiry=${enquiry.id}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2 hover:bg-muted"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {enquiry.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{enquiry.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{enquiry.family}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-foreground">{enquiry.message}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
