"use client";

import Link from "next/link";
import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useClass, type ClassWithRoster } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AVATAR_TONES } from "./admin-data";
import { AdminBackLink } from "./admin-workflow-ui";
import { ADMIN_CLASSES, ADMIN_STUDENTS, STATUS_STYLES } from "./admin-entities-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildFallback(classId: string): ClassWithRoster | undefined {
  const classRecord = ADMIN_CLASSES.find((c) => c.id === classId);
  if (!classRecord) return undefined;
  const roster = ADMIN_STUDENTS.filter((s) => s.className === `${classRecord.grade}-${classRecord.section}`);
  return { ...classRecord, roster };
}

export function AdminClassDetail({ classId }: { classId: string }) {
  const loading = usePageLoading(300);
  const fallback = buildFallback(classId);
  const { data, isFetching } = useClass(classId, true, fallback);

  const fillPercent = useMemo(() => {
    if (!data) return 0;
    return Math.round((data.students / data.capacity) * 100);
  }, [data]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!data) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Class not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/classes">Back to classes</Link>
        </Button>
      </ManagementPanel>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/classes" label="Back to classes" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Homeroom: {data.homeroomTeacher}</p>
            <p className="mt-2 text-sm">
              <span className="font-semibold text-foreground">{data.students}</span>
              <span className="text-muted-foreground"> / {data.capacity} students · {fillPercent}% full</span>
            </p>
          </div>
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href={`/admin/students/new?grade=${data.grade}&class=${data.grade}-${data.section}`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add student
            </Link>
          </Button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              fillPercent >= 95 ? "bg-destructive" : fillPercent >= 85 ? "bg-brand-orange" : "bg-primary",
            )}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </ManagementPanel>

      <ManagementPanel className="border border-border p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">Class roster</h2>
          <p className="text-xs text-muted-foreground">{data.roster?.length ?? 0} students in this section</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Guardian</th>
                <th className="px-4 py-3 font-medium">Attendance</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {!data.roster?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No students in this class yet.{" "}
                    <Link href="/admin/students/new" className="font-semibold text-primary hover:underline">
                      Enroll a student
                    </Link>
                  </td>
                </tr>
              ) : (
                data.roster.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${student.id}`} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            AVATAR_TONES[student.avatarTone],
                          )}
                        >
                          {getInitials(student.name)}
                        </span>
                        <span>
                          <span className="block font-semibold hover:text-primary">{student.name}</span>
                          <span className="text-xs text-muted-foreground">{student.studentId}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.guardian}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{student.attendance}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                          STATUS_STYLES[student.status],
                        )}
                      >
                        {student.status}
                      </span>
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
