"use client";

import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  GradesPanel,
  formatGpa,
  formatPercentage,
  getLetterGradeStyle,
} from "./grade-ui";
import { getCumulativeGpa, getTranscript } from "./student-grades-data";
import { StudentGradesSkeleton } from "./student-grades-skeleton";

export function StudentGradesTranscript() {
  const isLoading = usePageLoading();
  const transcript = getTranscript();
  const cumulativeGpa = getCumulativeGpa();

  if (isLoading) return <StudentGradesSkeleton />;

  return (
    <div className="space-y-5">
      <GradesPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Academic transcript</h2>
            <p className="mt-1 text-sm text-muted-foreground">Official cumulative record</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-purple">{formatGpa(cumulativeGpa)}</p>
            <p className="text-xs text-muted-foreground">Cumulative GPA</p>
          </div>
        </div>
      </GradesPanel>

      {transcript.map((term) => (
        <GradesPanel key={term.termId}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="font-bold">{term.termName}</h3>
              <p className="text-sm text-muted-foreground">{term.schoolYear}</p>
            </div>
            <p className="text-lg font-bold text-brand-purple">GPA {formatGpa(term.termGpa)}</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Credits</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {term.courses.map((c) => (
                  <tr key={`${term.termId}-${c.courseId}`} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4">{c.courseName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.credits}</td>
                    <td className="py-3 pr-4">
                      {c.percentage !== null ? formatPercentage(c.percentage) : "—"}
                    </td>
                    <td className="py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getLetterGradeStyle(c.letterGrade))}>
                        {c.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GradesPanel>
      ))}
    </div>
  );
}
