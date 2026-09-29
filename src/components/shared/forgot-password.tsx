"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, MessageSquare, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { isValidEmail, isValidPhone, maskEmail, maskPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface ForgotPasswordProps {
  portal: "family" | "staff";
  defaultEmail: string;
  phoneHint: string;
}

type Channel = "email" | "sms";

/** "Forgot your password?" link + two-step recovery dialog (simulated). */
export function ForgotPassword({ portal, defaultEmail, phoneHint }: ForgotPasswordProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "sending" | "sent">("confirm");
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  function close() {
    setOpen(false);
    setStep("confirm");
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (channel === "email" && !isValidEmail(email)) {
      setError("Enter the email address linked to your account.");
      return;
    }
    if (channel === "sms" && !isValidPhone(phone)) {
      setError("Enter a valid Australian mobile number, e.g. 0412 345 678.");
      return;
    }
    setError(null);
    setStep("sending");
    window.setTimeout(() => setStep("sent"), 1200);
  }

  const destination = channel === "email" ? maskEmail(email) : maskPhone(phone);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-primary hover:underline"
      >
        Forgot your password?
      </button>

      <Dialog
        open={open}
        onClose={close}
        size="sm"
        title={step === "sent" ? "Check your messages" : "Reset your password"}
        description={
          step === "sent"
            ? undefined
            : `Step 1 of 2 · Confirm the contact details on your ${portal === "family" ? "Family Portal" : "staff"} account`
        }
      >
        {step === "sent" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <MailCheck className="h-8 w-8 text-success-foreground" />
            </span>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Step 2 of 2</p>
            <p className="mt-2 text-foreground">
              We&apos;ve sent a password reset link to <span className="font-semibold">{destination}</span>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The link expires in 30 minutes. If it doesn&apos;t arrive, check your spam folder or
              {portal === "family" ? " call the centre on (08) 8981 4420." : " contact the Centre Director."}
            </p>
            <div className="mt-6 flex w-full flex-col gap-2">
              <Button onClick={close}>Back to log in</Button>
              <Button
                variant="ghost"
                onClick={() => toast({ title: "Reset link sent again", description: `A new link was sent to ${destination}.` })}
              >
                Resend link
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Demo only — no email or SMS is actually sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose where we should send your reset link.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "email", label: "Email", icon: Mail },
                  { id: "sms", label: "SMS", icon: MessageSquare },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setChannel(option.id);
                    setError(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                    channel === option.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>

            {channel === "email" ? (
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-sm font-semibold text-foreground">
                  Account email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(error && "border-danger-foreground/60")}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="reset-phone" className="text-sm font-semibold text-foreground">
                  Mobile number
                </label>
                <Input
                  id="reset-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder={phoneHint}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cn(error && "border-danger-foreground/60")}
                />
                <p className="text-xs text-muted-foreground">Must match the number on your account.</p>
              </div>
            )}
            {error && <p className="text-xs text-danger-foreground">{error}</p>}

            <Button type="submit" className="w-full" disabled={step === "sending"}>
              {step === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === "sending" ? "Sending link…" : "Send reset link"}
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
