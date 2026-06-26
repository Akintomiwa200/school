"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Eye, Plus, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStaffList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
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
} from "./admin-list-ui";
import {
  ADMIN_STAFF,
  STAFF_ROLES,
  STATUS_STYLES,
  type StaffRecord,
} from "./admin-entities-data";

function StaffSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-72 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-[20px] bg-muted" />
    </div>
  );
}

export function AdminStaff() {
  const { data: staff = ADMIN_STAFF, isFetching } = useStaffList(ADMIN_STAFF);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StaffRecord["status"]>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | string>("all");
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => ({
      total: staff.length,
      active: staff.filter((s) => s.status === "active").length,
      onLeave: staff.filter((s) => s.status === "on_leave").length,
      teachers: staff.filter((s) => s.role === "Teacher" || s.role === "HOD").length,
    }),
    [staff],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (roleFilter !== "all" && member.role !== roleFilter) return false;
      if (!q) return true;
      return (
        member.name.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.employeeId.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q)
      );
    });
  }, [staff, query, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

  if (loading) return <StaffSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Staff"
        description="Manage teachers and non-teaching employees, roles, and assignments."
        action={
          <Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Link href="/admin/staff/new">
              <Plus className="mr-2 h-4 w-4" />
              Add staff
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard label="Total staff" value={String(stats.total)} icon={Users} tone="purple" />
        <ManagementStatCard label="Active" value={String(stats.active)} icon={UserCheck} tone="green" />
        <ManagementStatCard label="On leave" value={String(stats.onLeave)} icon={UserX} tone="orange" />
        <ManagementStatCard label="Teachers & HODs" value={String(stats.teachers)} icon={Users} tone="blue" />
      </div>

      <ManagementPanel className="space-y-4 border border-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold">{filtered.length} staff members</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSearchBar value={query} onChange={setQuery} placeholder="Search staff" />
            <Button variant="outline" className="h-10 shrink-0 rounded-full px-4">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminFilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: "all", label: "All status" },
              { id: "active", label: "Active" },
              { id: "on_leave", label: "On leave" },
              { id: "inactive", label: "Inactive" },
            ]}
          />
          <AdminFilterPills
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { id: "all", label: "All roles" },
              ...STAFF_ROLES.map((role) => ({ id: role, label: role })),
            ]}
          />
        </div>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/staff/${member.id}`} className="font-semibold hover:text-primary">
                    {member.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{member.employeeId}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.designation}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{member.department}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.joiningDate}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      STATUS_STYLES[member.status],
                    )}
                  >
                    {member.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2">
                    <Link href={`/admin/staff/${member.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 0 ? (
          <AdminTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </ManagementPanel>
    </div>
  );
}
