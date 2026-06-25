"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardList, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  assignmentStatusClass,
  assignmentStatusLabel,
  courseHref,
  getAllStudentAssignments,
  getStudentCourseById,
  type CourseAssignment,
} from "./courses/student-course-data";
import { CourseActionLink, CourseDotTabs, CoursesPanel } from "./courses/course-ui";
import { Skeleton } from "@/components/ui/skeleton";

type AssignmentTab = "all" | "pending" | "submitted" | "graded";

const TABS: { id: AssignmentTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Due soon" },
  { id: "submitted", label: "Submitted" },
  { id: "graded", label: "Graded" },
];

function matchesTab(assignment: CourseAssignment, tab: AssignmentTab) {
  if (tab === "all") return true;
  if (tab === "pending") return assignment.status === "pending" || assignment.status === "overdue";
  if (tab === "submitted") return assignment.status === "submitted";
  return assignment.status === "graded";
}

function AssignmentStatCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "orange" | "blue" | "green";
}) {
  const styles =
    tone === "orange"
      ? { card: "border-brand-orange/15 bg-brand-orange/5", value: "text-brand-orange" }
      : tone === "blue"
        ? { card: "border-brand-blue/15 bg-brand-blue/5", value: "text-brand-blue" }
        : { card: "border-green/15 bg-green/5", value: "text-green" };

  return (
    <CoursesPanel className={cn("border p-4", styles.card)}>
      <p className={cn("text-3xl font-bold leading-none", styles.value)}>{value}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
    </CoursesPanel>
  );
}

export function StudentAssignments() {
  const isLoading = usePageLoading();
  const [activeTab, setActiveTab] = useState<AssignmentTab>("pending");
  const assignments = getAllStudentAssignments();

  const filtered = useMemo(
    () => assignments.filter((assignment) => matchesTab(assignment, activeTab)),
    [assignments, activeTab],
  );

  const stats = useMemo(
    () => ({
      pending: assignments.filter((a) => a.status === "pending" || a.status === "overdue").length,
      submitted: assignments.filter((a) => a.status === "submitted").length,
      graded: assignments.filter((a) => a.status === "graded").length,
    }),
    [assignments],
  );

  if (isLoading) {
    return (
      <div className="mx-auto min-w-0 w-full max-w-7xl space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-[20px]" />
          <Skeleton className="h-20 rounded-[20px]" />
          <Skeleton className="h-20 rounded-[20px]" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Homework and projects from all your enrolled courses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AssignmentStatCard value={stats.pending} label="Due soon" tone="orange" />
        <AssignmentStatCard value={stats.submitted} label="Submitted" tone="blue" />
        <AssignmentStatCard value={stats.graded} label="Graded" tone="green" />
      </div>

      <CoursesPanel className="space-y-4">
        <CourseDotTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assignments in this view"
            description="Switch tabs to see submitted work or graded assignments."
            action={
              activeTab !== "all" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full px-4"
                  onClick={() => setActiveTab("all")}
                >
                  View all assignments
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((assignment) => {
              const course = getStudentCourseById(assignment.courseId);
              if (!course) return null;

              const detailHref = `${courseHref(course.id, "assignments")}/${assignment.id}`;

              return (
                <CoursesPanel
                  key={assignment.id}
                  className="flex flex-col border border-border transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {course.title}
                      </p>
                      <h2 className="mt-1 text-base font-bold leading-snug">{assignment.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {assignment.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold",
                        assignmentStatusClass(assignment.status),
                      )}
                    >
                      {assignmentStatusLabel(assignment.status)}
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <li className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Due {assignment.dueDate}
                    </li>
                    <li>Max score: {assignment.maxScore}</li>
                    {assignment.score != null ? (
                      <li className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green" />
                        Score: {assignment.score}
                      </li>
                    ) : null}
                  </ul>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <CourseActionLink href={detailHref}>
                      Open assignment
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </CourseActionLink>
                    <CourseActionLink href={courseHref(course.id)} variant="outline">
                      View course
                    </CourseActionLink>
                  </div>
                </CoursesPanel>
              );
            })}
          </div>
        )}
      </CoursesPanel>
    </div>
  );
}
