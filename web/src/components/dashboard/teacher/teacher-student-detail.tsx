"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherStudent } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
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
  email: string;
  phone: string | null;
  averageScore: number;
  workCompleted: number;
  workTotal: number;
  attendanceRate: number;
  graded: number;
  pendingGrade: number;
  subjectBreakdown: { subject: string; average: number }[];
  recentAttendance: { status: string; date: string }[];
  assignments: { id: string; title: string; dueDate: string; score: number | null; maxScore: number; submitted: boolean; status: string }[];
  recentGrades: { subject: string; score: number; maxScore: number; term: string; grade: string | null; remarks: string | null }[];
};

function SubmissionStatusBadge({ status, score }: { status: string; score: number | null }) {
  if (status === "GRADED" && score != null) {
    const tone = score >= 70 ? "green" : score >= 45 ? "blue" : "orange";
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", tone === "green" ? "bg-green/10 text-green" : tone === "blue" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange")}>
        {score}%
      </span>
    );
  }
  if (status === "LATE") return <span className="inline-flex items-center rounded-full bg-brand-pink/10 px-2.5 py-0.5 text-xs font-semibold text-brand-pink">Late</span>;
  if (status === "SUBMITTED") return <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">Submitted</span>;
  return <span className="text-xs text-muted-foreground">—</span>;
}

function AttendanceDot({ status }: { status: string }) {
  if (status === "PRESENT") return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green/15 text-[10px] font-bold text-green">P</span>;
  if (status === "LATE") return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange/15 text-[10px] font-bold text-brand-orange">L</span>;
  if (status === "EXCUSED") return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/15 text-[10px] font-bold text-brand-blue">E</span>;
  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-pink/15 text-[10px] font-bold text-brand-pink">A</span>;
}

export function TeacherStudentDetail({ studentId }: { studentId: string }) {
  const pageLoading = usePageLoading();
  const { data: student, isFetching, isError, isFetched } = useTeacherStudent<StudentDetail | null>(studentId);

  if (pageLoading || (isFetching && !isFetched)) {
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

  const avgTone = student.averageScore >= 70 ? "green" : student.averageScore >= 45 ? "blue" : "orange";

  return (
    <div className="space-y-6">
      <AdminBackLink href="/teacher/students" label="Back to students" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>
            {student.initials}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{student.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{student.className} · {student.studentId}</p>
            {(student.email || student.phone) && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">{student.email}{student.phone ? ` · ${student.phone}` : ""}</p>
            )}
          </div>
        </div>
        <Link
          href={`/teacher/classes/${student.classId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-float transition-colors hover:bg-muted/40"
        >
          View class →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Average score" value={`${student.averageScore}%`} hint={avgTone === "green" ? "Strong performance" : avgTone === "blue" ? "Working towards goals" : "Needs attention"} tone={avgTone} />
        <ManagementStatCard label="Work submitted" value={`${student.workCompleted}/${student.workTotal}`} hint={`${student.pendingGrade} awaiting grade`} tone="purple" />
        <ManagementStatCard label="Attendance" value={`${student.attendanceRate}%`} hint={student.attendanceRate >= 90 ? "Excellent" : student.attendanceRate >= 75 ? "Good" : "Needs improvement"} tone={student.attendanceRate >= 90 ? "green" : student.attendanceRate >= 75 ? "blue" : "orange"} />
        <ManagementStatCard label="Graded" value={String(student.graded)} hint={`${student.pendingGrade} pending`} tone="blue" />
      </div>

      {student.subjectBreakdown.length > 0 && (
        <ManagementPanel className="border border-border">
          <h2 className="mb-4 text-base font-bold">Subject Performance</h2>
          <div className="space-y-3">
            {student.subjectBreakdown.map((item) => {
              const tone = item.average >= 70 ? "green" : item.average >= 45 ? "blue" : "orange";
              return (
                <div key={item.subject} className="flex items-center gap-3">
                  <span className="min-w-[120px] text-sm text-muted-foreground">{item.subject}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", tone === "green" ? "bg-green" : tone === "blue" ? "bg-brand-blue" : "bg-brand-orange")}
                        style={{ width: `${Math.min(100, item.average)}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn("min-w-[48px] text-right text-sm font-semibold tabular-nums", tone === "green" ? "text-green" : tone === "blue" ? "text-brand-blue" : "text-brand-orange")}>
                    {item.average}%
                  </span>
                </div>
              );
            })}
          </div>
        </ManagementPanel>
      )}

      {student.recentAttendance.length > 0 && (
        <ManagementPanel className="border border-border">
          <h2 className="mb-4 text-base font-bold">Recent Attendance</h2>
          <div className="flex flex-wrap items-center gap-2">
            {student.recentAttendance.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <AttendanceDot status={a.status} />
                <span className="text-[10px] text-muted-foreground">{a.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </ManagementPanel>
      )}

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">Assignments</h2>
          <span className="text-xs text-muted-foreground">{student.assignments.length} total</span>
        </div>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Assignment</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {student.assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No assignments yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">Assignments will appear as they are published.</p>
                </td>
              </tr>
            ) : (
              student.assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground">{assignment.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{assignment.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <SubmissionStatusBadge status={assignment.status} score={assignment.score} />
                  </td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">
                    {assignment.score != null ? `${assignment.score}/${assignment.maxScore}` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/teacher/assignments/${assignment.id}`} className="text-sm font-semibold text-brand-purple transition-colors hover:underline">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ManagementPanel>

      {student.recentGrades.length > 0 && (
        <ManagementPanel className="overflow-x-auto border border-border p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold">Grade History</h2>
            <span className="text-xs text-muted-foreground">{student.recentGrades.length} records</span>
          </div>
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Term</th>
              </tr>
            </thead>
            <tbody>
              {student.recentGrades.map((g, i) => {
                const tone = g.score >= 70 ? "green" : g.score >= 45 ? "blue" : "orange";
                return (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium text-foreground">{g.subject}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", tone === "green" ? "bg-green/10 text-green" : tone === "blue" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange")}>
                        {g.score}/{g.maxScore}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{g.grade || "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{g.term}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ManagementPanel>
      )}
    </div>
  );
}
