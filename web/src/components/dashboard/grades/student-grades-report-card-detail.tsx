"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getStudentCourseById } from "../courses/student-course-data";
import {
  GradesPanel,
  formatDisplayDate,
  formatGpa,
  formatPercentage,
  getLetterGradeStyle,
  gradesHref,
} from "./grade-ui";
import { getReportCardById } from "./student-grades-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

export function StudentGradesReportCardDetail({ termId }: { termId: string }) {
  const isLoading = usePageLoading();
  const card = getReportCardById(termId);

  if (isLoading) return <StudentGradesListSkeleton />;

  if (!card) {
    return (
      <GradesPanel className="text-center">
        <h2 className="text-lg font-bold">Report card not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={gradesHref("report-cards")}>Back to report cards</Link>
        </Button>
      </GradesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={gradesHref("report-cards")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to report cards
      </Link>

      <GradesPanel>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Official report card</p>
            <h2 className="mt-1 text-2xl font-bold">{card.termName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {card.termLabel} · {card.schoolYear} · Published {formatDisplayDate(card.publishedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-purple">{formatGpa(card.gpa)}</p>
            <p className="text-sm text-muted-foreground">Term GPA · Weighted {formatGpa(card.weightedGpa)}</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Subject</th>
                <th className="pb-3 pr-4 font-medium">Credits</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {card.courseGrades.map((g) => {
                const course = getStudentCourseById(g.courseId);
                return (
                  <tr key={g.courseId} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4 font-medium">{course?.title ?? g.courseId}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{g.credits}</td>
                    <td className="py-3 pr-4">
                      {g.percentage !== null ? formatPercentage(g.percentage) : "—"}
                    </td>
                    <td className="py-3">
                      {g.letterGrade ? (
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getLetterGradeStyle(g.letterGrade))}>
                          {g.letterGrade}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/45 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="mt-1 text-lg font-bold text-green">{card.attendanceSummary.present}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="mt-1 text-lg font-bold">{card.attendanceSummary.absent}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="mt-1 text-lg font-bold text-brand-orange">{card.attendanceSummary.late}</p>
          </div>
        </div>

        <p className="mt-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Principal: </span>
          {card.principalComment}
        </p>
      </GradesPanel>
    </div>
  );
}
