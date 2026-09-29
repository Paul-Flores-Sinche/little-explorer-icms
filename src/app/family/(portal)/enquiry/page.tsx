"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CirclePlus, Paperclip } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { addDays, formatShort } from "@/lib/dates";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { isValidEmail, isValidPhone } from "@/lib/validation";

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

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger-foreground">{error}</p>}
    </div>
  );
}

type FieldErrors = Partial<
  Record<"description" | "dob" | "preferredStart" | "contactDetail" | "childName", string>
>;

interface EnquiryFormProps {
  onSubmitted: (reference: string) => void;
}

function EnquiryForm({ onSubmitted }: EnquiryFormProps) {
  const { addEnquiry } = useEnquiries();
  const today = useToday();

  const [type, setType] = useState<EnquiryType>(enquiryTypes[0]);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [preferredRoom, setPreferredRoom] = useState<string>(attendanceRooms[0]);
  const [preferredStart, setPreferredStart] = useState<Date | null>(null);
  const [availabilityRoom, setAvailabilityRoom] = useState<string>(attendanceRooms[0]);
  const [dateOfInterest, setDateOfInterest] = useState<Date | null>(null);
  const [invoiceReference, setInvoiceReference] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<EnquiryPriority>("Normal");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("Email");
  const [contactDetail, setContactDetail] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const isEnrolment = type === "New enrolment / waitlist";

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function resetForm() {
    setType(enquiryTypes[0]);
    setChildName("");
    setDob(null);
    setPreferredRoom(attendanceRooms[0]);
    setPreferredStart(null);
    setAvailabilityRoom(attendanceRooms[0]);
    setDateOfInterest(null);
    setInvoiceReference("");
    setDescription("");
    setPriority("Normal");
    setContactPreference("Email");
    setContactDetail("");
    setFileName(null);
    setErrors({});
  }

  function validate() {
    const next: FieldErrors = {};
    if (!description.trim()) next.description = "Please describe your enquiry.";
    if (isEnrolment) {
      if (!childName.trim()) next.childName = "Enter your child's full name.";
      if (!dob) next.dob = "Select your child's date of birth.";
      if (!preferredStart) next.preferredStart = "Select a preferred start date.";
    }
    if (contactPreference === "Email" && !isValidEmail(contactDetail)) {
      next.contactDetail = contactDetail.trim()
        ? "Enter a valid email address, e.g. name@example.com."
        : "Enter the email address we should reply to.";
    }
    if (contactPreference === "Phone" && !isValidPhone(contactDetail)) {
      next.contactDetail = contactDetail.trim()
        ? "Enter a valid Australian phone number, e.g. 0412 345 678."
        : "Enter the phone number we should call.";
    }
    setErrors(next);
    return Object.values(next).every((value) => !value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const messageParts: string[] = [];
    if (isEnrolment) {
      if (dob) messageParts.push(`Date of birth: ${formatShort(dob)}`);
      if (preferredStart) messageParts.push(`Preferred start date: ${formatShort(preferredStart)}`);
    }
    if (type === "Room availability & places per room") {
      messageParts.push(`Room of interest: ${availabilityRoom}`);
      if (dateOfInterest) messageParts.push(`Date of interest: ${formatShort(dateOfInterest)}`);
    }
    if (type === "Fees & payments" && invoiceReference.trim()) {
      messageParts.push(`Invoice reference: ${invoiceReference.trim()}`);
    }
    messageParts.push(description.trim());

    const created = addEnquiry({
      type,
      family: CURRENT_FAMILY,
      childName: isEnrolment ? childName.trim() || undefined : undefined,
      room: isEnrolment
        ? preferredRoom
        : type === "Room availability & places per room"
          ? availabilityRoom
          : undefined,
      message: messageParts.join("\n"),
      priority,
      contactPreference,
      contactDetail: contactPreference === "Portal" ? undefined : contactDetail.trim(),
    });

    resetForm();
    onSubmitted(created.reference);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField label="Enquiry type">
        <Select value={type} onChange={(e) => setType(e.target.value as EnquiryType)}>
          {enquiryTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormField>

      {isEnrolment && (
        <>
          <FormField label="Child name" htmlFor="child-name" error={errors.childName}>
            <Input
              id="child-name"
              placeholder="Full name"
              value={childName}
              onChange={(e) => {
                setChildName(e.target.value);
                clearError("childName");
              }}
              className={cn(errors.childName && "border-danger-foreground/60")}
            />
          </FormField>
          <FormField label="Date of birth" error={errors.dob}>
            <DatePicker
              value={dob}
              onChange={(date) => {
                setDob(date);
                clearError("dob");
              }}
              maxDate={today ?? undefined}
              minDate={today ? addDays(today, -7 * 365) : undefined}
              placeholder="Select date of birth"
              invalid={Boolean(errors.dob)}
            />
          </FormField>
          <FormField label="Preferred room">
            <Select value={preferredRoom} onChange={(e) => setPreferredRoom(e.target.value)}>
              {attendanceRooms.map((room) => (
                <option key={room}>{room}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Preferred start date" error={errors.preferredStart}>
            <DatePicker
              value={preferredStart}
              onChange={(date) => {
                setPreferredStart(date);
                clearError("preferredStart");
              }}
              minDate={today ?? undefined}
              maxDate={today ? addDays(today, 540) : undefined}
              disableWeekends
              placeholder="Select a start date"
              invalid={Boolean(errors.preferredStart)}
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
            <DatePicker
              value={dateOfInterest}
              onChange={setDateOfInterest}
              minDate={today ?? undefined}
              maxDate={today ? addDays(today, 365) : undefined}
              disableWeekends
              placeholder="Select a date"
            />
          </FormField>
        </>
      )}

      {type === "Fees & payments" && (
        <FormField label="Invoice reference (optional)">
          <Input
            placeholder="e.g. INV-260901-176"
            value={invoiceReference}
            onChange={(e) => setInvoiceReference(e.target.value)}
          />
        </FormField>
      )}

      <FormField label="Describe your enquiry" error={errors.description}>
        <Textarea
          placeholder="Tell us a bit more..."
          rows={4}
          maxLength={MESSAGE_LIMIT}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.trim()) clearError("description");
          }}
          className={cn(errors.description && "border-danger-foreground/60")}
        />
        <p className="text-right text-xs text-muted-foreground">
          {description.length}/{MESSAGE_LIMIT}
        </p>
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
          onChange={(e) => {
            setContactPreference(e.target.value as ContactPreference);
            setContactDetail("");
            clearError("contactDetail");
          }}
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Portal">Portal</option>
        </Select>
      </FormField>

      {contactPreference === "Portal" ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
          We&apos;ll reply right here in your Family Portal — you&apos;ll see it under My Enquiries.
        </p>
      ) : (
        <FormField
          label={contactPreference === "Email" ? "Email address" : "Phone number"}
          htmlFor="contact-detail"
          error={errors.contactDetail}
        >
          <Input
            id="contact-detail"
            type={contactPreference === "Email" ? "email" : "tel"}
            inputMode={contactPreference === "Email" ? "email" : "tel"}
            autoComplete={contactPreference === "Email" ? "email" : "tel"}
            placeholder={contactPreference === "Email" ? "name@example.com" : "0412 345 678"}
            value={contactDetail}
            onChange={(e) => {
              setContactDetail(e.target.value);
              clearError("contactDetail");
            }}
            className={cn(errors.contactDetail && "border-danger-foreground/60")}
          />
        </FormField>
      )}

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
