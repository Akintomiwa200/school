"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { getNotificationsPathForRole } from "@/shared/permissions";
import { useSession } from "next-auth/react";
import { UserRole } from "@/shared";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import {
  formatRelativeTime,
  markAnnouncementReadApi,
  useNotificationsStore,
} from "../notifications/notifications-live-store";
import { ConnectionBadge } from "../notifications/notifications-ui";

function DetailSkeleton() {
  return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
}

const PRIORITY_STYLES = {
  normal: "bg-muted text-muted-foreground",
  important: "bg-primary/15 text-primary",
  urgent: "bg-destructive/15 text-destructive",
} as const;

export function SharedAnnouncementDetail({
  announcementId,
  basePath = "/shared/announcements",
  notificationsPath,
}: {
  announcementId: string;
  basePath?: string;
  notificationsPath?: string;
}) {
  const isLoading = usePageLoading(300);
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const notifPath = notificationsPath ?? getNotificationsPathForRole(role);
  const { announcements, connection } = useNotificationsStore();
  const announcement = announcements.find((item) => item.id === announcementId);

  useEffect(() => {
    if (announcementId) void markAnnouncementReadApi(announcementId);
  }, [announcementId]);

  if (isLoading) return <DetailSkeleton />;

  if (!announcement) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Announcement not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been removed or is not available for your role.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={basePath}>Back to announcements</Link>
        </Button>
      </ManagementPanel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminBackLink href={basePath} label="Back to announcements" />
        <ConnectionBadge status={connection} />
      </div>

      <ManagementPanel className="border border-border">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.pinned ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-1 text-xs font-bold uppercase text-brand-orange">
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize",
              PRIORITY_STYLES[announcement.priority],
            )}
          >
            {announcement.priority}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {announcement.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {announcement.authorName} · {formatRelativeTime(announcement.createdAt)}
        </p>

        <article className="mt-6 whitespace-pre-wrap border-t border-border pt-6 text-sm leading-relaxed text-foreground sm:text-base">
          {announcement.body}
        </article>
      </ManagementPanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="h-10 rounded-xl bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Link href={notifPath}>View notifications</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-xl px-5">
          <Link href={basePath}>All announcements</Link>
        </Button>
      </div>
    </div>
  );
}
