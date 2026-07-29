"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Users, ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePageLoading } from "@/hooks/use-page-loading";
import { usePublishTeacherGrades, useTeacherCourses, useTeacherGradebook } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getLetterGradeStyle } from "./grade-ui";
import { ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { TeacherPageHeader, teacherInitialLoading } from "../teacher/teacher-workflow-ui";

const COURSES_EMPTY = { classes: [] as { id: string; name: string; students: number; room: string; schedule: string }[], courses: [] as { id: string; title: string; classId: string }[] };

type GradebookData = {
  classId: string;
  className: string;
  published: boolean;
  publishedAt?: string;
  term?: string;
  students: {
    id: string;
    name: string;
    studentId: string;
    averageScore: number;
    grades: { assignmentId: string; title: string; score: number | null; submitted: boolean }[];
  }[];
  assignments: { id: string; title: string; maxScore?: number }[];
};

const GRADEBOOK_FALLBACK = undefined as GradebookData | undefined;

function scoreToLetter(score: number) {
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D+";
  return "D";
}

function GradesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="h-14 w-full max-w-sm rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-[20px] bg-muted" />)}
      </div>
      <div className="h-96 rounded-[20px] bg-muted" />
    </div>
  );
}

export function TeacherGrades() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get("classId") ?? "";
  const [classId, setClassId] = useState(initialClassId);
  const pageLoading = usePageLoading();
  const { data: coursesData = COURSES_EMPTY, isFetching: coursesFetching } = useTeacherCourses(COURSES_EMPTY);
  const { data: gradebook, isFetching, isError, isFetched } = useTeacherGradebook<GradebookData>(classId, GRADEBOOK_FALLBACK);
  const publishGrades = usePublishTeacherGrades();

  const stats = useMemo(() => {
    if (!gradebook) return null;
    const scores = gradebook.students.map((s) => s.averageScore);
    const classAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const passed = scores.filter((s) => s >= 50).length;
    return { students: gradebook.students.length, assignments: gradebook.assignments.length, classAvg, passed, total: scores.length };
  }, [gradebook]);

  const loading = teacherInitialLoading(pageLoading, isFetching || coursesFetching, isFetched);

  if (loading) return <GradesSkeleton />;

  if (isFetched && (isError || !gradebook)) {
    return (
      <div className="space-y-6">
        <ManagementPageHeader title="Gradebook" description="Assignment matrix with live scores." />
        <ManagementPanel className="border border-border py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">Unable to load gradebook for this class.</p>
        </ManagementPanel>
      </div>
    );
  }

  if (!gradebook) return <GradesSkeleton />;

  const classOptions = coursesData.classes;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Gradebook"
        description="Assignment matrix with live scores. Publish when ready for report cards."
        isFetching={isFetching}
      />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active class</p>
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                const url = new URL(window.location.href);
                url.searchParams.set("classId", e.target.value);
                window.history.replaceState({}, "", url.toString());
              }}
              className="mt-1 h-10 min-w-0 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {gradebook.published ? (
              <p className="mt-1 text-xs font-medium text-green">
                Published {gradebook.term} · {gradebook.publishedAt ? new Date(gradebook.publishedAt).toLocaleString() : ""}
              </p>
            ) : null}
          </div>
          <Button
            className="shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={publishGrades.isPending || gradebook.published || gradebook.students.length === 0}
            onClick={() => publishGrades.mutate({ classId })}
          >
            {publishGrades.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : gradebook.published ? "Published" : "Publish term grades"}
          </Button>
        </div>
      </ManagementPanel>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ManagementStatCard icon={Users} label="Students" value={String(stats.students)} />
          <ManagementStatCard icon={ClipboardList} label="Assignments" value={String(stats.assignments)} />
          <ManagementStatCard icon={TrendingUp} label="Class Average" value={`${stats.classAvg}%`} />
          <ManagementStatCard icon={CheckCircle2} label="Passing" value={`${stats.passed}/${stats.total}`} />
        </div>
      )}

      {gradebook.students.length === 0 ? (
        <ManagementPanel className="border border-border py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">No students in this class</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Add students to this class to see grades.</p>
        </ManagementPanel>
      ) : (
        <ManagementPanel className="border border-border p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-bold">Grade matrix</h2>
            <p className="text-xs text-muted-foreground">{gradebook.assignments.length} assignments · {gradebook.students.length} students</p>
          </div>
          <div className="overflow-x-auto px-5 pb-5 pt-4">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="sticky left-0 bg-card pb-3 pr-4 font-medium">Student</th>
                  {gradebook.assignments.map((assignment) => (
                    <th key={assignment.id} className="pb-3 pr-3 font-medium">
                      <Link href={`/teacher/assignments/${assignment.id}`} className="hover:text-brand-purple">
                        {assignment.title}
                      </Link>
                    </th>
                  ))}
                  <th className="pb-3 font-medium">Average</th>
                </tr>
              </thead>
              <tbody>
                {gradebook.students.map((student) => {
                  const letter = scoreToLetter(student.averageScore);
                  return (
                    <tr key={student.id} className="border-b border-border/60 last:border-none">
                      <td className="sticky left-0 bg-card py-3 pr-4 font-medium">
                        <Link href={`/teacher/students/${student.id}`} className="hover:text-brand-purple">{student.name}</Link>
                      </td>
                      {student.grades.map((grade) => (
                        <td key={grade.assignmentId} className="py-3 pr-3 tabular-nums text-muted-foreground">
                          {grade.score != null ? `${grade.score}%` : grade.submitted ? "—" : "·"}
                        </td>
                      ))}
                      <td className="py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getLetterGradeStyle(letter))}>
                          {letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Edit scores in{" "}
              <Link href="/teacher/assignments" className="font-medium text-brand-purple hover:underline">Assignments</Link>
              {" "}before publishing term grades.
            </p>
          </div>
        </ManagementPanel>
      )}
    </div>
  );
}
