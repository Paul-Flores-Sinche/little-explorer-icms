"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useFamilyStore } from "@/components/family/family-store";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Field = "name" | "address" | "email" | "phone";

const fields: { id: Field; label: string; type: string; autoComplete: string }[] = [
  { id: "name", label: "Full name", type: "text", autoComplete: "name" },
  { id: "address", label: "Home address", type: "text", autoComplete: "street-address" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "phone", label: "Mobile number", type: "tel", autoComplete: "tel" },
];

function PersonalDetailsForm() {
  const { profile, updateProfile } = useFamilyStore();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<Field, string>>({
    name: profile.name,
    address: profile.address,
    email: profile.email,
    phone: profile.phone,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);

  const dirty = fields.some(({ id }) => values[id] !== profile[id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (values.name.trim().split(/\s+/).length < 2) next.name = "Enter your first and last name.";
    if (values.address.trim().length < 8) next.address = "Enter your full home address.";
    if (!isValidEmail(values.email)) next.email = "Enter a valid email address.";
    if (!isValidPhone(values.phone)) next.phone = "Enter a valid Australian phone number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    window.setTimeout(() => {
      updateProfile({
        name: values.name.trim(),
        address: values.address.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      setSaving(false);
      toast({
        title: "Personal details updated",
        description: "The centre's records now show your new details.",
      });
    }, 700);
  }

  return (
    <Card className="p-5 md:p-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={field.id} className="text-sm font-semibold text-foreground">
              {field.label}
            </label>
            <Input
              id={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              value={values[field.id]}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, [field.id]: e.target.value }));
                setErrors((prev) => ({ ...prev, [field.id]: undefined }));
              }}
              className={cn(errors[field.id] && "border-danger-foreground/60")}
            />
            {errors[field.id] && <p className="text-xs text-danger-foreground">{errors[field.id]}</p>}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Changes to your email or phone also update where invoices and alerts are sent.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={!dirty || saving}
            onClick={() => {
              setValues({ name: profile.name, address: profile.address, email: profile.email, phone: profile.phone });
              setErrors({});
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function PersonalDetailsPage() {
  const { profile } = useFamilyStore();
  return (
    <ProfileSubpage title="Personal Details" description="Primary account holder">
      {/* Re-mount when the stored profile hydrates or changes so the form starts from it. */}
      <PersonalDetailsForm key={JSON.stringify([profile.name, profile.address, profile.email, profile.phone])} />
    </ProfileSubpage>
  );
}
