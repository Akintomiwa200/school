"use client";

import Image from "next/image";
import { useState } from "react";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { NavbarModals, type NavbarModal } from "./navbar-modals";
import { NotificationDropdown } from "./notification-dropdown";
import { ProfileDropdown } from "./profile-dropdown";

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
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<NavbarModal>(null);

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

            <label className="relative w-[200px] sm:w-[260px]">
              <span className="sr-only">Search dashboard</span>
              <input
                type="search"
                placeholder="tap here to search"
                className="h-11 w-full rounded-full border border-sidebar-border bg-sidebar-accent py-2.5 pl-4 pr-11 text-sm text-sidebar-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <Search
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationDropdown
              open={notificationsOpen}
              onOpenChange={(open) => {
                setNotificationsOpen(open);
                if (open) setProfileOpen(false);
              }}
              onOpenSettings={() => {
                closePanels();
                setActiveModal("settings");
              }}
              trigger={
                <button
                  type="button"
                  className={iconButtonClass(notificationsOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>
              }
            />
            <button
              type="button"
              onClick={() => {
                closePanels();
                setActiveModal("settings");
              }}
              className={iconButtonClass(activeModal === "settings")}
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
              onOpenSettings={() => {
                closePanels();
                setActiveModal("settings");
              }}
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

      <NavbarModals activeModal={activeModal} onOpenChange={setActiveModal} />
    </>
  );
}
