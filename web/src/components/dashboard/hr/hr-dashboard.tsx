"use client";

import Link from "next/link";
import { Briefcase, CalendarOff, ChevronRight, UserPlus, Users } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useHrData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementActionLink, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HR_EMPTY } from "./hr-data";
import { HrListSkeleton, HrPageHeader, hrInitialLoading } from "./hr-workflow-ui";

const SEGMENT_STYLES = {
  employees: { card: "border-brand-purple/15 bg-brand-purple/5", value: "text-brand-purple" },
  leave: { card: "border-brand-orange/15 bg-brand-orange/5", value: "text-brand-orange" },
  recruitment: { card: "border-brand-blue/15 bg-brand-blue/5", value: "text-brand-blue" },
} as const;

export function HrDashboard() {
  const pageLoading = usePageLoading(400);
  const { data = HR_EMPTY, isFetching, isFetched } = useHrData(HR_EMPTY);
  const loading = hrInitialLoading(pageLoading, isFetching, isFetched);

  if (loading) return <HrListSkeleton />;

  const { summary } = data;
  const pendingLeave = data.leaveRequests.filter((r) => r.status === "pending");
  const openJobs = data.recruitment.filter((j) => j.status === "open" || j.status === "interviewing");

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Dashboard"
        description={`${summary.employees} active employees · ${summary.pendingLeave} leave requests pending · ${summary.openRoles} open roles`}
        isFetching={isFetching}
        updatedAt={data.updatedAt}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard icon={Users} label="Employees" value={String(summary.employees)} hint="Active staff" tone="purple" />
        <ManagementStatCard icon={CalendarOff} label="On leave" value={String(summary.onLeave)} hint="Today" tone="orange" />
        <ManagementStatCard icon={Briefcase} label="Open roles" value={String(summary.openRoles)} hint="Recruitment" tone="blue" />
        <ManagementStatCard icon={UserPlus} label="Pending leave" value={String(summary.pendingLeave)} hint="Awaiting approval" tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ManagementPanel className={cn("flex min-h-[160px] flex-col justify-between border", SEGMENT_STYLES.employees.card)}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workforce</p>
          <div>
            <p className={cn("text-3xl font-bold leading-none sm:text-4xl", SEGMENT_STYLES.employees.value)}>
              {summary.employees}
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">{summary.onLeave} on leave today</p>
          </div>
        </ManagementPanel>
        <ManagementPanel className={cn("flex min-h-[160px] flex-col justify-between border", SEGMENT_STYLES.leave.card)}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Leave queue</p>
          <div>
            <p className={cn("text-3xl font-bold leading-none sm:text-4xl", SEGMENT_STYLES.leave.value)}>
              {summary.pendingLeave}
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Requests need review</p>
          </div>
        </ManagementPanel>
        <ManagementPanel className={cn("flex min-h-[160px] flex-col justify-between border", SEGMENT_STYLES.recruitment.card)}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hiring pipeline</p>
          <div>
            <p className={cn("text-3xl font-bold leading-none sm:text-4xl", SEGMENT_STYLES.recruitment.value)}>
              {summary.openRoles}
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">{openJobs.length} active postings</p>
          </div>
        </ManagementPanel>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ManagementActionLink href="/hr/employees" label="Employees" description="Directory and records" icon={Users} />
        <ManagementActionLink href="/hr/leave" label="Leave" description="Approve requests" icon={CalendarOff} />
        <ManagementActionLink href="/hr/recruitment" label="Recruitment" description="Open positions" icon={Briefcase} />
      </div>

      <ManagementPanel className="overflow-hidden border border-border p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Pending leave requests</h2>
            <p className="text-xs text-muted-foreground">{summary.pendingLeave} awaiting your review</p>
          </div>
          <Link
            href="/hr/leave"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple hover:underline"
          >
            Review all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeave.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No pending leave requests right now.
                  </td>
                </tr>
              ) : (
                pendingLeave.slice(0, 5).map((request) => (
                  <tr key={request.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">{request.employee}</td>
                    <td className="px-5 py-4 text-muted-foreground">{request.type}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {request.from} → {request.to}
                    </td>
                    <td className="px-5 py-4 tabular-nums">{request.days}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href="/hr/leave" className="text-sm font-semibold text-brand-purple hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ManagementPanel>
    </div>
  );
}
