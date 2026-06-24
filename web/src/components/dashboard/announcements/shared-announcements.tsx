"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Megaphone, Pin, Send } from "lucide-react";
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
  markAnnouncementReadApi,
  publishAnnouncementApi,
  useNotificationsStore,
} from "../notifications/notifications-live-store";
import { ConnectionBadge, NotificationsPanel } from "../notifications/notifications-ui";

function AnnouncementsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-56 rounded-lg bg-muted" />
      <div className="h-40 rounded-[20px] bg-muted" />
      <div className="h-28 rounded-[20px] bg-muted" />
    </div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            School-wide updates — publishing here notifies everyone connected in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge status={connection} />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/shared/notifications">Notifications</Link>
          </Button>
        </div>
      </div>

      {canPublish ? (
        <NotificationsPanel>
          <h2 className="text-base font-bold">Publish announcement</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students, parents, and staff receive a linked notification instantly.
          </p>
          <form onSubmit={handlePublish} className="mt-4 space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="rounded-full"
              disabled={submitting}
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the announcement…"
              className="min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              disabled={submitting}
            />
            <div className="flex flex-wrap items-center gap-2">
              {(["normal", "important", "urgent"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
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
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
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
              className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Publish live
            </Button>
          </form>
        </NotificationsPanel>
      ) : null}

      {announcements.length === 0 ? (
        <NotificationsPanel className="text-center text-sm text-muted-foreground">
          <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No announcements yet.
        </NotificationsPanel>
      ) : (
        <ul className="space-y-3">
          {announcements.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void openAnnouncement(item.id)}
                className={cn(
                  "w-full rounded-[20px] border border-border bg-card p-5 text-left shadow-float transition-colors hover:bg-muted/30",
                  !item.isRead && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      ) : null}
                      {item.priority !== "normal" ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            item.priority === "urgent"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-brand-purple/15 text-brand-purple",
                          )}
                        >
                          {item.priority}
                        </span>
                      ) : null}
                      {!item.isRead ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          New
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-foreground">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {item.authorName} · {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
