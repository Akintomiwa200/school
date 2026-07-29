"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headphones,
  HelpCircle,
  Loader2,
  MessageCircle,
  Send,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useSupportTickets,
  useSubmitSupportTicket,
  useSupportTicketDetail,
  useReplySupportTicket,
  useUpdateSupportTicket,
  type SupportTicketDetail,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  SUPPORT_CATEGORIES,
  TICKET_PRIORITY_STYLES,
  TICKET_STATUS_STYLES,
  type SupportPriority,
} from "./support-data";
import { TeacherRoleLiveBadge } from "../teacher/teacher-workflow-ui";
import { HrRoleLiveBadge } from "../hr/hr-workflow-ui";
import { SuperAdminRoleLiveBadge } from "../super-admin/super-admin-workflow-ui";

const EMPTY_TICKETS: SupportTicketDetail[] = [];

const STAFF_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "NON_TEACHING_STAFF", "LIBRARIAN", "HR", "RECEPTIONIST"]);

function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const { data: ticket, isFetching } = useSupportTicketDetail(ticketId);
  const replyMutation = useReplySupportTicket(ticketId);
  const updateMutation = useUpdateSupportTicket(ticketId);
  const [replyText, setReplyText] = useState("");

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await replyMutation.mutateAsync({ content: replyText });
    setReplyText("");
  };

  const onStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({ status });
    toast.success(`Ticket ${status.toLowerCase().replace("_", " ")}`);
  };

  if (isFetching) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!ticket) return null;

  const status = ticket.status;
  const isOpen = status === "open" || status === "in_progress";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:shadow-md hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        All tickets
      </button>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", TICKET_STATUS_STYLES[status as keyof typeof TICKET_STATUS_STYLES])}>
            {status.replace("_", " ")}
          </span>
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", TICKET_PRIORITY_STYLES[ticket.priority as keyof typeof TICKET_PRIORITY_STYLES])}>
            {ticket.priority}
          </span>
          {ticket.category && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{ticket.category}</span>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">{ticket.subject}</h1>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple">
              <User className="h-3 w-3" />
            </span>
            {ticket.user.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-muted/50 px-5 py-4 text-sm leading-relaxed text-foreground/80">
          {ticket.description}
        </div>

        {isOpen && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-green/30 text-green hover:bg-green/10" onClick={() => onStatusChange("RESOLVED")} disabled={updateMutation.isPending}>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Mark resolved
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => onStatusChange("CLOSED")} disabled={updateMutation.isPending}>
              Close ticket
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue">
            <MessageCircle className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold">Conversation</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {ticket.replies.length}
          </span>
        </div>

        {ticket.replies.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
              <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-sm font-medium">No replies yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Send the first message to get the conversation started.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {ticket.replies.map((reply) => {
              const isStaff = reply.user.role && STAFF_ROLES.has(reply.user.role);
              return (
                <div key={reply.id} className={cn("flex gap-3", isStaff && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isStaff ? "bg-brand-purple/15 text-brand-purple" : "bg-brand-blue/15 text-brand-blue",
                    )}
                  >
                    {isStaff ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </span>
                  <div className={cn("max-w-[80%]", isStaff ? "items-end" : "items-start")}>
                    <div className={cn("flex items-center gap-2 text-xs", isStaff && "flex-row-reverse")}>
                      <span className="font-semibold">{reply.user.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        isStaff ? "bg-brand-purple/10 text-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {reply.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {status !== "closed" ? (
          <form onSubmit={onReply} className="mt-6 flex gap-3">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="h-12 flex-1 rounded-full border-border bg-background px-5"
            />
            <Button
              type="submit"
              disabled={replyMutation.isPending || !replyText.trim()}
              className="h-12 w-12 rounded-full bg-brand-purple p-0 text-white hover:bg-brand-purple/90"
            >
              {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-muted/50 py-4 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            This ticket is closed.
          </div>
        )}
      </div>
    </div>
  );
}

export function SharedSupport() {
  const { data: tickets = EMPTY_TICKETS, isFetching, isFetched } = useSupportTickets<SupportTicketDetail[]>(EMPTY_TICKETS);
  const submitTicket = useSubmitSupportTicket();
  const pageLoading = usePageLoading();
  const loading = (pageLoading && isFetching) || (isFetching && !isFetched);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [priority, setPriority] = useState<SupportPriority>("normal");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter],
  );
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    return { open, inProgress, resolved, total: tickets.length };
  }, [tickets]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (selectedTicketId) {
    return <TicketDetailView ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    submitTicket.mutate(
      { subject, category, priority, description },
      {
        onSuccess: () => {
          setShowForm(false);
          setSubject("");
          setCategory(SUPPORT_CATEGORIES[0]);
          setPriority("normal");
          setDescription("");
          toast.success("Ticket submitted — we'll get back to you soon");
        },
        onError: () => toast.error("Could not create support ticket"),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
            <TeacherRoleLiveBadge isFetching={isFetching} />
            <HrRoleLiveBadge isFetching={isFetching} />
            <SuperAdminRoleLiveBadge isFetching={isFetching} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Get help from the school team. We typically respond within 24 hours.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="h-11 rounded-full bg-brand-purple px-6 text-white shadow-md shadow-brand-purple/20 hover:bg-brand-purple/90 hover:shadow-lg hover:shadow-brand-purple/25 transition-all">
          <Headphones className="mr-2 h-4 w-4" />
          New ticket
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open", value: stats.open, icon: Headphones, color: "text-brand-orange", bg: "bg-brand-orange/10" },
          { label: "In progress", value: stats.inProgress, icon: Loader2, color: "text-brand-blue", bg: "bg-brand-blue/10" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green", bg: "bg-green/10" },
          { label: "Total", value: stats.total, icon: MessageCircle, color: "text-brand-purple", bg: "bg-brand-purple/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </span>
            </div>
            <p className={cn("mt-2 text-3xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-3xl border border-brand-purple/20 bg-card p-6 shadow-lg shadow-brand-purple/5 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-purple/15 text-brand-purple">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Submit a new ticket</h2>
              <p className="text-sm text-muted-foreground">Describe your issue and we'll help you out.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="h-12 rounded-2xl border-border bg-background px-4"
                required
              />
            </div>

            <div className="flex flex-wrap items-end gap-5">
              <div className="w-full max-w-[200px]">
                <label className="mb-1.5 block text-sm font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="box-border h-11 w-full min-w-0 max-w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {SUPPORT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="w-full max-w-[200px]">
                <label className="mb-1.5 block text-sm font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as SupportPriority)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about what happened, what you expected, and any steps to reproduce..."
                className="min-h-[140px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitTicket.isPending} className="h-11 rounded-full bg-brand-purple px-8 text-white shadow-md shadow-brand-purple/20 hover:bg-brand-purple/90">
                {submitTicket.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitTicket.isPending ? "Submitting..." : "Submit ticket"}
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-full px-6" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map((f) => {
          const count = f === "all" ? stats.total : f === "open" ? stats.open : f === "in_progress" ? stats.inProgress : stats.resolved;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                filter === f
                  ? "bg-brand-purple text-white shadow-sm shadow-brand-purple/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", filter === f ? "bg-white/20" : "bg-foreground/5")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-base font-bold">
              {filter === "all" ? "No tickets yet" : `No ${filter.replace("_", " ")} tickets`}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {filter === "all"
                ? "When you need help, submit a ticket and our team will get back to you."
                : "Try switching to a different filter to see more tickets."}
            </p>
            {filter === "all" && (
              <Button onClick={() => setShowForm(true)} className="mt-6 h-10 rounded-full bg-brand-purple px-6 text-white">
                <Headphones className="mr-2 h-4 w-4" />
                Open your first ticket
              </Button>
            )}
          </div>
        ) : (
          filtered.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedTicketId(ticket.id)}
                className="group w-full rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-brand-purple/20 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", TICKET_STATUS_STYLES[ticket.status as keyof typeof TICKET_STATUS_STYLES])}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", TICKET_PRIORITY_STYLES[ticket.priority as keyof typeof TICKET_PRIORITY_STYLES])}>
                        {ticket.priority}
                      </span>
                      {ticket.category && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">{ticket.category}</span>
                      )}
                    </div>
                    <h3 className="mt-3 text-base font-bold group-hover:text-brand-purple transition-colors">{ticket.subject}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {ticket.replyCount != null && ticket.replyCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {ticket.replyCount} {ticket.replyCount === 1 ? "reply" : "replies"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground/40 transition-all group-hover:text-brand-purple group-hover:translate-x-0.5" />
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );
}
