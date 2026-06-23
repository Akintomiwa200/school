"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  assignmentStatusClass,
  assignmentStatusLabel,
  courseHref,
  getCourseAssignment,
  getStudentCourseById,
} from "./student-course-data";
import { CourseBackLink, CoursesPanel } from "./course-ui";

export function StudentCourseAssignment({
  courseId,
  assignmentId,
}: {
  courseId: string;
  assignmentId: string;
}) {
  const isLoading = usePageLoading();
  const course = getStudentCourseById(courseId);
  const assignment = course ? getCourseAssignment(courseId, assignmentId) : undefined;

  if (!course) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-[20px]" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <CoursesPanel className="text-center">
        <h2 className="text-lg font-bold">Assignment not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This assignment does not exist or is no longer available.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={courseHref(courseId, "assignments")}>Back to assignments</Link>
        </Button>
      </CoursesPanel>
    );
  }

  const canSubmit = assignment.status === "pending" || assignment.status === "overdue";

  return (
    <div className="space-y-5">
      <CourseBackLink href={courseHref(course.id, "assignments")} label="Back to assignments" />

      <CoursesPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{course.title}</p>
            <h2 className="mt-1 text-xl font-bold">{assignment.title}</h2>
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

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{assignment.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Due date</p>
            <p className="mt-1 text-sm font-semibold">{assignment.dueDate}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Max score</p>
            <p className="mt-1 text-sm font-semibold">{assignment.maxScore}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Your score</p>
            <p className="mt-1 text-sm font-semibold">
              {assignment.score != null ? assignment.score : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-bold">Instructions</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{assignment.instructions}</p>
        </div>

        {canSubmit ? (
          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium" htmlFor="submission">
              Your submission
            </label>
            <textarea
              id="submission"
              rows={5}
              placeholder="Write your answer or paste a link to your uploaded file..."
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button className="rounded-full bg-brand-orange text-ink hover:bg-brand-orange/90">
              Submit assignment
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            {assignment.status === "submitted"
              ? "Your work has been submitted and is awaiting grading."
              : "This assignment has been graded. View feedback from your teacher in the gradebook."}
          </p>
        )}
      </CoursesPanel>

      <Button asChild variant="outline" className="rounded-full">
        <Link href={courseHref(course.id)}>Back to course overview</Link>
      </Button>
    </div>
  );
}
