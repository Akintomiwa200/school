"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Check, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import { getAnnouncementsPathForRole, getNotificationsPathForRole, resolveSharedPathForRole } from "@/shared/permissions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  clearNotificationsApi,
  formatRelativeTime,
  getNotificationTone,
  getUnreadNotificationCount,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  useNotificationsStore,
} from "@/components/dashboard/notifications/notifications-live-store";

function NotificationRow({
  title,
  message,
  time,
  unread,
  avatar,
  toneClass,
  typeName,
  onClick,
}: {
  title: string;
  message: string;
  time: string;
  unread: boolean;
  avatar: string;
  toneClass: string;
  typeName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset",
        unread && "bg-primary/5",
      )}
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xs font-bold">
          {avatar}
        </div>
        {unread ? (
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", toneClass)}>
            {typeName}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{time}</p>
      </div>
    </button>
  );
}

type NotificationDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  trigger: React.ReactNode;
};

export function NotificationDropdown({
  open,
  onOpenChange,
  onOpenSettings,
  trigger,
}: NotificationDropdownProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const notificationsPath = getNotificationsPathForRole(role);
  const announcementsPath = getAnnouncementsPathForRole(role);
  const { notifications, connection } = useNotificationsStore();

  const unreadCount = getUnreadNotificationCount();
  const preview = notifications.slice(0, 6);

  const handleNotificationClick = (id: string, href: string) => {
    void markNotificationReadApi(id);
    onOpenChange(false);
    router.push(href);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    router.push(notificationsPath);
  };

  const handleClear = () => {
    void clearNotificationsApi();
    toast.success("Notifications cleared");
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    void markAllNotificationsReadApi();
    toast.success("All notifications marked as read");
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Notifications</h2>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} new
              </span>
            ) : null}
            {connection === "connected" ? (
              <span className="rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-green">
                Live
              </span>
            ) : null}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notification options"
              >
                <Settings size={18} strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onOpenChange(false);
                  onOpenSettings();
                }}
              >
                Notification preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClear} disabled={notifications.length === 0}>
                Clear all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="max-h-[min(24rem,60vh)] divide-y divide-border overflow-y-auto">
          {preview.length > 0 ? (
            preview.map((item) => (
              <NotificationRow
                key={item.id}
                title={item.title}
                message={item.message}
                time={formatRelativeTime(item.createdAt)}
                unread={!item.isRead}
                avatar={item.actorAvatar ?? "NT"}
                toneClass={getNotificationTone(item.type)}
                typeName={item.type.toLowerCase()}
                onClick={() => handleNotificationClick(item.id, item.link ? resolveSharedPathForRole(item.link, role) : notificationsPath)}
              />
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              {connection === "connecting" ? "Connecting to live feed…" : "You&apos;re all caught up."}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <Button type="button" variant="link" className="h-auto p-0 text-sm font-medium" onClick={handleViewAll}>
            View all
          </Button>
          <Button type="button" variant="ghost-sm" size="sm" onClick={() => router.push(announcementsPath)}>
            Announcements
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Kept for any legacy imports — dropdown now uses the live store directly.
export function getInitialNotificationsForRole(_role: UserRole) {
  return [];
}
