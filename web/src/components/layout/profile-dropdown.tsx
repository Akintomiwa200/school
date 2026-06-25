"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Settings, Shield, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import { getLoginPathForRole, getProfilePathForRole } from "@/shared/permissions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ProfileDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  trigger: React.ReactNode;
};

function getProfileLinks(role: UserRole) {
  const base = getProfilePathForRole(role);
  return [
    { label: "Personal info", description: "Name, email, and phone", href: `${base}#personal-info`, icon: User },
    { label: "Security", description: "Password and sessions", href: `${base}#security`, icon: Shield },
  ] as const;
}

export function ProfileDropdown({
  open,
  onOpenChange,
  onOpenSettings,
  trigger,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const profilePath = getProfilePathForRole(role);
  const profileLinks = getProfileLinks(role);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      onOpenChange(false);
      router.push(getLoginPathForRole(role));
      router.refresh();
    } catch {
      toast.error("Error logging out");
    }
  };

  const handleViewProfile = () => {
    onOpenChange(false);
    router.push(profilePath);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-foreground">Profile</h2>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Profile options"
              >
                <Settings size={18} strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleViewProfile}>View profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onOpenChange(false);
                  router.push(profilePath);
                }}
              >
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onOpenChange(false);
                  onOpenSettings();
                }}
              >
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-white">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Profile"}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  {getInitials(session?.user?.name)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {session?.user?.name ?? "User"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <Mail size={12} className="shrink-0" />
                {session?.user?.email ?? "No email on file"}
              </p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {role.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[min(16rem,50vh)] divide-y divide-border overflow-y-auto">
          {profileLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <item.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-medium"
            onClick={handleViewProfile}
          >
            View profile
          </Button>
          <Button type="button" variant="ghost-sm" size="sm" onClick={handleSignOut}>
            <LogOut size={14} />
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
