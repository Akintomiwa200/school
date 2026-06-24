"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  GradesPanel,
  formatDisplayDate,
  formatGpa,
  getLetterGradeStyle,
} from "./grade-ui";
import { getReportCards, reportCardHref } from "./student-grades-data";
import { StudentGradesListSkeleton } from "./student-grades-skeleton";

export function StudentGradesReportCards() {
  const isLoading = usePageLoading();
  const cards = getReportCards();

  if (isLoading) return <StudentGradesListSkeleton />;

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Link key={card.id} href={reportCardHref(card.id)}>
          <GradesPanel className="transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.termLabel} · {card.schoolYear}
                </p>
                <h2 className="mt-1 text-lg font-bold">{card.termName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Published {formatDisplayDate(card.publishedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-purple">{formatGpa(card.gpa)}</p>
                <p className="text-xs text-muted-foreground">Term GPA</p>
                {card.honorRoll ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-xs font-semibold text-brand-orange">
                    <Award className="h-3 w-3" />
                    Honor roll
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.courseGrades.slice(0, 4).map((g) => (
                <span
                  key={g.courseId}
                  className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getLetterGradeStyle(g.letterGrade))}
                >
                  {g.letterGrade ?? "—"}
                </span>
              ))}
            </div>
          </GradesPanel>
        </Link>
      ))}
    </div>
  );
}
