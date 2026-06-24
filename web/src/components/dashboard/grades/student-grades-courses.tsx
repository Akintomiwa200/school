"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { STUDENT_COURSES } from "../courses/student-course-data";
import {
  GradesPanel,
  formatPercentage,
  getLetterGradeStyle,
  gradesHref,
} from "./grade-ui";
import {
  computeRunningPercentage,
  courseGradeHref,
  getCourseGrade,
  getTrendIcon,
} from "./student-grades-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

export function StudentGradesCourses() {
  const isLoading = usePageLoading();

  if (isLoading) return <StudentGradesListSkeleton />;

  return (
    <div className="space-y-4">
      {STUDENT_COURSES.map((course) => {
        const grade = getCourseGrade(course.id);
        const running = computeRunningPercentage(course.id);
        const pct = grade?.percentage ?? running;
        const letter = grade?.letterGrade ?? course.grade ?? null;

        return (
          <Link key={course.id} href={courseGradeHref(course.id)}>
            <GradesPanel className="transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl", course.illustration.bg)}>
                    {course.illustration.emoji}
                  </div>
                  <div>
                    <h2 className="font-bold">{course.title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{course.teacher}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">{course.status} · {course.tags.join(", ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  {letter ? (
                    <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", getLetterGradeStyle(letter))}>
                      {letter}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">In progress</span>
                  )}
                  {pct !== null ? (
                    <p className="mt-1 text-sm font-medium">{formatPercentage(pct)}</p>
                  ) : null}
                  {grade?.trend ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getTrendIcon(grade.trend)} vs class avg
                    </p>
                  ) : null}
                </div>
              </div>
            </GradesPanel>
          </Link>
        );
      })}

      <p className="text-center text-sm text-muted-foreground">
        <Link href={gradesHref()} className="text-brand-purple hover:underline">
          ← Back to overview
        </Link>
      </p>
    </div>
  );
}
