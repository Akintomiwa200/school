"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStaff, useUpdateStaff } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminSelectClass } from "./admin-workflow-ui";
import {
  ADMIN_CLASSES,
  ADMIN_STAFF,
  STAFF_DEPARTMENTS,
  STAFF_ROLES,
  STATUS_STYLES,
  type StaffRecord,
  type StaffRole,
} from "./admin-entities-data";

export function AdminStaffDetail({ staffId }: { staffId: string }) {
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallbackMember = ADMIN_STAFF.find((s) => s.id === staffId);
  const fallback = fallbackMember
    ? {
        ...fallbackMember,
        assignedClasses: ADMIN_CLASSES.filter((c) => c.homeroomTeacher === fallbackMember.name),
      }
    : undefined;

  const { data: staff, isFetching } = useStaff(staffId, fallback);
  const updateStaff = useUpdateStaff(staffId);

  const [role, setRole] = useState<StaffRole | "">("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<StaffRecord["status"] | "">("");

  const activeStaff = staff ?? fallback;
  const assignedClasses = useMemo(() => activeStaff?.assignedClasses ?? [], [activeStaff]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!activeStaff) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Staff member not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/staff">Back to staff</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const currentRole = role || activeStaff.role;
  const currentDepartment = department || activeStaff.department;
  const currentStatus = status || activeStaff.status;

  const onSave = async () => {
    await updateStaff.mutateAsync({
      role: currentRole,
      department: currentDepartment,
      status: currentStatus,
    });
    router.push("/admin/staff");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/staff" label="Back to staff" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{activeStaff.name}</h1>
            <p className="text-sm text-muted-foreground">{activeStaff.employeeId}</p>
            <p className="mt-1 text-sm text-muted-foreground">{activeStaff.designation}</p>
            <span
              className={cn(
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                STATUS_STYLES[activeStaff.status],
              )}
            >
              {activeStaff.status.replace("_", " ")}
            </span>
          </div>
          <Button asChild variant="outline" className="h-9 shrink-0 rounded-xl">
            <Link href="/admin/classes">Browse classes</Link>
          </Button>
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{activeStaff.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{activeStaff.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Joined</dt>
              <dd className="font-medium">{activeStaff.joiningDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{activeStaff.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Department</dt>
              <dd className="font-medium">{activeStaff.department}</dd>
            </div>
          </dl>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Update assignment</h2>
          <div className="mt-4 space-y-4">
            <AdminFormField label="Role">
              <select value={currentRole} onChange={(e) => setRole(e.target.value as StaffRole)} className={adminSelectClass}>
                {STAFF_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Department">
              <select
                value={currentDepartment}
                onChange={(e) => setDepartment(e.target.value)}
                className={adminSelectClass}
              >
                {STAFF_DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Status">
              <select
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value as StaffRecord["status"])}
                className={adminSelectClass}
              >
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </AdminFormField>
            <Button
              onClick={onSave}
              disabled={updateStaff.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {updateStaff.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border">
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold">Class assignments</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Homeroom classes linked to this staff member</p>
        {assignedClasses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No class assignments yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {assignedClasses.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.students}/{item.capacity} students
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/admin/classes/${item.id}`}>View class</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ManagementPanel>
    </div>
  );
}
