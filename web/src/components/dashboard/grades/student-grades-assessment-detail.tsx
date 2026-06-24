"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { Button } from "@/components/ui/button";
import {
  GradesPanel,
  formatDisplayDate,
  formatPercentage,
  gradesHref,
} from "./grade-ui";
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
  courseGradeHref,
  formatAssessmentScore,
  getAssessmentById,
  getAssessmentPercentage,
} from "./student-grades-data";
import { getStudentCourseById } from "../courses/student-course-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

export function StudentGradesAssessmentDetail({ assessmentId }: { assessmentId: string }) {
  const isLoading = usePageLoading();
  const assessment = getAssessmentById(assessmentId);

  if (isLoading) return <StudentGradesListSkeleton />;

  if (!assessment) {
    return (
      <GradesPanel className="text-center">
        <h2 className="text-lg font-bold">Assessment not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={gradesHref("courses")}>Back to courses</Link>
        </Button>
      </GradesPanel>
    );
  }

  const course = getStudentCourseById(assessment.courseId);
  const pct = getAssessmentPercentage(assessment);

  return (
    <div className="space-y-5">
      <Link
        href={courseGradeHref(assessment.courseId)}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to {course?.title ?? "course"}
      </Link>

      <GradesPanel>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {ASSESSMENT_TYPE_LABELS[assessment.type]}
        </p>
        <h2 className="mt-1 text-xl font-bold">{assessment.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {course?.title} · {formatDisplayDate(assessment.date)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="mt-1 text-lg font-bold">{formatAssessmentScore(assessment)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Percentage</p>
            <p className="mt-1 text-lg font-bold">{pct !== null ? formatPercentage(pct) : "—"}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="mt-1 text-lg font-bold">{assessment.weight}%</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 text-lg font-bold">{ASSESSMENT_STATUS_LABELS[assessment.status]}</p>
          </div>
        </div>

        {assessment.feedback ? (
          <div className="mt-4 rounded-2xl bg-brand-blue/5 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Feedback</p>
            <p className="mt-2 text-sm leading-relaxed">{assessment.feedback}</p>
          </div>
        ) : null}

        {assessment.teacherComment ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Graded by </span>
            {assessment.teacherComment}
          </p>
        ) : null}
      </GradesPanel>
    </div>
  );
}
