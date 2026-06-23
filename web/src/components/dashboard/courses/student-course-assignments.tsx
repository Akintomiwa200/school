"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  assignmentStatusClass,
  assignmentStatusLabel,
  courseHref,
  getCourseAssignments,
  getStudentCourseById,
  type CourseAssignment,
} from "./student-course-data";
import { CourseDotTabs, CoursesPanel } from "./course-ui";

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

export function StudentCourseAssignments({ courseId }: { courseId: string }) {
  const isLoading = usePageLoading();
  const [activeTab, setActiveTab] = useState<AssignmentTab>("all");
  const course = getStudentCourseById(courseId);

  if (!course) {
    return null;
  }

  const assignments = getCourseAssignments(course.id);
  const filtered = useMemo(
    () => assignments.filter((assignment) => matchesTab(assignment, activeTab)),
    [assignments, activeTab],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CourseDotTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments in this view"
          description="Try another filter or check back when new work is posted."
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
          {filtered.map((assignment) => (
            <Link
              key={assignment.id}
              href={`${courseHref(course.id, "assignments")}/${assignment.id}`}
              className="block"
            >
              <CoursesPanel className="transition-colors hover:bg-muted/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{assignment.title}</p>
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
                  {assignment.score != null ? <span>Score: {assignment.score}</span> : null}
                </div>
              </CoursesPanel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
