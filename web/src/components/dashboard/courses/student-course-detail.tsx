"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  courseHref,
  getCourseAssignments,
  getCourseLessons,
  getNextLesson,
  getStudentCourseById,
} from "./student-course-data";
import { CoursePrimaryButton, CoursesPanel } from "./course-ui";
import { StudentCourseDetailSkeleton } from "./student-course-detail-skeleton";

export function StudentCourseDetail({ courseId }: { courseId: string }) {
  const isLoading = usePageLoading();
  const course = getStudentCourseById(courseId);

  if (!course) {
    return null;
  }

  const lessons = getCourseLessons(course.id);
  const assignments = getCourseAssignments(course.id);
  const nextLesson = getNextLesson(course.id);
  const progressPct = Math.round((course.completedChapters / course.totalChapters) * 100);
  const pendingAssignments = assignments.filter((item) => item.status === "pending" || item.status === "overdue");

  if (isLoading) {
    return <StudentCourseDetailSkeleton />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
      <div className="space-y-5">
        <CoursesPanel>
          <h2 className="text-base font-bold">About this course</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.overview}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </CoursesPanel>

        <CoursesPanel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Recent lessons</h2>
            <Link
              href={courseHref(course.id, "lessons")}
              className="text-xs font-semibold text-foreground underline underline-offset-2"
            >
              See all
            </Link>
          </div>
          {lessons.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No lessons yet"
              description="Lessons will appear here once the course begins."
              className="border-none bg-transparent py-6"
            />
          ) : (
            <div className="space-y-3">
              {lessons.slice(0, 4).map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`${courseHref(course.id, "lessons")}/${lesson.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-muted/45 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Chapter {lesson.chapter}</p>
                    <p className="truncate text-sm font-semibold">{lesson.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{lesson.duration}</span>
                </Link>
              ))}
            </div>
          )}
        </CoursesPanel>
      </div>

      <aside className="space-y-4">
        <CoursesPanel>
          <h2 className="text-base font-bold">Your progress</h2>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold text-brand-orange">{progressPct}%</p>
            {course.grade ? (
              <p className="text-sm text-muted-foreground">
                Grade: <span className="font-semibold text-foreground">{course.grade}</span>
              </p>
            ) : null}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-orange transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {course.completedChapters} of {course.totalChapters} chapters completed
          </p>
          {nextLesson ? (
            <div className="mt-5">
              <CoursePrimaryButton href={`${courseHref(course.id, "lessons")}/${nextLesson.id}`}>
                Continue learning
              </CoursePrimaryButton>
            </div>
          ) : null}
        </CoursesPanel>

        <CoursesPanel className="bg-muted">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Assignments</h2>
            <Link
              href={courseHref(course.id, "assignments")}
              className="text-xs font-semibold text-foreground underline underline-offset-2"
            >
              See all
            </Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="All caught up"
              description="No pending assignments for this course right now."
              className="border-none bg-transparent py-6"
            />
          ) : (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 3).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`${courseHref(course.id, "assignments")}/${assignment.id}`}
                  className="block rounded-2xl bg-card px-4 py-3 shadow-float transition-opacity hover:opacity-90"
                >
                  <p className="truncate text-sm font-semibold">{assignment.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Due {assignment.dueDate}</p>
                </Link>
              ))}
            </div>
          )}
        </CoursesPanel>

        <CoursesPanel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Materials</h2>
            <Link
              href={courseHref(course.id, "materials")}
              className="text-xs font-semibold text-foreground underline underline-offset-2"
            >
              See all
            </Link>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/45 px-4 py-3">
            <FileText className="h-5 w-5 text-brand-blue" />
            <p className="text-sm text-muted-foreground">Syllabus, slides, and reading packs</p>
          </div>
        </CoursesPanel>
      </aside>
    </div>
  );
}
