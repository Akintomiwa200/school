"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useHrData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HR_EMPTY } from "./hr-data";
import {
  HR_AVATAR_TONES,
  HrListSkeleton,
  HrPageHeader,
  getHrInitials,
  hrInitialLoading,
} from "./hr-workflow-ui";

const TONE_KEYS = Object.keys(HR_AVATAR_TONES) as (keyof typeof HR_AVATAR_TONES)[];

export function HrEmployees() {
  const pageLoading = usePageLoading();
  const { data = HR_EMPTY, isFetching, isFetched } = useHrData(HR_EMPTY);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const loading = hrInitialLoading(pageLoading, isFetching, isFetched);

  const departments = useMemo(
    () => Array.from(new Set(data.employees.map((e) => e.department))).sort(),
    [data.employees],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.employees.filter((employee) => {
      if (statusFilter && employee.status !== statusFilter) return false;
      if (departmentFilter && employee.department !== departmentFilter) return false;
      if (!q) return true;
      return (
        employee.name.toLowerCase().includes(q) ||
        employee.employeeId.toLowerCase().includes(q) ||
        employee.department.toLowerCase().includes(q) ||
        employee.email.toLowerCase().includes(q)
      );
    });
  }, [data.employees, query, statusFilter, departmentFilter]);

  const stats = useMemo(() => ({
    total: data.employees.length,
    active: data.employees.filter((e) => e.status === "active").length,
    onLeave: data.employees.filter((e) => e.status === "on_leave").length,
    inactive: data.employees.filter((e) => e.status === "inactive").length,
  }), [data.employees]);

  if (loading) return <HrListSkeleton />;

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Employees"
        description={stats.total > 0 ? `${stats.total} employees in the directory` : "HR records for all school employees."}
        isFetching={isFetching}
        updatedAt={data.updatedAt}
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add employee
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Total employees" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="Active" value={String(stats.active)} hint="Currently working" tone="green" />
        <ManagementStatCard label="On leave" value={String(stats.onLeave)} hint="Approved absence" tone="orange" />
        <ManagementStatCard label="Inactive" value={String(stats.inactive)} hint="Off roster" tone="blue" />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="box-border h-10 w-full min-w-0 max-w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Start date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No employees found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {query ? "Try a different search term or filter." : "Employee records will appear here once staff are onboarded."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((employee, index) => {
                const tone = TONE_KEYS[index % TONE_KEYS.length]!;
                return (
                  <tr key={employee.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold", HR_AVATAR_TONES[tone])}>
                          {getHrInitials(employee.name)}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/hr/employees/${employee.id}`} className="font-semibold text-foreground hover:text-brand-purple">
                            {employee.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{employee.employeeId} · {employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{employee.department}</td>
                    <td className="px-5 py-3.5">{employee.contract}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{employee.startDate}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          employee.status === "active"
                            ? "bg-green/10 text-green"
                            : employee.status === "on_leave"
                              ? "bg-brand-orange/10 text-brand-orange"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {employee.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
