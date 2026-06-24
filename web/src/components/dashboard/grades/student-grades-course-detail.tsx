"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GradesPanel,
  formatDisplayDate,
  formatPercentage,
  getLetterGradeStyle,
  gradesHref,
} from "./grade-ui";
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
  assessmentHref,
  formatAssessmentScore,
  getAssessmentPercentage,
  getAssessmentsByCourse,
  getCourseGradeWithMeta,
} from "./student-grades-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

export function StudentGradesCourseDetail({ courseId }: { courseId: string }) {
  const isLoading = usePageLoading();
  const entry = getCourseGradeWithMeta(courseId);
  const assessments = getAssessmentsByCourse(courseId);

  if (isLoading) return <StudentGradesListSkeleton />;

  if (!entry) {
    return (
      <GradesPanel className="text-center">
        <h2 className="text-lg font-bold">Course not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={gradesHref("courses")}>Back to courses</Link>
        </Button>
      </GradesPanel>
    );
  }

  const { course, grade } = entry;

  return (
    <div className="space-y-5">
      <Link href={gradesHref("courses")} className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>

      <GradesPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Course</p>
            <h2 className="mt-1 text-xl font-bold">{course.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{course.teacher} · {grade.credits} credits</p>
          </div>
          {grade.letterGrade ? (
            <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", getLetterGradeStyle(grade.letterGrade))}>
              {grade.letterGrade}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Running score</p>
            <p className="mt-1 text-lg font-bold">
              {grade.percentage !== null ? formatPercentage(grade.percentage) : "In progress"}
            </p>
          </div>
          {grade.classAverage !== undefined ? (
            <div className="rounded-2xl bg-muted/45 px-4 py-3">
              <p className="text-xs text-muted-foreground">Class average</p>
              <p className="mt-1 text-lg font-bold">{formatPercentage(grade.classAverage)}</p>
            </div>
          ) : null}
          {grade.rank !== undefined ? (
            <div className="rounded-2xl bg-muted/45 px-4 py-3">
              <p className="text-xs text-muted-foreground">Class rank</p>
              <p className="mt-1 text-lg font-bold">#{grade.rank}</p>
            </div>
          ) : null}
        </div>

        {grade.teacherComment ? (
          <p className="mt-4 rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Teacher note: </span>
            {grade.teacherComment}
          </p>
        ) : null}
      </GradesPanel>

      <GradesPanel>
        <h2 className="text-base font-bold">Assessments</h2>
        <p className="mt-1 text-sm text-muted-foreground">Weighted scores for this course</p>

        {assessments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No assessments recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Title</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4">
                      <Link href={assessmentHref(a.id)} className="font-medium hover:text-brand-purple">
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{ASSESSMENT_TYPE_LABELS[a.type]}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(a.date)}</td>
                    <td className="py-3 pr-4">
                      {formatAssessmentScore(a)}
                      {getAssessmentPercentage(a) !== null ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({formatPercentage(getAssessmentPercentage(a)!)} )
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 text-muted-foreground">{a.weight}% · {ASSESSMENT_STATUS_LABELS[a.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GradesPanel>
    </div>
  );
}
