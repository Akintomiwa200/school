"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleDollarSign,
  Settings,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import {
  getNotificationsPathForRole,
  getRoleDashboardPath,
  ROLE_ROUTES,
  SHARED_ROUTES,
} from "@/shared/permissions";
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

type NotificationBadge = {
  icon: "check" | "dollar" | "follow";
  tone: "blue" | "green";
};

type UserNotificationItem = {
  id: string;
  kind: "user";
  actor: string;
  action: string;
  actionAfter?: string;
  subject?: string;
  highlight?: string;
  time: string;
  avatar: string;
  avatarColor: string;
  badge?: NotificationBadge;
  unread?: boolean;
  href: string;
};

type NotificationItem =
  | UserNotificationItem
  | {
      id: string;
      kind: "system";
      message: React.ReactNode;
      time: string;
      unread?: boolean;
      href: string;
    };

function resolveNotificationHref(role: UserRole, path: string): string {
  const allowedPaths = new Set([
    ...(ROLE_ROUTES[role] ?? []).map((route) => route.path),
    ...SHARED_ROUTES.map((route) => route.path),
  ]);

  return allowedPaths.has(path) ? path : getNotificationsPathForRole(role);
}

function getInitialNotifications(role: UserRole): NotificationItem[] {
  const base = getRoleDashboardPath(role);

  return [
    {
      id: "1",
      kind: "user",
      actor: "Gladys Dare",
      action: "commented on ",
      subject: "Ecosystems and conservation",
      time: "1m ago",
      avatar: "GD",
      avatarColor: "bg-sky-100 text-sky-700",
      badge: { icon: "check", tone: "blue" },
      unread: true,
      href: resolveNotificationHref(role, `${base}/courses`),
    },
    {
      id: "2",
      kind: "user",
      actor: "Rosina Wisoky",
      action: "followed you",
      time: "20m ago",
      avatar: "RW",
      avatarColor: "bg-violet-100 text-violet-700",
      badge: { icon: "follow", tone: "green" },
      unread: true,
      href: resolveNotificationHref(role, "/shared/messages"),
    },
    {
      id: "3",
      kind: "system",
      message: (
        <>
          You received a grade of <strong>92%</strong> for{" "}
          <strong className="text-rose-500">Mathematics Quiz 4</strong>
        </>
      ),
      time: "25m ago",
      unread: true,
      href: resolveNotificationHref(role, `${base}/grades`),
    },
    {
      id: "4",
      kind: "user",
      actor: "Laurel Welch",
      action: "donated ",
      highlight: "$100.00",
      actionAfter: " for ",
      subject: "Carbon removal",
      time: "2h ago",
      avatar: "LW",
      avatarColor: "bg-emerald-100 text-emerald-700",
      badge: { icon: "dollar", tone: "green" },
      unread: false,
      href: resolveNotificationHref(
        role,
        role === UserRole.STUDENT || role === UserRole.PARENT
          ? `${base}/fees`
          : role === UserRole.ACCOUNTANT
            ? `${base}/payments`
            : "/shared/events",
      ),
    },
    {
      id: "5",
      kind: "user",
      actor: "Mr. Thompson",
      action: "posted a new assignment in ",
      subject: "Advanced Biology",
      time: "3h ago",
      avatar: "MT",
      avatarColor: "bg-amber-100 text-amber-700",
      badge: { icon: "check", tone: "blue" },
      unread: false,
      href: resolveNotificationHref(role, `${base}/assignments`),
    },
  ];
}

export function getInitialNotificationsForRole(role: UserRole): NotificationItem[] {
  return getInitialNotifications(role);
}

function NotificationBadgeIcon({ badge }: { badge: NotificationBadge }) {
  const Icon = badge.icon === "dollar" ? CircleDollarSign : badge.icon === "follow" ? UserPlus : Check;

  return (
    <span
      className={cn(
        "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white text-white",
        badge.tone === "blue" ? "bg-sky-500" : "bg-emerald-500",
      )}
    >
      <Icon size={9} strokeWidth={3} />
    </span>
  );
}

function NotificationAvatar({
  avatar,
  avatarColor,
  badge,
}: {
  avatar: string;
  avatarColor: string;
  badge?: NotificationBadge;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold",
          avatarColor,
        )}
      >
        {avatar}
      </div>
      {badge ? <NotificationBadgeIcon badge={badge} /> : null}
    </div>
  );
}

function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}) {
  const isUnread = item.unread ?? false;
  const rowClass = cn(
    "flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset",
    isUnread && "bg-primary/5",
  );

  if (item.kind === "system") {
    return (
      <button type="button" onClick={() => onClick(item)} className={rowClass}>
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={20} strokeWidth={2.5} />
          </div>
          {isUnread ? (
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm leading-relaxed text-foreground">{item.message}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{item.time}</p>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onClick(item)} className={rowClass}>
      <div className="relative shrink-0">
        <NotificationAvatar avatar={item.avatar} avatarColor={item.avatarColor} badge={item.badge} />
        {isUnread ? (
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm leading-relaxed text-foreground">
          <strong>{item.actor}</strong> {item.action}
          {item.highlight ? (
            <>
              <strong>{item.highlight}</strong>
              {item.actionAfter ?? null}
            </>
          ) : null}
          {item.subject ? <strong>{item.subject}</strong> : null}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{item.time}</p>
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

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getInitialNotifications(role),
  );

  useEffect(() => {
    setNotifications(getInitialNotifications(role));
  }, [role]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((items) =>
      items.map((entry) => (entry.id === item.id ? { ...entry, unread: false } : entry)),
    );
    onOpenChange(false);
    router.push(item.href);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    router.push(notificationsPath);
  };

  const handleClear = () => {
    setNotifications([]);
    toast.success("Notifications cleared");
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
    toast.success("All notifications marked as read");
  };

  const handleMarkUnreadAsRead = () => {
    if (unreadCount === 0) return;
    setNotifications((items) =>
      items.map((item) => (item.unread ? { ...item, unread: false } : item)),
    );
    toast.success("Unread notifications marked as read");
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
              <DropdownMenuItem onClick={handleMarkUnreadAsRead} disabled={unreadCount === 0}>
                Mark unread as read
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
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <NotificationRow key={item.id} item={item} onClick={handleNotificationClick} />
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up. No notifications right now.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-medium"
            onClick={handleViewAll}
          >
            View all
          </Button>
          <Button
            type="button"
            variant="ghost-sm"
            size="sm"
            onClick={handleClear}
            disabled={notifications.length === 0}
          >
            Clear notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
