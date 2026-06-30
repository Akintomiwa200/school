"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherStudent } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TEACHER_AVATAR_TONES } from "./teacher-data";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";
type StudentDetail = {
  id: string;
  name: string;
  initials: string;
  avatarTone: keyof typeof TEACHER_AVATAR_TONES;
  classId: string;
  className: string;
  studentId: string;
  averageScore: number;
  workCompleted: number;
  workTotal: number;
  assignments: { id: string; title: string; dueDate: string; score: number | null; submitted: boolean }[];
};

export function TeacherStudentDetail({ studentId }: { studentId: string }) {
  const pageLoading = usePageLoading();
  const { data: student, isFetching, isError, isFetched } = useTeacherStudent<StudentDetail | null>(studentId);

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !student)) {
    return (
      <TeacherNotFound
        title="Student not found"
        description="This student is not in your classes or the link may be outdated."
        backHref="/teacher/students"
        backLabel="Back to students"
      />
    );
  }

  if (!student) return <TeacherDetailSkeleton />;
  return (
    <div className="space-y-6">
      <AdminBackLink href={`/teacher/classes/${student.classId}`} label="Back to class" />
      <ManagementPageHeader title={student.name} description={`${student.className} · ${student.studentId}`} />

      <ManagementPanel className="flex items-center gap-4 border border-border">
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>
          {student.initials}
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Average score</p>
          <p className="text-2xl font-bold text-brand-purple">{student.averageScore}%</p>
          <p className="text-sm text-muted-foreground">{student.workCompleted}/{student.workTotal} work completed</p>
        </div>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {student.assignments.map((assignment) => (
              <tr key={assignment.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{assignment.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{assignment.dueDate}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {assignment.score != null ? `${assignment.score}%` : assignment.submitted ? "Pending grade" : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/teacher/assignments/${assignment.id}`} className="text-sm font-medium text-brand-purple hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
