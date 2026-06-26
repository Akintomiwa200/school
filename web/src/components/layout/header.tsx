"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { getSettingsPathForRole } from "@/shared/permissions";
import { NavbarSearch } from "./navbar-search";
import { NotificationDropdown } from "./notification-dropdown";
import { ProfileDropdown } from "./profile-dropdown";
import {
  getUnreadNotificationCount,
  useNotificationsStore,
} from "@/components/dashboard/notifications/notifications-live-store";

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useNotificationsStore();
  const unreadNotificationCount = getUnreadNotificationCount();

  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;

  const openSettings = () => {
    closePanels();
    router.push(getSettingsPathForRole(role));
  };

  const iconButtonClass = (active: boolean) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
      active && "text-sidebar-foreground ring-2 ring-primary/30",
    );

  const closePanels = () => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/95 px-4 py-3 text-sidebar-foreground backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-foreground lg:hidden"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <Menu size={18} />
            </button>

            <NavbarSearch />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationDropdown
              open={notificationsOpen}
              onOpenChange={(open) => {
                setNotificationsOpen(open);
                if (open) setProfileOpen(false);
              }}
              onOpenSettings={openSettings}
              trigger={
                <button
                  type="button"
                  className={cn(iconButtonClass(notificationsOpen), "relative")}
                  aria-label={
                    unreadNotificationCount > 0
                      ? `Notifications, ${unreadNotificationCount} unread`
                      : "Notifications"
                  }
                >
                  <Bell size={18} />
                  {unreadNotificationCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-sidebar bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                      {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                    </span>
                  ) : null}
                </button>
              }
            />
            <button
              type="button"
              onClick={openSettings}
              className={iconButtonClass(false)}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            <ProfileDropdown
              open={profileOpen}
              onOpenChange={(open) => {
                setProfileOpen(open);
                if (open) setNotificationsOpen(false);
              }}
              onOpenSettings={openSettings}
              trigger={
                <button
                  type="button"
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-sidebar-border bg-sidebar-accent ring-2 ring-sidebar transition-colors hover:opacity-90",
                    profileOpen && "ring-primary/40",
                  )}
                  aria-label="Profile"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "Profile"}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
                      {getInitials(session?.user?.name)}
                    </span>
                  )}
                </button>
              }
            />
          </div>
        </div>
      </header>
    </>
  );
}
