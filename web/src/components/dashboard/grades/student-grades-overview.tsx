"use client";

import Link from "next/link";
import { Award, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  GradesPanel,
  formatGpa,
  formatPercentage,
  getLetterGradeStyle,
  gradesHref,
} from "./grade-ui";
import {
  ASSESSMENT_TYPE_LABELS,
  CURRENT_TERM_LABEL,
  assessmentHref,
  courseGradeHref,
  formatAssessmentScore,
  getAssessmentPercentage,
  getGradeStats,
  getRecentAssessments,
  getGradedCoursesForTerm,
} from "./student-grades-data";
import { StudentGradesSkeleton } from "./student-grades-skeleton";

function StatCard({
  value,
  label,
  icon: Icon,
  tone,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "purple" | "blue" | "orange" | "green";
}) {
  const tones = {
    purple: { card: "bg-brand-purple/10", icon: "bg-brand-purple/15 text-brand-purple", value: "text-brand-purple" },
    blue: { card: "bg-brand-blue/10", icon: "bg-brand-blue/15 text-brand-blue", value: "text-brand-blue" },
    orange: { card: "bg-brand-orange/10", icon: "bg-brand-orange/15 text-brand-orange", value: "text-brand-orange" },
    green: { card: "bg-green/10", icon: "bg-green/15 text-green", value: "text-green" },
  } as const;
  const style = tones[tone];

  return (
    <GradesPanel className={cn("flex items-center gap-3", style.card)}>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={cn("text-2xl font-bold leading-none", style.value)}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </GradesPanel>
  );
}

export function StudentGradesOverview() {
  const isLoading = usePageLoading();
  const stats = getGradeStats();
  const recent = getRecentAssessments(6);
  const courses = getGradedCoursesForTerm();

  if (isLoading) return <StudentGradesSkeleton />;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={formatGpa(stats.termGpa)} label={`Term GPA · ${CURRENT_TERM_LABEL}`} icon={GraduationCap} tone="purple" />
        <StatCard value={formatGpa(stats.cumulativeGpa)} label="Cumulative GPA" icon={Award} tone="blue" />
        <StatCard value={formatPercentage(stats.averageScore)} label="Average score" icon={TrendingUp} tone="green" />
        <StatCard
          value={`${stats.coursesGraded}/${stats.totalCourses}`}
          label="Courses with grades"
          icon={BookOpen}
          tone="orange"
        />
      </div>

      <GradesPanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">Current term by course</h2>
            <p className="mt-1 text-sm text-muted-foreground">{CURRENT_TERM_LABEL} grades and running averages</p>
          </div>
          <Link href={gradesHref("courses")} className="text-sm font-medium text-brand-purple hover:underline">
            View all courses →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Course</th>
                <th className="pb-3 pr-4 font-medium">Teacher</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((entry) => {
                if (!entry) return null;
                const { course, grade } = entry;
                const pct = grade.percentage ?? null;
                return (
                  <tr key={course.id} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4">
                      <Link href={courseGradeHref(course.id)} className="font-medium hover:text-brand-purple">
                        {course.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{course.teacher}</td>
                    <td className="py-3 pr-4">{pct !== null ? formatPercentage(pct) : "In progress"}</td>
                    <td className="py-3">
                      {grade.letterGrade ? (
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getLetterGradeStyle(grade.letterGrade))}>
                          {grade.letterGrade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GradesPanel>

      <GradesPanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">Recent assessments</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest graded and upcoming work</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {recent.map((assessment) => {
            const pct = getAssessmentPercentage(assessment);
            return (
              <Link
                key={assessment.id}
                href={assessmentHref(assessment.id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
              >
                <div className="min-w-0">
                  <p className="font-medium">{assessment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ASSESSMENT_TYPE_LABELS[assessment.type]} · {assessment.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatAssessmentScore(assessment)}</p>
                  {pct !== null ? (
                    <p className="text-xs text-muted-foreground">{formatPercentage(pct)}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </GradesPanel>
    </div>
  );
}
