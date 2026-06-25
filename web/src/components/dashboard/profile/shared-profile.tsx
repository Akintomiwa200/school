"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Bell, Camera, ChevronRight, Mail, Phone, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { UserRole } from "@/shared";
import { getAccountSummary, getProfileExtras } from "./profile-data";
import { ProfileAccountSections } from "./profile-account-sections";
import {
  ProfileActionLink,
  ProfilePanel,
  formatRoleLabel,
  getProfileInitials,
} from "./profile-ui";

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-40 rounded-lg bg-muted" />
      <div className="h-36 rounded-[20px] bg-muted" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64 rounded-[20px] bg-muted" />
        <div className="h-48 rounded-[20px] bg-muted" />
      </div>
    </div>
  );
}

/** Account profile for staff, parents, and other non-student roles. */
export function SharedProfile() {
  const isLoading = usePageLoading();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const extras = getProfileExtras(role);
  const summary = getAccountSummary(role, extras);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto min-w-0 w-full max-w-7xl">
        <ProfileSkeleton />
      </div>
    );
  }

  const displayName = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "No email on file";

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Your account details, contact information, and security settings.
          </p>
        </div>
        <Button asChild variant="outline" className="h-9 shrink-0 rounded-full px-4">
          <Link href="/shared/settings" className="inline-flex items-center gap-2">
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        </Button>
      </div>

      <ProfilePanel className="border border-border bg-gradient-to-r from-brand-purple/10 via-brand-blue/5 to-transparent">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-4 ring-background sm:h-24 sm:w-24">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-purple">
                  {getProfileInitials(displayName)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.message("Photo upload will be available when storage is connected.")}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold sm:text-2xl">{displayName}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" />
                {extras.phone}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-brand-purple/15 px-3 py-1 text-xs font-semibold text-brand-purple">
                {formatRoleLabel(role)}
              </span>
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Member since {extras.memberSince}
              </span>
            </div>
          </div>
        </div>
      </ProfilePanel>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
        <ProfileAccountSections />

        <div className="min-w-0 space-y-5">
          <ProfilePanel className="border border-border">
            <h2 className="text-base font-bold">Account summary</h2>
            <dl className="mt-4 space-y-3">
              {summary.map((item) => (
                <div key={item.label} className="rounded-2xl bg-muted/30 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </ProfilePanel>

          <ProfilePanel className="space-y-3 border border-border">
            <h2 className="text-base font-bold">Quick links</h2>
            <ProfileActionLink href="/shared/settings">
              <Settings className="h-4 w-4 shrink-0" />
              Account settings
              <ChevronRight className="h-4 w-4 shrink-0" />
            </ProfileActionLink>
            <ProfileActionLink href="/shared/notifications" variant="outline">
              <Bell className="h-4 w-4 shrink-0" />
              Notifications
            </ProfileActionLink>
          </ProfilePanel>
        </div>
      </div>
    </div>
  );
}
