"use client";

import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLeaveData, useSubmitLeaveRequest } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  LEAVE_BALANCES,
  LEAVE_REQUESTS,
  LEAVE_STATUS_STYLES,
  LEAVE_TYPE_LABELS,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveType,
} from "./leave-data";

type LeavePayload = { balances: LeaveBalance[]; requests: LeaveRequest[] };

const LEAVE_FALLBACK: LeavePayload = { balances: LEAVE_BALANCES, requests: LEAVE_REQUESTS };

function Skeleton() {
  return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
}

export function SharedLeave() {
  const { data = LEAVE_FALLBACK, isFetching } = useLeaveData<LeavePayload>(LEAVE_FALLBACK);
  const submitLeave = useSubmitLeaveRequest();
  const loading = usePageLoading() || isFetching;
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  if (loading) return <Skeleton />;

  const { balances, requests } = data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !reason.trim()) return;
    submitLeave.mutate(
      { type: leaveType, from, to, reason },
      {
        onSuccess: () => {
          setShowForm(false);
          setFrom("");
          setTo("");
          setReason("");
          toast.success("Leave request submitted — HR will review shortly");
        },
        onError: () => toast.error("Could not submit leave request"),
      },
    );
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <ManagementPageHeader
        title="Leave"
        description="Submit and track your leave requests."
        action={
          <Button
            onClick={() => setShowForm((v) => !v)}
            className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Request leave
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((balance) => (
          <ManagementPanel key={balance.type} className="border border-border">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{balance.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-purple">{balance.remaining}</p>
            <p className="mt-1 text-xs text-muted-foreground">{balance.used} of {balance.total} days used</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand-purple" style={{ width: `${(balance.used / balance.total) * 100}%` }} />
            </div>
          </ManagementPanel>
        ))}
      </div>

      {showForm ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">New leave request</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    leaveType === type ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {LEAVE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-10 rounded-full" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-10 rounded-full" required />
              </div>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for leave…"
              className="min-h-[100px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={submitLeave.isPending} className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                Submit request
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </ManagementPanel>
      ) : null}

      <ManagementPanel className="border border-border">
        <div className="mb-4 flex items-center gap-2">
          <CalendarOff className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-bold">My requests</h2>
        </div>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{LEAVE_TYPE_LABELS[request.type]}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", LEAVE_STATUS_STYLES[request.status])}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.from} → {request.to} · {request.days} day{request.days > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-sm">{request.reason}</p>
                {request.reviewedBy ? (
                  <p className="mt-1 text-xs text-muted-foreground">Reviewed by {request.reviewedBy}</p>
                ) : null}
              </div>
              {request.status === "pending" ? (
                <Button variant="outline" size="sm" className="shrink-0 rounded-full">
                  Cancel
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </ManagementPanel>
    </div>
  );
}
