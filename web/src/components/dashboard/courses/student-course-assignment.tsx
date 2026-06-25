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
      <div className="min-w-0 space-y-4">
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
        <Button asChild variant="outline" className="mt-4 h-10 shrink-0 rounded-full px-4">
          <Link href={courseHref(courseId, "assignments")}>Back to assignments</Link>
        </Button>
      </CoursesPanel>
    );
  }

  const canSubmit = assignment.status === "pending" || assignment.status === "overdue";

  return (
    <div className="min-w-0 space-y-5">
      <CourseBackLink href={courseHref(course.id, "assignments")} label="Back to assignments" />

      <CoursesPanel className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {course.title}
            </p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">{assignment.title}</h2>
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

        <p className="text-sm leading-relaxed text-muted-foreground">{assignment.description}</p>

        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="min-w-0 rounded-2xl bg-muted/40 px-4 py-3">
            <dt className="text-xs text-muted-foreground">Due date</dt>
            <dd className="mt-1 text-sm font-semibold">{assignment.dueDate}</dd>
          </div>
          <div className="min-w-0 rounded-2xl bg-muted/40 px-4 py-3">
            <dt className="text-xs text-muted-foreground">Max score</dt>
            <dd className="mt-1 text-sm font-semibold">{assignment.maxScore}</dd>
          </div>
          <div className="min-w-0 rounded-2xl bg-muted/40 px-4 py-3">
            <dt className="text-xs text-muted-foreground">Your score</dt>
            <dd className="mt-1 text-sm font-semibold">
              {assignment.score != null ? assignment.score : "—"}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="text-sm font-bold">Instructions</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{assignment.instructions}</p>
        </div>

        {canSubmit ? (
          <div className="space-y-3 border-t border-border pt-5">
            <label className="block text-sm font-medium" htmlFor="submission">
              Your submission
            </label>
            <textarea
              id="submission"
              rows={5}
              placeholder="Write your answer or paste a link to your uploaded file..."
              className="min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button className="h-11 w-full rounded-full bg-brand-orange text-ink hover:bg-brand-orange/90 sm:w-auto sm:px-6">
              Submit assignment
            </Button>
          </div>
        ) : (
          <p className="rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {assignment.status === "submitted"
              ? "Your work has been submitted and is awaiting grading."
              : "This assignment has been graded. View feedback from your teacher in the gradebook."}
          </p>
        )}
      </CoursesPanel>

      <Button asChild variant="outline" className="h-10 w-full shrink-0 rounded-full px-4 sm:w-auto">
        <Link href={courseHref(course.id)}>Back to course overview</Link>
      </Button>
    </div>
  );
}
