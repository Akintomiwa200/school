"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePageLoading } from "@/hooks/use-page-loading";
import { usePublishTeacherGrades, useTeacherCourses, useTeacherGradebook } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GradesPanel, getLetterGradeStyle } from "./grade-ui";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";
import { TEACHER_DASHBOARD_CLASSES, buildTeacherCoursesFallback } from "../teacher/teacher-data";

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

export function TeacherGrades() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get("classId") ?? TEACHER_DASHBOARD_CLASSES[0]?.id ?? "class-a";
  const [classId, setClassId] = useState(initialClassId);
  const isLoading = usePageLoading();
  const { data: coursesData } = useTeacherCourses(buildTeacherCoursesFallback());
  const { data: gradebook, isFetching, isError, isFetched } = useTeacherGradebook<GradebookData>(classId, GRADEBOOK_FALLBACK);
  const publishGrades = usePublishTeacherGrades();

  if (isLoading || (isFetching && !isFetched)) return <StudentGradesListSkeleton />;

  if (isFetched && (isError || !gradebook)) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Gradebook</h1>
        <GradesPanel className="text-sm text-muted-foreground">Unable to load gradebook for this class.</GradesPanel>
      </div>
    );
  }

  if (!gradebook) return <StudentGradesListSkeleton />;

  const classOptions = coursesData.classes.length > 0 ? coursesData.classes : TEACHER_DASHBOARD_CLASSES.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Gradebook</h1>
        <p className="mt-1 text-sm text-muted-foreground">Assignment matrix with live scores. Publish when ready for report cards.</p>
      </div>

      <GradesPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active class</p>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="mt-1 h-10 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {classOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-muted-foreground">{gradebook.className}</p>
          {gradebook.published ? (
            <p className="mt-1 text-xs font-medium text-green">
              Published {gradebook.term} · {gradebook.publishedAt ? new Date(gradebook.publishedAt).toLocaleString() : ""}
            </p>
          ) : null}
        </div>
        <Button
          className="rounded-full bg-brand-purple hover:bg-brand-purple/90"
          disabled={publishGrades.isPending || gradebook.published || gradebook.students.length === 0}
          onClick={() => publishGrades.mutate({ classId })}
        >
          {publishGrades.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : gradebook.published ? "Published" : "Publish term grades"}
        </Button>
      </GradesPanel>

      <GradesPanel>
        <h2 className="text-base font-bold">Grade matrix</h2>
        <p className="mt-1 text-sm text-muted-foreground">{gradebook.assignments.length} assignments · {gradebook.students.length} students</p>

        <div className="mt-4 overflow-x-auto">
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

        <p className="mt-4 text-sm text-muted-foreground">
          Edit scores in{" "}
          <Link href="/teacher/assignments" className="font-medium text-brand-purple hover:underline">Assignments</Link>
          {" "}before publishing term grades.
        </p>
      </GradesPanel>
    </div>
  );
}
