"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useClassesList, useStudent, useUpdateStudent } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AVATAR_TONES } from "./admin-data";
import { AdminBackLink, AdminFormField, adminSelectClass } from "./admin-workflow-ui";
import {
  ADMIN_CLASSES,
  ADMIN_STUDENTS,
  STATUS_STYLES,
  type StudentRecord,
} from "./admin-entities-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminStudentDetail({ studentId }: { studentId: string }) {
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallback = ADMIN_STUDENTS.find((s) => s.id === studentId);
  const { data: student, isFetching } = useStudent(studentId, fallback);
  const updateStudent = useUpdateStudent(studentId);
  const { data: classes = ADMIN_CLASSES } = useClassesList(ADMIN_CLASSES);

  const [status, setStatus] = useState<StudentRecord["status"] | "">("");
  const [className, setClassName] = useState("");

  const activeStudent = student ?? fallback;
  const sectionsForGrade = useMemo(() => {
    if (!activeStudent) return [];
    return classes.filter((c) => c.grade === activeStudent.grade).map((c) => `${c.grade}-${c.section}`);
  }, [classes, activeStudent]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!activeStudent) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Student not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/students">Back to students</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const currentStatus = status || activeStudent.status;
  const currentClass = className || activeStudent.className;

  const onSave = async () => {
    const section = currentClass.split("-")[1];
    await updateStudent.mutateAsync({
      status: currentStatus,
      className: currentClass,
      grade: activeStudent.grade,
    });
    router.push("/admin/students");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/students" label="Back to students" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                AVATAR_TONES[activeStudent.avatarTone],
              )}
            >
              {getInitials(activeStudent.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeStudent.name}</h1>
              <p className="text-sm text-muted-foreground">{activeStudent.studentId}</p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                  STATUS_STYLES[activeStudent.status],
                )}
              >
                {activeStudent.status}
              </span>
            </div>
          </div>
          <Button asChild variant="outline" className="h-9 shrink-0 rounded-xl">
            <Link href={`/admin/classes?grade=${activeStudent.grade}`}>Browse classes</Link>
          </Button>
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{activeStudent.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Guardian</dt>
              <dd className="font-medium">{activeStudent.guardian}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Enrolled</dt>
              <dd className="font-medium">{activeStudent.enrolledDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Attendance</dt>
              <dd className="font-bold text-primary">{activeStudent.attendance}%</dd>
            </div>
          </dl>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Enrollment</h2>
          <div className="mt-4 space-y-4">
            <AdminFormField label="Status">
              <select
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value as StudentRecord["status"])}
                className={adminSelectClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Class">
              <select
                value={currentClass}
                onChange={(e) => setClassName(e.target.value)}
                className={adminSelectClass}
              >
                {sectionsForGrade.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <Button
              onClick={onSave}
              disabled={updateStudent.isPending}
              className="h-10 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-6"
            >
              {updateStudent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </ManagementPanel>
      </div>
    </div>
  );
}
