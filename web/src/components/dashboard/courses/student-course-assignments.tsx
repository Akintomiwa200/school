"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardList, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CourseActionLink, CourseDotTabs, CoursesPanel } from "./course-ui";

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
  const assignments = course ? getCourseAssignments(course.id) : [];

  const filtered = useMemo(
    () => assignments.filter((assignment) => matchesTab(assignment, activeTab)),
    [assignments, activeTab],
  );

  if (!course) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-w-0 space-y-4">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <CoursesPanel className="space-y-4">
        <CourseDotTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assignments in this view"
            description="Try another filter or check back when new work is posted."
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
              const detailHref = `${courseHref(course.id, "assignments")}/${assignment.id}`;

              return (
                <CoursesPanel
                  key={assignment.id}
                  className="flex flex-col border border-border transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold leading-snug">{assignment.title}</h2>
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

                  <CourseActionLink href={detailHref} className="mt-4">
                    Open assignment
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </CourseActionLink>
                </CoursesPanel>
              );
            })}
          </div>
        )}
      </CoursesPanel>
    </div>
  );
}
