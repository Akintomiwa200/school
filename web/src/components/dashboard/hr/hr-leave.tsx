"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useHrData, useUpdateHrLeaveRequest } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HR_EMPTY } from "./hr-data";
import { HrListSkeleton, HrPageHeader, hrInitialLoading } from "./hr-workflow-ui";
import { CheckCircle2, XCircle } from "lucide-react";

export function HrLeave() {
  const pageLoading = usePageLoading();
  const { data = HR_EMPTY, isFetching, isFetched } = useHrData(HR_EMPTY);
  const updateLeave = useUpdateHrLeaveRequest();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const loading = hrInitialLoading(pageLoading, isFetching, isFetched);

  const stats = useMemo(() => ({
    total: data.leaveRequests.length,
    pending: data.leaveRequests.filter((r) => r.status === "pending").length,
    approved: data.leaveRequests.filter((r) => r.status === "approved").length,
    rejected: data.leaveRequests.filter((r) => r.status === "rejected").length,
  }), [data.leaveRequests]);

  const filtered = useMemo(() => {
    let rows = data.leaveRequests;
    if (filter) rows = rows.filter((request) => request.status === filter);
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (request) =>
        request.employee.toLowerCase().includes(q) ||
        request.type.toLowerCase().includes(q) ||
        request.reason.toLowerCase().includes(q),
    );
  }, [data.leaveRequests, filter, search]);

  const onAction = async (requestId: string, action: "approve" | "reject") => {
    setPendingId(requestId);
    try {
      await updateLeave.mutateAsync({ requestId, action });
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <HrListSkeleton />;

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Leave management"
        description={stats.total > 0 ? `${stats.total} requests · ${stats.pending} pending approval` : "Approve and track staff leave requests."}
        isFetching={isFetching}
        updatedAt={data.updatedAt}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Total requests" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="Pending" value={String(stats.pending)} hint={stats.pending > 0 ? "Needs review" : "All clear"} tone="orange" />
        <ManagementStatCard icon={CheckCircle2} label="Approved" value={String(stats.approved)} tone="green" />
        <ManagementStatCard icon={XCircle} label="Rejected" value={String(stats.rejected)} tone="blue" />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by employee or leave type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="box-border h-10 w-full min-w-0 max-w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Dates</th>
              <th className="px-5 py-3">Days</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No leave requests found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {search ? "Try a different search term." : "Staff leave requests will appear here when submitted."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((request) => (
                <tr key={request.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5">
                    {request.staffId ? (
                      <Link href={`/hr/employees/${request.staffId}`} className="font-semibold text-foreground hover:text-brand-purple">
                        {request.employee}
                      </Link>
                    ) : (
                      <p className="font-semibold text-foreground">{request.employee}</p>
                    )}
                    {request.reason ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{request.reason}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{request.type}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {request.from} → {request.to}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">{request.days}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        request.status === "approved"
                          ? "bg-green/10 text-green"
                          : request.status === "rejected"
                            ? "bg-brand-orange/10 text-brand-orange"
                            : request.status === "pending"
                              ? "bg-brand-blue/10 text-brand-blue"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {request.status === "pending" ? (
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 rounded-full bg-green text-white hover:bg-green/90"
                          disabled={pendingId === request.id}
                          onClick={() => void onAction(request.id, "approve")}
                        >
                          {pendingId === request.id && updateLeave.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="mr-1 h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full"
                          disabled={pendingId === request.id}
                          onClick={() => void onAction(request.id, "reject")}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
