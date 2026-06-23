"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
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
import { CourseDotTabs, CoursesPanel } from "./courses/course-ui";
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

export function StudentAssignments() {
  const isLoading = usePageLoading();
  const [activeTab, setActiveTab] = useState<AssignmentTab>("pending");
  const assignments = getAllStudentAssignments();

  const filtered = useMemo(
    () => assignments.filter((assignment) => matchesTab(assignment, activeTab)),
    [assignments, activeTab],
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-64" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Homework and projects from all your enrolled courses.
        </p>
      </div>

      <CourseDotTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments in this view"
          description="Switch tabs to see submitted work or graded assignments."
          action={
            activeTab !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="text-sm font-medium text-brand-orange underline underline-offset-2"
              >
                View all assignments
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment) => {
            const course = getStudentCourseById(assignment.courseId);
            if (!course) return null;

            return (
              <CoursesPanel key={assignment.id} className="transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{course.title}</p>
                    <Link
                      href={`${courseHref(course.id, "assignments")}/${assignment.id}`}
                      className="mt-1 block text-sm font-bold hover:text-brand-orange"
                    >
                      {assignment.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {assignment.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      assignmentStatusClass(assignment.status),
                    )}
                  >
                    {assignmentStatusLabel(assignment.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>Due {assignment.dueDate}</span>
                  <span>Max score: {assignment.maxScore}</span>
                  <Link
                    href={courseHref(course.id)}
                    className="font-medium text-brand-orange underline underline-offset-2"
                  >
                    View course
                  </Link>
                  <Link
                    href={`${courseHref(course.id, "assignments")}/${assignment.id}`}
                    className="font-medium text-foreground underline underline-offset-2"
                  >
                    Open assignment
                  </Link>
                </div>
              </CoursesPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
