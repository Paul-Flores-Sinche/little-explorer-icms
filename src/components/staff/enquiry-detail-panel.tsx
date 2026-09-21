"use client";

import { useState } from "react";
import { Inbox, Send } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { useEnquiries } from "@/components/shared/enquiry-store";
import {
  enquiryReplyTemplates,
  staffDirectory,
  type Enquiry,
  type EnquiryStatus,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const statusOptions: EnquiryStatus[] = ["New", "In progress", "Waiting on family", "Resolved"];

const statusVariant: Record<EnquiryStatus, BadgeProps["variant"]> = {
  New: "danger",
  "In progress": "info",
  "Waiting on family": "warning",
  Resolved: "success",
};

const REQUEST_INFO_MESSAGE =
  "Could you please share a few more details so we can help with this?";
const RESOLVED_MESSAGE = "This enquiry has been marked as resolved.";
const OFFER_PLACE_MESSAGE =
  "Great news — we're pleased to offer your child a place! Please confirm by replying here.";
const ADD_TO_WAITLIST_MESSAGE =
  "You've been added to our waitlist — we'll be in touch as soon as a place becomes available.";

interface EnquiryDetailPanelProps {
  enquiry: Enquiry | null;
}

export function EnquiryDetailPanel({ enquiry }: EnquiryDetailPanelProps) {
  if (!enquiry) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Select an enquiry to respond
        </p>
      </Card>
    );
  }

  // Remounts (and so resets all local form state below) whenever the
  // selected enquiry changes, instead of syncing it with an effect.
  return <EnquiryDetailPanelContent key={enquiry.id} enquiry={enquiry} />;
}

function EnquiryDetailPanelContent({ enquiry }: { enquiry: Enquiry }) {
  const { updateEnquiry, sendStaffReply } = useEnquiries();
  const [replyText, setReplyText] = useState("");
  const [template, setTemplate] = useState("");
  const [internalNotes, setInternalNotes] = useState(enquiry.internalNotes);
  const [banner, setBanner] = useState<string | null>(null);

  function handleSendReply() {
    if (!replyText.trim()) return;
    sendStaffReply(enquiry.id, replyText.trim(), "Waiting on family");
    setReplyText("");
    setTemplate("");
    setBanner("Reply sent to family.");
  }

  function handleRequestMoreInfo() {
    sendStaffReply(enquiry.id, REQUEST_INFO_MESSAGE, "Waiting on family");
    setBanner("Request for more info sent to family.");
  }

  function handleMarkResolved() {
    sendStaffReply(enquiry.id, RESOLVED_MESSAGE, "Resolved");
    setBanner("Enquiry marked as resolved.");
  }

  function handleOfferPlace() {
    sendStaffReply(enquiry.id, OFFER_PLACE_MESSAGE, "Waiting on family");
    setBanner("Offer sent to family.");
  }

  function handleAddToWaitlist() {
    sendStaffReply(enquiry.id, ADD_TO_WAITLIST_MESSAGE, "Resolved");
    setBanner("Added to waitlist.");
  }

  function handleInternalNotesBlur() {
    if (internalNotes !== enquiry.internalNotes) {
      updateEnquiry(enquiry.id, { internalNotes });
    }
  }

  const templates = enquiryReplyTemplates[enquiry.type] ?? [];

  return (
    <Card className="space-y-4 p-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-foreground">{enquiry.reference}</h2>
          <Badge variant={enquiry.priority === "Urgent" ? "danger" : "neutral"}>
            {enquiry.priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{enquiry.type}</p>
      </div>

      {banner && (
        <FakeSuccessBanner message={banner} onDismiss={() => setBanner(null)} />
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Family</dt>
        <dd className="text-right font-medium text-foreground">{enquiry.family}</dd>
        {enquiry.childName && (
          <>
            <dt className="text-muted-foreground">Child</dt>
            <dd className="text-right font-medium text-foreground">{enquiry.childName}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Contact preference</dt>
        <dd className="text-right font-medium text-foreground">{enquiry.contactPreference}</dd>
        <dt className="text-muted-foreground">Submitted</dt>
        <dd className="text-right font-medium text-foreground">{enquiry.date}</dd>
      </dl>

      <div className="rounded-xl bg-muted p-3 text-sm whitespace-pre-line text-foreground">
        {enquiry.message}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Status</label>
        <div className="flex items-center gap-2">
          <Select
            value={enquiry.status}
            onChange={(e) => updateEnquiry(enquiry.id, { status: e.target.value as EnquiryStatus })}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Badge variant={statusVariant[enquiry.status]} className="shrink-0">
            {enquiry.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Assign to</label>
        <Select
          value={enquiry.assignedTo ?? ""}
          onChange={(e) => updateEnquiry(enquiry.id, { assignedTo: e.target.value || null })}
        >
          <option value="">Unassigned</option>
          {staffDirectory.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {enquiry.thread.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Conversation</p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
            {enquiry.thread.map((entry, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs",
                  entry.from === "staff"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-line">{entry.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    entry.from === "staff" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {entry.from === "staff" ? "Staff" : enquiry.family} · {entry.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Use template</label>
        <Select
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            if (e.target.value) setReplyText(e.target.value);
          }}
        >
          <option value="">Select a template…</option>
          {templates.map((text, index) => (
            <option key={index} value={text}>
              {text.length > 60 ? `${text.slice(0, 60)}…` : text}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Reply to family</label>
        <Textarea
          rows={4}
          placeholder="Write a reply…"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="gap-2" onClick={handleSendReply} disabled={!replyText.trim()}>
          <Send className="h-4 w-4" />
          Send reply
        </Button>
        <Button type="button" variant="outline" onClick={handleRequestMoreInfo}>
          Request more info
        </Button>
        <Button type="button" variant="outline" onClick={handleMarkResolved}>
          Mark as resolved
        </Button>
        {enquiry.type === "New enrolment / waitlist" && (
          <>
            <Button type="button" variant="accent" onClick={handleOfferPlace}>
              Offer place
            </Button>
            <Button type="button" variant="outline" onClick={handleAddToWaitlist}>
              Add to waitlist
            </Button>
          </>
        )}
      </div>

      <div className="space-y-1.5 border-t border-border pt-4">
        <label className="text-sm font-semibold text-foreground">
          Internal notes <span className="font-normal text-muted-foreground">(not visible to family)</span>
        </label>
        <Textarea
          rows={3}
          placeholder="Notes for the team…"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          onBlur={handleInternalNotesBlur}
        />
      </div>
    </Card>
  );
}
