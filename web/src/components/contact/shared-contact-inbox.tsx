"use client";

import { useMemo, useState } from "react";
import { Mail, MailOpen, MessageSquare, Reply } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useContactMessages, useUpdateContactMessage } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_STYLES,
  type ContactMessage,
  type ContactMessageStatus,
} from "@/lib/contact/contact-messages-data";
import { useContactLiveStore } from "@/components/contact/contact-live-store";
import {
  DashboardEmptyCopy,
  DashboardFilterSelect,
  DashboardSearchField,
  dashboardFilterBarClass,
} from "@/components/dashboard/form-controls";
import { ManagementPanel, ManagementStatCard } from "@/components/dashboard/management/management-ui";
import { SuperAdminListSkeleton, superAdminInitialLoading } from "@/components/dashboard/super-admin/super-admin-workflow-ui";

const EMPTY: ContactMessage[] = [];

function ContactLiveBadge({ isFetching }: { isFetching?: boolean }) {
  const { connection, lastSyncedAt } = useContactLiveStore();
  const timeLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connection === "error" ? "bg-brand-orange" : "bg-green",
          (isFetching || connection === "connecting" || connection === "reconnecting") && "animate-pulse",
          connection === "idle" && "opacity-40",
        )}
      />
      {connection === "error" ? "Reconnecting" : connection === "idle" ? "Offline" : "Live inbox"}
      {timeLabel ? <span className="text-muted-foreground/70">· {timeLabel}</span> : null}
    </span>
  );
}

function MessageDetail({
  message,
  onClose,
}: {
  message: ContactMessage;
  onClose: () => void;
}) {
  const updateMessage = useUpdateContactMessage(message.id);

  const setStatus = async (status: ContactMessageStatus) => {
    await updateMessage.mutateAsync({ status });
    toast.success(`Marked as ${CONTACT_STATUS_LABELS[status].toLowerCase()}`);
  };

  return (
    <ManagementPanel className="border border-border">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", CONTACT_STATUS_STYLES[message.status])}>
            {CONTACT_STATUS_LABELS[message.status]}
          </span>
          <h2 className="mt-2 text-lg font-bold">{message.subject}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {message.name} · <a href={`mailto:${message.email}`} className="font-medium text-brand-purple hover:underline">{message.email}</a>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={onClose}>Close</Button>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.message}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {message.status === "new" ? (
          <Button size="sm" className="rounded-full bg-brand-blue text-white" disabled={updateMessage.isPending} onClick={() => void setStatus("read")}>
            <MailOpen className="mr-1.5 h-4 w-4" /> Mark read
          </Button>
        ) : null}
        {message.status !== "responded" ? (
          <Button size="sm" variant="outline" className="rounded-full" disabled={updateMessage.isPending} onClick={() => void setStatus("responded")}>
            <Reply className="mr-1.5 h-4 w-4" /> Mark responded
          </Button>
        ) : null}
        {message.status !== "archived" ? (
          <Button size="sm" variant="outline" className="rounded-full" disabled={updateMessage.isPending} onClick={() => void setStatus("archived")}>
            Archive
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-full bg-brand-purple text-white">
          <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}>Reply by email</a>
        </Button>
      </div>
    </ManagementPanel>
  );
}

export function SharedContactInbox({ title = "Contact inbox" }: { title?: string }) {
  const pageLoading = usePageLoading();
  const { data: messages = EMPTY, isFetching, isFetched } = useContactMessages(EMPTY);
  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      responded: messages.filter((m) => m.status === "responded").length,
    }),
    [messages],
  );

  const filtered = useMemo(() => {
    let rows = messages;
    if (statusFilter) rows = rows.filter((m) => m.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [messages, query, statusFilter]);

  const selected = selectedId ? messages.find((m) => m.id === selectedId) ?? null : null;

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <ContactLiveBadge isFetching={isFetching} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Website contact form submissions — updates in real time when visitors send messages.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementStatCard icon={Mail} label="Total messages" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="New" value={String(stats.new)} hint="Needs attention" tone="orange" />
        <ManagementStatCard label="Responded" value={String(stats.responded)} tone="green" />
      </div>

      <div className={dashboardFilterBarClass()} data-filter-bar="true">
        <DashboardSearchField value={query} onChange={setQuery} placeholder="Search name, email, or subject..." type="text" />
        <DashboardFilterSelect
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "read", label: "Read" },
            { value: "responded", label: "Responded" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      {selected ? <MessageDetail message={selected} onClose={() => setSelectedId(null)} /> : null}

      {filtered.length === 0 ? (
        <ManagementPanel className="dashboard-empty-state border border-dashed border-border py-16">
          <div className="dashboard-empty-state__inner">
            <MessageSquare className="mb-4 h-10 w-10 text-brand-purple" />
            <h3 className="text-base font-bold">No contact messages</h3>
            <DashboardEmptyCopy className="mt-1">
              {query || statusFilter ? "Try adjusting your search or filter." : "New submissions from /contact will appear here instantly."}
            </DashboardEmptyCopy>
          </div>
        </ManagementPanel>
      ) : (
        <ManagementPanel className="overflow-x-auto border border-border p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => (
                <tr
                  key={message.id}
                  className={cn(
                    "cursor-pointer border-b border-border transition-colors hover:bg-muted/30",
                    selectedId === message.id && "bg-brand-purple/5",
                    message.status === "new" && "font-medium",
                  )}
                  onClick={() => setSelectedId(message.id)}
                >
                  <td className="px-4 py-3">
                    <p>{message.name}</p>
                    <p className="text-xs text-muted-foreground">{message.email}</p>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3">{message.subject}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", CONTACT_STATUS_STYLES[message.status])}>
                      {CONTACT_STATUS_LABELS[message.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementPanel>
      )}
    </div>
  );
}
