"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, CheckCheck, Megaphone, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { NotificationType, UserRole } from "@/shared";
import {
  clearNotificationsApi,
  formatRelativeTime,
  getNotificationTone,
  getUnreadAnnouncementCount,
  getUnreadNotificationCount,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  useNotificationsStore,
} from "./notifications-live-store";
import { ConnectionBadge, NotificationsPanel } from "./notifications-ui";

type Filter = "all" | "unread" | "announcements";

function NotificationsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-24 rounded-[20px] bg-muted" />
      <div className="h-24 rounded-[20px] bg-muted" />
    </div>
  );
}

export function SharedNotifications() {
  const router = useRouter();
  const isLoading = usePageLoading();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const { notifications, announcements, connection } = useNotificationsStore();
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = getUnreadNotificationCount();
  const unreadAnnouncements = getUnreadAnnouncementCount();

  const items = useMemo(() => {
    if (filter === "announcements") {
      return announcements.map((item) => ({
        id: item.id,
        kind: "announcement" as const,
        title: item.title,
        message: item.body.slice(0, 160) + (item.body.length > 160 ? "…" : ""),
        createdAt: item.createdAt,
        isRead: item.isRead,
        link: `/shared/announcements/${item.id}`,
        type: NotificationType.ANNOUNCEMENT,
        actorName: item.authorName,
        actorAvatar: item.authorName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        priority: item.priority,
      }));
    }

    const list = notifications.map((item) => ({
      id: item.id,
      kind: "notification" as const,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
      isRead: item.isRead,
      link: item.link ?? "/shared/notifications",
      type: item.type,
      actorName: item.actorName,
      actorAvatar: item.actorAvatar,
      priority: undefined as string | undefined,
    }));

    if (filter === "unread") return list.filter((item) => !item.isRead);
    return list;
  }, [announcements, filter, notifications]);

  async function handleOpen(item: (typeof items)[number]) {
    if (item.kind === "notification") {
      await markNotificationReadApi(item.id);
    }
    router.push(item.link);
  }

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time alerts linked to announcements, messages, fees, and more.
          </p>
        </div>
        <ConnectionBadge status={connection} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NotificationsPanel>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unread</p>
          <p className="mt-2 text-2xl font-bold text-brand-purple">{unreadCount}</p>
        </NotificationsPanel>
        <NotificationsPanel>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Announcements</p>
          <p className="mt-2 text-2xl font-bold text-primary">{unreadAnnouncements} new</p>
        </NotificationsPanel>
        <NotificationsPanel>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total feed</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{notifications.length + announcements.length}</p>
        </NotificationsPanel>
      </div>

      <NotificationsPanel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "announcements", label: "Announcements" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  filter === tab.id
                    ? "bg-brand-purple text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={unreadCount === 0}
              onClick={() => void markAllNotificationsReadApi()}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={notifications.length === 0}
              onClick={() => void clearNotificationsApi()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button asChild size="sm" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href="/shared/announcements">
                <Megaphone className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-3 h-8 w-8 opacity-50" />
            You&apos;re all caught up.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => void handleOpen(item)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40",
                    !item.isRead && "bg-primary/5",
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {item.actorAvatar ?? "NT"}
                    </div>
                    {!item.isRead ? (
                      <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", getNotificationTone(item.type))}>
                        {item.type.toLowerCase()}
                      </span>
                      {item.priority === "urgent" ? (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                          Urgent
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.actorName ? `${item.actorName} · ` : ""}
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </NotificationsPanel>

      {role === UserRole.STUDENT ? (
        <p className="text-center text-sm text-muted-foreground">
          Announcements from school staff appear here instantly when published.
        </p>
      ) : null}
    </div>
  );
}
