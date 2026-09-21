"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CirclePlus, Paperclip } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { useEnquiries } from "@/components/shared/enquiry-store";
import {
  attendanceRooms,
  enquiryTypes,
  familyChildren,
  type ContactPreference,
  type Enquiry,
  type EnquiryPriority,
  type EnquiryType,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const CURRENT_FAMILY = "Thompson";
const MESSAGE_LIMIT = 500;

const statusVariant: Record<Enquiry["status"], BadgeProps["variant"]> = {
  New: "danger",
  "In progress": "info",
  "Waiting on family": "warning",
  Resolved: "success",
};

const childOrder = [...familyChildren].sort((a, b) =>
  a.status === b.status ? 0 : a.status === "waitlisted" ? -1 : 1,
);

function ChildStatusList() {
  return (
    <div className="space-y-4">
      {childOrder.map((child) => {
        const badgeVariant: BadgeProps["variant"] =
          child.status === "enrolled" ? "success" : "warning";
        const badgeLabel = child.status === "enrolled" ? "Enrolled" : "Waitlisted";
        const progress =
          child.waitlistPosition && child.waitlistTotal
            ? ((child.waitlistTotal - child.waitlistPosition) / child.waitlistTotal) * 100
            : null;

        return (
          <Card key={child.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-lg font-bold text-foreground">{child.name}</p>
                <p className="text-sm text-muted-foreground">
                  {child.status === "enrolled" ? child.room : `Requested room: ${child.room}`}
                </p>
              </div>
              <Badge variant={badgeVariant} className="shrink-0">
                {badgeLabel}
              </Badge>
            </div>

            {progress !== null ? (
              <div className="mt-4">
                <p className="text-sm text-foreground">
                  Position <span className="font-bold">#{child.waitlistPosition}</span> of{" "}
                  {child.waitlistTotal} on the waitlist
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted {child.submittedOn} · Preferred start: {child.preferredStart}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Confirmed enrolment since {child.enrolledSince}.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function EnquiryThreadCard({ enquiry }: { enquiry: Enquiry }) {
  const [open, setOpen] = useState(false);
  const { markFamilySeen } = useEnquiries();

  function handleToggle() {
    setOpen((prev) => !prev);
    if (!open && enquiry.familyUnread) markFamilySeen(enquiry.id);
  }

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-heading text-base font-bold text-foreground">{enquiry.type}</p>
            {enquiry.familyUnread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread update" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {enquiry.reference} · Submitted {enquiry.date}
          </p>
        </div>
        <Badge variant={statusVariant[enquiry.status]} className="shrink-0">
          {enquiry.status}
        </Badge>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          {enquiry.thread.map((entry, index) => (
            <div
              key={index}
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                entry.from === "family"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-line">{entry.text}</p>
              <p
                className={cn(
                  "mt-1 text-[11px]",
                  entry.from === "family" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {entry.from === "family" ? "You" : "Little Explorer"} · {entry.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

interface EnquiryListProps {
  onSubmitNew?: () => void;
}

function EnquiryList({ onSubmitNew }: EnquiryListProps) {
  const { enquiries } = useEnquiries();
  const myEnquiries = enquiries.filter((enquiry) => enquiry.family === CURRENT_FAMILY);

  return (
    <div className="space-y-6">
      <ChildStatusList />

      {myEnquiries.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-base font-bold text-foreground">
            Your enquiries
          </h2>
          <div className="space-y-3">
            {myEnquiries.map((enquiry) => (
              <EnquiryThreadCard key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>
        </div>
      )}

      {onSubmitNew && (
        <Button onClick={onSubmitNew} className="w-full gap-2">
          <CirclePlus className="h-4 w-4" />
          Submit a New Enquiry
        </Button>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

interface EnquiryFormProps {
  onSubmitted: (reference: string) => void;
}

function EnquiryForm({ onSubmitted }: EnquiryFormProps) {
  const { addEnquiry } = useEnquiries();

  const [type, setType] = useState<EnquiryType>(enquiryTypes[0]);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
  const [preferredRoom, setPreferredRoom] = useState<string>(attendanceRooms[0]);
  const [preferredStart, setPreferredStart] = useState("");
  const [availabilityRoom, setAvailabilityRoom] = useState<string>(attendanceRooms[0]);
  const [dateOfInterest, setDateOfInterest] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priority, setPriority] = useState<EnquiryPriority>("Normal");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("Email");
  const [fileName, setFileName] = useState<string | null>(null);

  function resetForm() {
    setType(enquiryTypes[0]);
    setChildName("");
    setDob("");
    setPreferredRoom(attendanceRooms[0]);
    setPreferredStart("");
    setAvailabilityRoom(attendanceRooms[0]);
    setDateOfInterest("");
    setInvoiceReference("");
    setDescription("");
    setDescriptionError(null);
    setPriority("Normal");
    setContactPreference("Email");
    setFileName(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!description.trim()) {
      setDescriptionError("Please describe your enquiry.");
      return;
    }
    setDescriptionError(null);

    const messageParts: string[] = [];
    if (type === "New enrolment / waitlist") {
      if (dob) messageParts.push(`Date of birth: ${dob}`);
      if (preferredStart) messageParts.push(`Preferred start date: ${preferredStart}`);
    }
    if (type === "Room availability & places per room") {
      messageParts.push(`Room of interest: ${availabilityRoom}`);
      if (dateOfInterest) messageParts.push(`Date of interest: ${dateOfInterest}`);
    }
    if (type === "Fees & payments" && invoiceReference.trim()) {
      messageParts.push(`Invoice reference: ${invoiceReference.trim()}`);
    }
    messageParts.push(description.trim());

    const created = addEnquiry({
      type,
      family: CURRENT_FAMILY,
      childName: type === "New enrolment / waitlist" ? childName.trim() || undefined : undefined,
      room:
        type === "New enrolment / waitlist"
          ? preferredRoom
          : type === "Room availability & places per room"
            ? availabilityRoom
            : undefined,
      message: messageParts.join("\n"),
      priority,
      contactPreference,
    });

    resetForm();
    onSubmitted(created.reference);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Enquiry type">
        <Select value={type} onChange={(e) => setType(e.target.value as EnquiryType)}>
          {enquiryTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormField>

      {type === "New enrolment / waitlist" && (
        <>
          <FormField label="Child name">
            <Input
              placeholder="Full name"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
          </FormField>
          <FormField label="Date of birth">
            <Input
              placeholder="dd/mm/yyyy"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </FormField>
          <FormField label="Preferred room">
            <Select value={preferredRoom} onChange={(e) => setPreferredRoom(e.target.value)}>
              {attendanceRooms.map((room) => (
                <option key={room}>{room}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Preferred start date">
            <Input
              placeholder="dd/mm/yyyy"
              required
              value={preferredStart}
              onChange={(e) => setPreferredStart(e.target.value)}
            />
          </FormField>
        </>
      )}

      {type === "Room availability & places per room" && (
        <>
          <FormField label="Room">
            <Select value={availabilityRoom} onChange={(e) => setAvailabilityRoom(e.target.value)}>
              {attendanceRooms.map((room) => (
                <option key={room}>{room}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date of interest">
            <Input
              placeholder="dd/mm/yyyy"
              value={dateOfInterest}
              onChange={(e) => setDateOfInterest(e.target.value)}
            />
          </FormField>
        </>
      )}

      {type === "Fees & payments" && (
        <FormField label="Invoice reference (optional)">
          <Input
            placeholder="e.g. 1–7 Sep 2026"
            value={invoiceReference}
            onChange={(e) => setInvoiceReference(e.target.value)}
          />
        </FormField>
      )}

      <FormField label="Describe your enquiry">
        <Textarea
          placeholder="Tell us a bit more..."
          required
          rows={4}
          maxLength={MESSAGE_LIMIT}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.trim()) setDescriptionError(null);
          }}
          className={cn(descriptionError && "border-danger-foreground/60")}
        />
        <div className="flex items-center justify-between">
          {descriptionError ? (
            <p className="text-xs text-danger-foreground">{descriptionError}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground">
            {description.length}/{MESSAGE_LIMIT}
          </p>
        </div>
      </FormField>

      <FormField label="Priority">
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as EnquiryPriority)}
        >
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
        </Select>
      </FormField>

      <FormField label="Preferred contact">
        <Select
          value={contactPreference}
          onChange={(e) => setContactPreference(e.target.value as ContactPreference)}
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Portal">Portal</option>
        </Select>
      </FormField>

      <FormField label="Attach a file (optional)">
        <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 text-sm text-muted-foreground hover:bg-muted">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileName ?? "Choose a file — demo only, nothing is uploaded"}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </FormField>

      <Button type="submit" className="w-full">
        Submit Enquiry
      </Button>
    </form>
  );
}

export default function EnquiryPage() {
  const [tab, setTab] = useState("my-enquiries");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function handleSubmitted(reference: string) {
    setConfirmation(reference);
  }

  return (
    <>
      <MobilePageHeader title="Enquiries & Waitlist" backHref="/family" />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Enquiries & Waitlist
        </h1>

        <div className="md:hidden">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="my-enquiries" className="flex-1">
                My Enquiries
              </TabsTrigger>
              <TabsTrigger value="new-enquiry" className="flex-1">
                New Enquiry
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-enquiries">
              <EnquiryList onSubmitNew={() => setTab("new-enquiry")} />
            </TabsContent>
            <TabsContent value="new-enquiry">
              {confirmation ? (
                <FakeSuccessBanner
                  message={`Enquiry ${confirmation} submitted! We'll be in touch.`}
                  onDismiss={() => setConfirmation(null)}
                />
              ) : (
                <EnquiryForm onSubmitted={handleSubmitted} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-[1fr_380px]">
          <EnquiryList />
          <Card className="h-fit p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              Submit a new enquiry
            </h2>
            {confirmation ? (
              <FakeSuccessBanner
                message={`Enquiry ${confirmation} submitted! We'll be in touch.`}
                onDismiss={() => setConfirmation(null)}
              />
            ) : (
              <EnquiryForm onSubmitted={handleSubmitted} />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
