"use client";

import { useMemo, useState } from "react";
import { Headphones, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useSubmitSupportTicket, useSupportTickets } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_TICKETS,
  TICKET_PRIORITY_STYLES,
  TICKET_STATUS_STYLES,
  type SupportPriority,
  type SupportTicket,
} from "./support-data";

function Skeleton() {
  return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
}

export function SharedSupport() {
  const { data: tickets = SUPPORT_TICKETS, isFetching } = useSupportTickets<SupportTicket[]>(SUPPORT_TICKETS);
  const submitTicket = useSubmitSupportTicket();
  const loading = usePageLoading() || isFetching;
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [priority, setPriority] = useState<SupportPriority>("normal");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  const filtered = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter],
  );
  const openCount = useMemo(
    () => tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
    [tickets],
  );

  if (loading) return <Skeleton />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    submitTicket.mutate(
      { subject, category, priority, description },
      {
        onSuccess: () => {
          setShowForm(false);
          setSubject("");
          setDescription("");
          toast.success("Support ticket created — we'll respond soon");
        },
        onError: () => toast.error("Could not create support ticket"),
      },
    );
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <ManagementPageHeader
        title="Support"
        description="Open tickets and get help from the school team."
        action={
          <Button
            onClick={() => setShowForm((v) => !v)}
            className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Open ticket
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Open tickets</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">{openCount}</p>
        </ManagementPanel>
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total tickets</p>
          <p className="mt-2 text-2xl font-bold">{tickets.length}</p>
        </ManagementPanel>
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avg response</p>
          <p className="mt-2 text-2xl font-bold text-green">&lt; 24h</p>
        </ManagementPanel>
      </div>

      {showForm ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Open a new ticket</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="h-11 rounded-full"
              required
            />
            <div className="flex flex-wrap gap-2">
              {SUPPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    category === cat ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["low", "normal", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                    priority === p ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {p} priority
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail…"
              className="min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={submitTicket.isPending} className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                Submit ticket
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </ManagementPanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              filter === f ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "in_progress" ? "In progress" : f}
          </button>
        ))}
      </div>

      <ManagementPanel className="border border-border">
        <div className="mb-4 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-bold">My tickets</h2>
        </div>
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", TICKET_STATUS_STYLES[ticket.status])}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", TICKET_PRIORITY_STYLES[ticket.priority])}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold">{ticket.subject}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.category}</p>
                  <p className="mt-2 text-sm">{ticket.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Created {ticket.createdAt}
                    {ticket.assignedTo ? ` · Assigned to ${ticket.assignedTo}` : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 rounded-full">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ManagementPanel>
    </div>
  );
}
