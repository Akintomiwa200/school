"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GradesPanel, getLetterGradeStyle } from "./grade-ui";
import { STUDENT_COURSES } from "../courses/student-course-data";
import { getCourseGrade, getAssessmentsByCourse } from "./student-grades-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

const ROSTER = [
  { id: "s1", name: "Alex Johnson", studentId: "STU-2024-118" },
  { id: "s2", name: "Jordan Lee", studentId: "STU-2024-204" },
  { id: "s3", name: "Sam Rivera", studentId: "STU-2024-311" },
];

export function TeacherGrades() {
  const isLoading = usePageLoading();
  const activeCourse = STUDENT_COURSES.find((c) => c.id === "4");

  if (isLoading) return <StudentGradesListSkeleton />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Gradebook
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record and publish grades for your classes.
        </p>
      </div>

      <GradesPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active class</p>
          <h2 className="mt-1 text-lg font-bold">{activeCourse?.title ?? "Algorithms Structures"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Grade 10 · Section A · Spring 2026</p>
        </div>
        <Button className="rounded-full bg-brand-purple hover:bg-brand-purple/90" disabled>
          Publish term grades
        </Button>
      </GradesPanel>

      <GradesPanel>
        <h2 className="text-base font-bold">Class roster</h2>
        <p className="mt-1 text-sm text-muted-foreground">Running grades for {activeCourse?.title}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Student</th>
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 pr-4 font-medium">Assessments</th>
                <th className="pb-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map((student, index) => {
                const grade = index === 0 ? getCourseGrade("4") : null;
                const letter = index === 0 ? grade?.letterGrade ?? "A-" : index === 1 ? "B+" : "B";
                const assessmentCount = getAssessmentsByCourse("4").length;
                return (
                  <tr key={student.id} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4 font-medium">{student.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{student.studentId}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{assessmentCount} items</td>
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
          Need to edit an assessment? Open{" "}
          <Link href="/teacher/assignments" className="font-medium text-brand-purple hover:underline">
            Assignments
          </Link>{" "}
          to update scores before publishing.
        </p>
      </GradesPanel>
    </div>
  );
}
