"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  formatRelativeTime,
  markAnnouncementReadApi,
  useNotificationsStore,
} from "../notifications/notifications-live-store";
import { ConnectionBadge, NotificationsPanel } from "../notifications/notifications-ui";

function DetailSkeleton() {
  return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
}

export function SharedAnnouncementDetail({ announcementId }: { announcementId: string }) {
  const isLoading = usePageLoading();
  const { announcements, connection } = useNotificationsStore();
  const announcement = announcements.find((item) => item.id === announcementId);

  useEffect(() => {
    if (announcementId) void markAnnouncementReadApi(announcementId);
  }, [announcementId]);

  if (isLoading) return <DetailSkeleton />;

  if (!announcement) {
    return (
      <NotificationsPanel className="text-center">
        <h2 className="text-lg font-bold">Announcement not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed or is not available for your role.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/shared/announcements">Back to announcements</Link>
        </Button>
      </NotificationsPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/shared/announcements" className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Back to announcements
      </Link>

      <div className="flex items-center justify-between gap-3">
        <ConnectionBadge status={connection} />
      </div>

      <NotificationsPanel className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.pinned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-1 text-xs font-bold uppercase text-brand-orange">
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </span>
          ) : null}
          {announcement.priority !== "normal" ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold uppercase",
                announcement.priority === "urgent"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-brand-purple/15 text-brand-purple",
              )}
            >
              {announcement.priority}
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{announcement.title}</h1>
        <p className="text-sm text-muted-foreground">
          {announcement.authorName} · {formatRelativeTime(announcement.createdAt)}
        </p>
        <article className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
          {announcement.body}
        </article>
      </NotificationsPanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href="/shared/notifications">View related notifications</Link>
        </Button>
      </div>
    </div>
  );
}
