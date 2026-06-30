"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useMarkTeacherAttendanceRecords,
  useTeacherAttendanceSession,
} from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";
type SessionDetail = {
  id: string;
  className: string;
  classId: string;
  date: string;
  time: string;
  marked: boolean;
  present: number;
  absent: number;
  records: { studentId: string; studentName: string; status: "present" | "absent" | "late" | "unmarked" }[];
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
] as const;

export function TeacherAttendanceDetail({ sessionId }: { sessionId: string }) {
  const pageLoading = usePageLoading();
  const { data: session, isFetching, isError, isFetched } = useTeacherAttendanceSession<SessionDetail | null>(sessionId);
  const saveRecords = useMarkTeacherAttendanceRecords(sessionId);
  const [localRecords, setLocalRecords] = useState<SessionDetail["records"] | null>(null);

  const records = localRecords ?? session?.records ?? [];

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !session)) {
    return (
      <TeacherNotFound
        title="Attendance session not found"
        description="This session may have been removed or the link is invalid."
        backHref="/teacher/attendance"
        backLabel="Back to attendance"
      />
    );
  }

  if (!session) return <TeacherDetailSkeleton />;
  const onSave = async () => {
    await saveRecords.mutateAsync(records.map((r) => ({ studentId: r.studentId, status: r.status })));
    setLocalRecords(null);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/teacher/attendance" label="Back to attendance" />
      <ManagementPageHeader
        title={session.className}
        description={`${session.date} · ${session.time}`}
        action={
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={saveRecords.isPending}
            onClick={onSave}
          >
            {saveRecords.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save attendance"}
          </Button>
        }
      />

      <ManagementPanel className="border border-border">
        <p className="text-sm text-muted-foreground">
          {session.present} present · {session.absent} absent · {records.length} students
        </p>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.studentId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/teacher/students/${record.studentId}`} className="hover:text-brand-purple">
                    {record.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={record.status === "unmarked" ? "present" : record.status}
                    onChange={(e) => {
                      const status = e.target.value as SessionDetail["records"][number]["status"];
                      setLocalRecords(
                        records.map((r) => (r.studentId === record.studentId ? { ...r, status } : r)),
                      );
                    }}
                    className="h-9 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
