"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eye, Megaphone, Pin, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { getNotificationsPathForRole } from "@/shared/permissions";
import { canPublishAnnouncements } from "@/lib/notifications/realtime-constants";
import {
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterPills,
  AdminSearchBar,
  AdminTablePagination,
} from "../admin/admin-list-ui";
import { AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import {
  formatRelativeTime,
  getUnreadAnnouncementCount,
  markAnnouncementReadApi,
  publishAnnouncementApi,
  type LiveAnnouncement,
  useNotificationsStore,
} from "../notifications/notifications-live-store";
import { ConnectionBadge } from "../notifications/notifications-ui";

function AnnouncementsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-72 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-[20px] bg-muted" />
    </div>
  );
}

const PRIORITY_STYLES = {
  normal: "bg-muted text-muted-foreground",
  important: "bg-primary/15 text-primary",
  urgent: "bg-destructive/15 text-destructive",
} as const;

export function SharedAnnouncements({
  basePath = "/shared/announcements",
  notificationsPath,
}: {
  basePath?: string;
  notificationsPath?: string;
}) {
  const router = useRouter();
  const isLoading = usePageLoading(400);
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const notifPath = notificationsPath ?? getNotificationsPathForRole(role);
  const canPublish = canPublishAnnouncements(role);
  const { announcements, connection } = useNotificationsStore();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "pinned">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "normal" | "important" | "urgent">("all");
  const [page, setPage] = useState(1);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, priorityFilter]);

  const unreadCount = getUnreadAnnouncementCount();
  const pinnedCount = useMemo(() => announcements.filter((a) => a.pinned).length, [announcements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((item) => {
      if (statusFilter === "unread" && item.isRead) return false;
      if (statusFilter === "pinned" && !item.pinned) return false;
      if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q)
      );
    });
  }, [announcements, query, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

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
    router.push(`${basePath}/${id}`);
  }

  if (isLoading) return <AnnouncementsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ManagementPageHeader
          title="Announcements"
          description="School-wide updates — publishing notifies everyone connected in real time."
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ConnectionBadge status={connection} />
          <Button asChild variant="outline" className="h-9 shrink-0 rounded-xl px-4">
            <Link href={notifPath}>Notifications</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementStatCard label="Total" value={String(announcements.length)} tone="purple" icon={Megaphone} />
        <ManagementStatCard label="Unread" value={String(unreadCount)} hint="For your account" tone="blue" icon={Megaphone} />
        <ManagementStatCard label="Pinned" value={String(pinnedCount)} tone="orange" icon={Pin} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <div className="space-y-5 xl:col-span-8">
          <ManagementPanel className="border border-border">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Announcement feed</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{filtered.length} announcements</h2>
              </div>
              <AdminSearchBar value={query} onChange={setQuery} placeholder="Search title, body, author…" />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <AdminFilterPills
                  options={[
                    { id: "all", label: "All" },
                    { id: "unread", label: "Unread" },
                    { id: "pinned", label: "Pinned" },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                <div className="flex flex-wrap gap-2">
                  {(["all", "normal", "important", "urgent"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriorityFilter(level)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                        priorityFilter === level
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border p-0">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-40" />
                No announcements match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Announcement</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Posted</th>
                      <th className="px-4 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item) => (
                      <AnnouncementRow key={item.id} item={item} onOpen={openAnnouncement} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filtered.length > 0 ? (
              <AdminTablePagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={ADMIN_PAGE_SIZE}
                onPageChange={setPage}
              />
            ) : null}
          </ManagementPanel>
        </div>

        <div className="space-y-5 xl:col-span-4">
          {canPublish ? (
            <ManagementPanel className="border border-border">
              <h2 className="text-base font-bold text-foreground">Publish announcement</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Students, parents, and staff receive a linked notification instantly.
              </p>
              <form onSubmit={handlePublish} className="mt-4 space-y-4">
                <AdminFormField label="Title">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className={adminInputClass}
                    disabled={submitting}
                  />
                </AdminFormField>
                <AdminFormField label="Message">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write the announcement…"
                    className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={submitting}
                  />
                </AdminFormField>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Priority</p>
                  <div className="flex flex-wrap gap-2">
                    {(["normal", "important", "urgent"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPriority(level)}
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                          priority === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPinned((v) => !v)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    pinned ? "bg-brand-orange/15 text-brand-orange" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Pin className="h-3.5 w-3.5" />
                  Pin to top
                </button>
                <Button
                  type="submit"
                  disabled={submitting || !title.trim() || !body.trim()}
                  className="h-10 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="mr-2 h-4 w-4 shrink-0" />
                  Publish live
                </Button>
              </form>
            </ManagementPanel>
          ) : null}

          <ManagementPanel className="border border-border bg-gradient-to-br from-brand-purple/8 via-primary/5 to-brand-blue/8">
            <p className="text-sm font-semibold text-foreground">Notification inbox</p>
            <p className="mt-1 text-sm text-muted-foreground">
              See alerts triggered by announcements and other school activity.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 h-9 rounded-xl">
              <Link href={notifPath}>Open notifications</Link>
            </Button>
          </ManagementPanel>
        </div>
      </div>
    </div>
  );
}

function AnnouncementRow({
  item,
  onOpen,
}: {
  item: LiveAnnouncement;
  onOpen: (id: string) => void;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border last:border-0 hover:bg-muted/20",
        !item.isRead && "bg-primary/5",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-start gap-2">
          {item.pinned ? <Pin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> : null}
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{item.title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.authorName}
              {!item.isRead ? (
                <span className="ml-2 inline-flex rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                  New
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
            PRIORITY_STYLES[item.priority],
          )}
        >
          {item.priority}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {formatRelativeTime(item.createdAt)}
      </td>
      <td className="px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
          onClick={() => void onOpen(item.id)}
          aria-label={`View ${item.title}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
