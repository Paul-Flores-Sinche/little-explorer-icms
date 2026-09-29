"use client";

import { useState, type FormEvent } from "react";
import { Bell, Loader2, Mail, MessageSquare, Search, Users, User, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { familyAccounts, type FamilyAccount, type Room } from "@/data/centre";
import { attendanceRooms } from "@/data/mock-data";
import { cn } from "@/lib/utils";

type Audience = "all" | "room" | "family";
type Channel = "push" | "email" | "sms";

const templates = [
  { label: "Blank notice", subject: "", body: "" },
  {
    label: "Centre closure",
    subject: "Centre closed — public holiday",
    body: "Little Explorer will be closed on the upcoming public holiday. Normal fees apply. We look forward to seeing everyone the following day.",
  },
  {
    label: "Excursion permission",
    subject: "Excursion permission form",
    body: "We're heading on an excursion soon! Please complete the permission form in the Family Portal by Friday so your child can join us.",
  },
  {
    label: "Health alert",
    subject: "Health notice — hand, foot and mouth",
    body: "We have had a confirmed case of hand, foot and mouth disease. Please keep children home if they show symptoms and let us know via the portal.",
  },
  {
    label: "Payment reminder",
    subject: "Friendly reminder — fees due",
    body: "This is a friendly reminder that your latest invoice is now due. You can pay securely in the Family Portal under Billing.",
  },
];

const channelOptions: { id: Channel; label: string; icon: LucideIcon }[] = [
  { id: "push", label: "Portal & push", icon: Bell },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
];

interface SendNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  defaultRoom?: Room | null;
}

function familiesInRoom(room: Room) {
  return familyAccounts.filter((family) => family.children.some((child) => child.room === room));
}

export function SendNoticeDialog({ open, onClose, defaultRoom }: SendNoticeDialogProps) {
  const { toast } = useToast();
  const [audience, setAudience] = useState<Audience>(defaultRoom ? "room" : "all");
  const [room, setRoom] = useState<Room>(defaultRoom ?? attendanceRooms[0]);
  const [familyQuery, setFamilyQuery] = useState("");
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [channels, setChannels] = useState<Channel[]>(["push", "email"]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const recipients =
    audience === "all" ? familyAccounts.length : audience === "room" ? familiesInRoom(room).length : family ? 1 : 0;

  const matches = familyQuery.trim()
    ? familyAccounts
        .filter((entry) =>
          `${entry.guardian} ${entry.children.map((child) => child.name).join(" ")}`
            .toLowerCase()
            .includes(familyQuery.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function reset() {
    setAudience(defaultRoom ? "room" : "all");
    setFamily(null);
    setFamilyQuery("");
    setSubject("");
    setBody("");
    setErrors({});
    setChannels(["push", "email"]);
  }

  function handleClose() {
    if (sending) return;
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (audience === "family" && !family) next.family = "Choose the family to notify.";
    if (!subject.trim()) next.subject = "Add a subject.";
    if (body.trim().length < 10) next.body = "Write a message (at least 10 characters).";
    if (channels.length === 0) next.channels = "Pick at least one channel.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      const target =
        audience === "all"
          ? `all ${recipients} families`
          : audience === "room"
            ? `${recipients} ${room} families`
            : `the ${family?.surname} family`;
      toast({
        title: "Notice sent",
        description: `"${subject.trim()}" was sent to ${target} via ${channels
          .map((id) => channelOptions.find((option) => option.id === id)?.label)
          .join(", ")}.`,
        duration: 5000,
      });
      reset();
      onClose();
    }, 1200);
  }

  const audienceOptions: { id: Audience; label: string; description: string; icon: LucideIcon }[] = [
    { id: "all", label: "All families", description: `${familyAccounts.length} families`, icon: Users },
    { id: "room", label: "By room", description: "Families in one room", icon: Users },
    { id: "family", label: "One family", description: "Personal notice", icon: User },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Send notice"
      description="Notices appear in the Family Portal and are sent on the channels you choose."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Send to</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {audienceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAudience(option.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  audience === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <option.icon className={cn("mt-0.5 h-4 w-4", audience === option.id ? "text-primary" : "text-muted-foreground")} />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {audience === "room" && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Room</label>
            <Select value={room} onChange={(e) => setRoom(e.target.value as Room)}>
              {attendanceRooms.map((option) => (
                <option key={option} value={option}>
                  {option} — {familiesInRoom(option).length} families
                </option>
              ))}
            </Select>
          </div>
        )}

        {audience === "family" && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Family</label>
            {family ? (
              <div className="flex items-center justify-between rounded-xl border border-primary bg-primary/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{family.guardian}</p>
                  <p className="text-xs text-muted-foreground">
                    {family.children.map((child) => `${child.name} (${child.room})`).join(", ")}
                  </p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFamily(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search parent or child name (e.g. Thompson)"
                  value={familyQuery}
                  onChange={(e) => setFamilyQuery(e.target.value)}
                  className={cn("pl-9", errors.family && "border-danger-foreground/60")}
                />
                {matches.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-1 shadow-lg">
                    {matches.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setFamily(entry);
                            setFamilyQuery("");
                            setErrors((prev) => ({ ...prev, family: "" }));
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-muted"
                        >
                          <span className="block text-sm font-semibold text-foreground">{entry.guardian}</span>
                          <span className="block text-xs text-muted-foreground">
                            {entry.children.map((child) => child.name).join(", ")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {errors.family && <p className="text-xs text-danger-foreground">{errors.family}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Template</label>
          <Select
            defaultValue=""
            onChange={(e) => {
              const template = templates.find((entry) => entry.label === e.target.value);
              if (template) {
                setSubject(template.subject);
                setBody(template.body);
              }
            }}
          >
            <option value="" disabled>
              Start from a template…
            </option>
            {templates.map((template) => (
              <option key={template.label}>{template.label}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notice-subject" className="text-sm font-semibold text-foreground">
            Subject
          </label>
          <Input
            id="notice-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={cn(errors.subject && "border-danger-foreground/60")}
          />
          {errors.subject && <p className="text-xs text-danger-foreground">{errors.subject}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notice-body" className="text-sm font-semibold text-foreground">
            Message
          </label>
          <Textarea
            id="notice-body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn(errors.body && "border-danger-foreground/60")}
          />
          {errors.body && <p className="text-xs text-danger-foreground">{errors.body}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Channels</p>
          <div className="flex flex-wrap gap-2">
            {channelOptions.map((option) => {
              const on = channels.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setChannels((prev) => (on ? prev.filter((id) => id !== option.id) : [...prev, option.id]))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
          {errors.channels && <p className="text-xs text-danger-foreground">{errors.channels}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            {recipients > 0 ? `${recipients} ${recipients === 1 ? "family" : "families"} will receive this notice.` : "No recipients selected yet."}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending} className="gap-2">
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Sending…" : "Send notice"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
