"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CirclePlus } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { familyChildren } from "@/data/mock-data";

interface EnquiryListProps {
  onSubmitNew?: () => void;
}

const enquiryOrder = [...familyChildren].sort((a, b) =>
  a.status === b.status ? 0 : a.status === "waitlisted" ? -1 : 1,
);

function EnquiryList({ onSubmitNew }: EnquiryListProps) {
  return (
    <div className="space-y-4">
      {enquiryOrder.map((child) => {
        const badgeVariant: BadgeProps["variant"] =
          child.status === "enrolled" ? "success" : "warning";
        const badgeLabel =
          child.status === "enrolled" ? "Enrolled" : "Waitlisted";
        const progress =
          child.waitlistPosition && child.waitlistTotal
            ? ((child.waitlistTotal - child.waitlistPosition) /
                child.waitlistTotal) *
              100
            : null;

        return (
          <Card key={child.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-lg font-bold text-foreground">
                  {child.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {child.status === "enrolled"
                    ? child.room
                    : `Requested room: ${child.room}`}
                </p>
              </div>
              <Badge variant={badgeVariant} className="shrink-0">
                {badgeLabel}
              </Badge>
            </div>

            {progress !== null ? (
              <div className="mt-4">
                <p className="text-sm text-foreground">
                  Position <span className="font-bold">#{child.waitlistPosition}</span>{" "}
                  of {child.waitlistTotal} on the waitlist
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted {child.submittedOn} · Preferred start:{" "}
                  {child.preferredStart}
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
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

interface EnquiryFormProps {
  submitted: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

function EnquiryForm({ submitted, onSubmit, onReset }: EnquiryFormProps) {
  if (submitted) {
    return (
      <FakeSuccessBanner
        message="Enquiry submitted! We'll be in touch about your spot on the waitlist."
        onDismiss={onReset}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Child name">
        <Input placeholder="Full name" required />
      </FormField>
      <FormField label="Date of birth">
        <Input placeholder="dd/mm/yyyy" required />
      </FormField>
      <FormField label="Preferred room">
        <Select defaultValue="Nursery">
          <option>Nursery</option>
          <option>Toddlers</option>
          <option>Kindergarten</option>
          <option>Preschool</option>
        </Select>
      </FormField>
      <FormField label="Preferred start date">
        <Input placeholder="dd/mm/yyyy" required />
      </FormField>
      <Button type="submit" className="w-full">
        Submit Enquiry
      </Button>
    </form>
  );
}

export default function EnquiryPage() {
  const [tab, setTab] = useState("my-enquiries");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
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
              <EnquiryForm
                submitted={submitted}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-[1fr_380px]">
          <EnquiryList />
          <Card className="h-fit p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              Submit a new enquiry
            </h2>
            <EnquiryForm
              submitted={submitted}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
