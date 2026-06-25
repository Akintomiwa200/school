"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, Megaphone, Pin, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { canPublishAnnouncements } from "@/lib/notifications/realtime-constants";
import {
  formatRelativeTime,
  getUnreadAnnouncementCount,
  markAnnouncementReadApi,
  publishAnnouncementApi,
  type LiveAnnouncement,
  useNotificationsStore,
} from "../notifications/notifications-live-store";
import {
  ConnectionBadge,
  NotificationsActionLink,
  NotificationsPanel,
} from "../notifications/notifications-ui";

function AnnouncementsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-56 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-20 rounded-[20px] bg-muted" />
        <div className="h-20 rounded-[20px] bg-muted" />
        <div className="h-20 rounded-[20px] bg-muted" />
      </div>
      <div className="h-28 rounded-[20px] bg-muted" />
    </div>
  );
}

function AnnouncementCard({
  item,
  onOpen,
}: {
  item: LiveAnnouncement;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={cn(
        "flex w-full flex-col rounded-[20px] border border-border bg-card p-5 text-left shadow-float transition-colors hover:bg-muted/30",
        !item.isRead && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.pinned ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            ) : null}
            {item.priority !== "normal" ? (
              <span
                className={cn(
                  "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  item.priority === "urgent"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-brand-purple/15 text-brand-purple",
                )}
              >
                {item.priority}
              </span>
            ) : null}
            {!item.isRead ? (
              <span className="inline-flex shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                New
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-foreground sm:text-lg">
            {item.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {item.authorName} · {formatRelativeTime(item.createdAt)}
          </p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
      </div>
    </button>
  );
}

export function SharedAnnouncements() {
  const router = useRouter();
  const isLoading = usePageLoading();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const canPublish = canPublishAnnouncements(role);
  const { announcements, connection } = useNotificationsStore();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const unreadCount = getUnreadAnnouncementCount();
  const pinnedItems = useMemo(() => announcements.filter((item) => item.pinned), [announcements]);
  const latestItems = useMemo(() => announcements.filter((item) => !item.pinned), [announcements]);

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await publishAnnouncementApi({ title, body, priority, pinned });
      setTitle("");
      setBody("");
      setPriority("normal");
      setPinned(false);
      toast.success("Announcement published — notifications sent in real time");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function openAnnouncement(id: string) {
    await markAnnouncementReadApi(id);
    router.push(`/shared/announcements/${id}`);
  }

  if (isLoading) return <AnnouncementsSkeleton />;

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            School-wide updates — publishing here notifies everyone connected in real time.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ConnectionBadge status={connection} />
          <Button asChild variant="outline" className="h-9 shrink-0 rounded-full px-4">
            <Link href="/shared/notifications">Notifications</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NotificationsPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{announcements.length}</p>
        </NotificationsPanel>
        <NotificationsPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unread</p>
          <p className="mt-2 text-2xl font-bold text-brand-purple">{unreadCount}</p>
        </NotificationsPanel>
        <NotificationsPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pinned</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">{pinnedItems.length}</p>
        </NotificationsPanel>
      </div>

      {canPublish ? (
        <NotificationsPanel className="border border-border">
          <h2 className="text-base font-bold">Publish announcement</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students, parents, and staff receive a linked notification instantly.
          </p>
          <form onSubmit={handlePublish} className="mt-4 space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="h-11 w-full rounded-full"
              disabled={submitting}
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the announcement…"
              className="min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              disabled={submitting}
            />
            <div className="flex flex-wrap items-center gap-2">
              {(["normal", "important", "urgent"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                    priority === level
                      ? "bg-brand-purple text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {level}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinned((value) => !value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  pinned ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <Pin className="h-3.5 w-3.5" />
                Pin to top
              </button>
            </div>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
              className="h-11 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90 sm:w-auto sm:px-6"
            >
              <Send className="mr-2 h-4 w-4 shrink-0" />
              Publish live
            </Button>
          </form>
        </NotificationsPanel>
      ) : null}

      {announcements.length === 0 ? (
        <NotificationsPanel className="border border-border text-center text-sm text-muted-foreground">
          <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No announcements yet.
        </NotificationsPanel>
      ) : (
        <div className="space-y-6">
          {pinnedItems.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Pinned</h2>
              <ul className="space-y-3">
                {pinnedItems.map((item) => (
                  <li key={item.id}>
                    <AnnouncementCard item={item} onOpen={(id) => void openAnnouncement(id)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {latestItems.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Latest</h2>
              <ul className="space-y-3">
                {latestItems.map((item) => (
                  <li key={item.id}>
                    <AnnouncementCard item={item} onOpen={(id) => void openAnnouncement(id)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <NotificationsPanel className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold">Notification inbox</p>
          <p className="mt-1 text-sm text-muted-foreground">
            See alerts triggered by new announcements and other school activity.
          </p>
        </div>
        <NotificationsActionLink href="/shared/notifications" className="sm:w-auto sm:min-w-[200px]">
          Open notifications
          <ChevronRight className="h-4 w-4 shrink-0" />
        </NotificationsActionLink>
      </NotificationsPanel>
    </div>
  );
}
