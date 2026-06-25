"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, Phone, Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/shared";
import { DEMO_SESSIONS, getProfileExtras } from "./profile-data";
import { ProfilePanel } from "./profile-ui";

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-full pl-9"
        />
      </div>
    </div>
  );
}

export function ProfileAccountSections() {
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const extras = getProfileExtras(role);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(extras.phone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fullName = session?.user?.name ?? "Alex Johnson";
    const parts = fullName.split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setEmail(session?.user?.email ?? "alex.johnson@school.edu");
    setPhone(extras.phone);
  }, [session, extras.phone]);

  async function handleSavePersonalInfo(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    toast.success("Profile updated");
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-2">
      <ProfilePanel id="personal-info" className="scroll-mt-6 space-y-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold">Personal info</h2>
            <p className="mt-1 text-sm text-muted-foreground">Name, email, and phone on your account.</p>
          </div>
        </div>

        <form onSubmit={handleSavePersonalInfo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" icon={User} value={firstName} onChange={setFirstName} />
            <Field id="lastName" label="Last name" icon={User} value={lastName} onChange={setLastName} />
          </div>
          <Field id="email" label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} />
          <Field id="phone" label="Phone number" icon={Phone} type="tel" value={phone} onChange={setPhone} />
          <Button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90 sm:w-auto sm:px-6"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </ProfilePanel>

      <ProfilePanel id="security" className="scroll-mt-6 space-y-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold">Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">Password and signed-in devices.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium">Password</p>
            <p className="mt-1 text-sm text-muted-foreground">Last changed 3 months ago</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full shrink-0 rounded-full px-4 sm:w-auto"
            onClick={() => toast.message("Password change will open in account security settings.")}
          >
            <KeyRound className="mr-2 h-4 w-4 shrink-0" />
            Change password
          </Button>
        </div>

        <ul className="space-y-2">
          {DEMO_SESSIONS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-2xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.device}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.location} · {item.lastActive}
                </p>
              </div>
              {item.current ? (
                <span className="inline-flex shrink-0 rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold text-green">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-destructive hover:underline"
                  onClick={() => toast.message("Session revoked (demo)")}
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </ProfilePanel>
    </div>
  );
}
