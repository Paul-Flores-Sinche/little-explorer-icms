"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import { cn } from "@/lib/utils";

const rules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "An uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "A number", test: (value: string) => /\d/.test(value) },
];

type Field = "current" | "next" | "confirm";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<Field, string>>({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!values.current) next.current = "Enter your current password.";
    if (!rules.every((rule) => rule.test(values.next))) next.next = "Your new password doesn't meet the requirements.";
    else if (values.next === values.current) next.next = "Choose a password you haven't used before.";
    if (!values.confirm) next.confirm = "Re-enter your new password.";
    else if (values.confirm !== values.next) next.confirm = "The new passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast({ title: "Password changed", description: "Use your new password next time you log in." });
      router.push("/family/profile");
    }, 900);
  }

  const inputs: { id: Field; label: string; autoComplete: string }[] = [
    { id: "current", label: "Current password", autoComplete: "current-password" },
    { id: "next", label: "New password", autoComplete: "new-password" },
    { id: "confirm", label: "Confirm new password", autoComplete: "new-password" },
  ];

  return (
    <ProfileSubpage title="Change Password" description="Keep your Family Portal account secure">
      <Card className="p-5 md:p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-1.5">
              <label htmlFor={input.id} className="text-sm font-semibold text-foreground">
                {input.label}
              </label>
              <div className="relative">
                <Input
                  id={input.id}
                  type={visible ? "text" : "password"}
                  autoComplete={input.autoComplete}
                  value={values[input.id]}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, [input.id]: e.target.value }));
                    setErrors((prev) => ({ ...prev, [input.id]: undefined }));
                  }}
                  className={cn("pr-11", errors[input.id] && "border-danger-foreground/60")}
                />
                {input.id === "current" && (
                  <button
                    type="button"
                    aria-label={visible ? "Hide passwords" : "Show passwords"}
                    onClick={() => setVisible((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {errors[input.id] && <p className="text-xs text-danger-foreground">{errors[input.id]}</p>}
              {input.id === "next" && (
                <ul className="space-y-1 pt-1">
                  {rules.map((rule) => {
                    const ok = rule.test(values.next);
                    return (
                      <li
                        key={rule.label}
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          ok ? "text-success-foreground" : "text-muted-foreground",
                        )}
                      >
                        {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              {input.id === "confirm" && values.confirm && values.confirm === values.next && (
                <p className="flex items-center gap-1.5 text-xs text-success-foreground">
                  <Check className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Updating…" : "Confirm new password"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Demo only — no password is stored.</p>
        </form>
      </Card>
    </ProfileSubpage>
  );
}
