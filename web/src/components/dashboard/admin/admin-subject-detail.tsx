"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStaffList, useSubject, useUpdateSubject } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminSelectClass } from "./admin-workflow-ui";
import {
  ADMIN_STAFF,
  ADMIN_STUDENT_GRADES,
  ADMIN_SUBJECTS,
  STAFF_DEPARTMENTS,
  SUBJECT_STATUS_STYLES,
  type SubjectRecord,
} from "./admin-entities-data";

export function AdminSubjectDetail({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallbackSubject = ADMIN_SUBJECTS.find((s) => s.id === subjectId);
  const fallback = fallbackSubject
    ? {
        ...fallbackSubject,
        assignedTeachers: ADMIN_STAFF.filter((member) =>
          fallbackSubject.assignedTeacherIds.includes(member.id),
        ),
        teacherCount: fallbackSubject.assignedTeacherIds.length,
      }
    : undefined;

  const { data: subject, isFetching } = useSubject(subjectId, fallback);
  const { data: staff = ADMIN_STAFF } = useStaffList(ADMIN_STAFF);
  const updateSubject = useUpdateSubject(subjectId);

  const [status, setStatus] = useState<SubjectRecord["status"] | "">("");
  const [department, setDepartment] = useState("");
  const [assignStaffId, setAssignStaffId] = useState("");

  const activeSubject = subject ?? fallback;

  const eligibleTeachers = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.status === "active" &&
          (member.role === "Teacher" || member.role === "HOD") &&
          !activeSubject?.assignedTeacherIds.includes(member.id),
      ),
    [staff, activeSubject],
  );

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!activeSubject) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Subject not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/subjects">Back to subjects</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const currentStatus = status || activeSubject.status;
  const currentDepartment = department || activeSubject.department;

  const onSave = async () => {
    await updateSubject.mutateAsync({
      status: currentStatus,
      department: currentDepartment,
    });
    router.push("/admin/subjects");
  };

  const onAssignTeacher = async () => {
    if (!assignStaffId) return;
    await updateSubject.mutateAsync({ action: "assign_teacher", staffId: assignStaffId });
    setAssignStaffId("");
  };

  const onRemoveTeacher = async (staffId: string) => {
    await updateSubject.mutateAsync({ action: "remove_teacher", staffId });
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/subjects" label="Back to subjects" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{activeSubject.code}</p>
            <h1 className="text-2xl font-bold text-foreground">{activeSubject.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{activeSubject.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                  SUBJECT_STATUS_STYLES[activeSubject.status],
                )}
              >
                {activeSubject.status}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                {activeSubject.credits} credits
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                {activeSubject.department}
              </span>
            </div>
          </div>
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Curriculum details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Grade levels</dt>
              <dd className="font-medium">
                {activeSubject.gradeLevels.length > 0
                  ? activeSubject.gradeLevels.map((g) => `Grade ${g}`).join(", ")
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Teachers assigned</dt>
              <dd className="font-bold text-primary">{activeSubject.teacherCount}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {ADMIN_STUDENT_GRADES.map((grade) => (
              <span
                key={grade}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  activeSubject.gradeLevels.includes(grade)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {grade}
              </span>
            ))}
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Update subject</h2>
          <div className="mt-4 space-y-4">
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
                onChange={(e) => setStatus(e.target.value as SubjectRecord["status"])}
                className={adminSelectClass}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </AdminFormField>
            <Button
              onClick={onSave}
              disabled={updateSubject.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {updateSubject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Assigned teachers</h2>
        <p className="mt-1 text-sm text-muted-foreground">Staff members delivering this subject</p>

        {activeSubject.assignedTeachers.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No teachers assigned yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {activeSubject.assignedTeachers.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <Link href={`/admin/staff/${member.id}`} className="font-semibold hover:text-primary">
                    {member.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {member.designation} · {member.department}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={updateSubject.isPending}
                  onClick={() => onRemoveTeacher(member.id)}
                >
                  <UserMinus className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <AdminFormField label="Assign teacher" className="min-w-0 flex-1">
            <select
              value={assignStaffId}
              onChange={(e) => setAssignStaffId(e.target.value)}
              className={adminSelectClass}
            >
              <option value="">Select teacher</option>
              {eligibleTeachers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.department}
                </option>
              ))}
            </select>
          </AdminFormField>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-full px-4"
            disabled={!assignStaffId || updateSubject.isPending}
            onClick={onAssignTeacher}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </div>
      </ManagementPanel>
    </div>
  );
}
