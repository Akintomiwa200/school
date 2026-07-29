"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useHrEmployee } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import type { HrEmployeeDetail } from "@/lib/hr/map-hr-api";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import {
  HR_AVATAR_TONES,
  HrDetailSkeleton,
  HrLiveBadge,
  HrNotFound,
  getHrInitials,
} from "./hr-workflow-ui";

export function HrEmployeeDetail({ employeeId }: { employeeId: string }) {
  const pageLoading = usePageLoading();
  const { data: employee, isFetching, isError, isFetched } = useHrEmployee<HrEmployeeDetail | null>(employeeId);

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <HrDetailSkeleton />;
  }

  if (isFetched && (isError || !employee)) {
    return (
      <HrNotFound
        title="Employee not found"
        description="This employee record may have been removed or the link is invalid."
        backHref="/hr/employees"
        backLabel="Back to employees"
      />
    );
  }

  if (!employee) return <HrDetailSkeleton />;

  const approvedLeave = employee.leaveHistory.filter((row) => row.status === "approved").length;
  const pendingLeave = employee.leaveHistory.filter((row) => row.status === "pending").length;

  return (
    <div className="space-y-6">
      <AdminBackLink href="/hr/employees" label="Back to employees" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold", HR_AVATAR_TONES.purple)}>
            {getHrInitials(employee.name)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{employee.name}</h1>
              <HrLiveBadge isFetching={isFetching} updatedAt={employee.updatedAt} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {employee.department} · {employee.employeeId}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {employee.email}
              {employee.phone ? ` · ${employee.phone}` : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
            employee.status === "active"
              ? "bg-green/15 text-green"
              : employee.status === "on_leave"
                ? "bg-brand-orange/15 text-brand-orange"
                : "bg-muted text-muted-foreground",
          )}
        >
          {employee.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Role" value={employee.contract} tone="purple" />
        <ManagementStatCard label="Start date" value={employee.startDate} tone="blue" />
        <ManagementStatCard label="Approved leave" value={String(approvedLeave)} tone="green" />
        <ManagementStatCard label="Pending leave" value={String(pendingLeave)} hint={pendingLeave > 0 ? "Needs review" : "None"} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Employment details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Department</dt>
              <dd className="font-medium">{employee.department}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Designation</dt>
              <dd className="font-medium">{employee.contract}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Base salary</dt>
              <dd className="font-medium">{employee.salary != null ? `$${employee.salary.toLocaleString()}` : "—"}</dd>
            </div>
          </dl>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Recent payroll</h2>
            <span className="text-xs text-muted-foreground">{employee.payroll.length} records</span>
          </div>
          {employee.payroll.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No payroll records yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {employee.payroll.map((row) => (
                <li key={row.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {row.month}/{row.year}
                  </span>
                  <span className="font-semibold tabular-nums">${row.netSalary.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </ManagementPanel>
      </div>

      <ManagementPanel className="overflow-hidden border border-border p-0">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">Leave history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {employee.leaveHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    No leave requests on file.
                  </td>
                </tr>
              ) : (
                employee.leaveHistory.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3.5">{row.type}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {row.from} → {row.to}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{row.days}</td>
                    <td className="px-5 py-3.5 capitalize">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pendingLeave > 0 ? (
          <div className="border-t border-border/60 px-5 py-4">
            <Link href="/hr/leave" className="text-sm font-semibold text-brand-purple hover:underline">
              Review pending leave requests
            </Link>
          </div>
        ) : null}
      </ManagementPanel>
    </div>
  );
}
