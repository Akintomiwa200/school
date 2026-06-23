"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  courseHref,
  getCourseLessons,
  getNextLesson,
  getStudentCourseById,
} from "./student-course-data";
import { CoursePrimaryButton, CoursesPanel } from "./course-ui";

export function StudentCourseLessons({ courseId }: { courseId: string }) {
  const isLoading = usePageLoading();
  const course = getStudentCourseById(courseId);

  if (!course) {
    return null;
  }

  const lessons = getCourseLessons(course.id);
  const nextLesson = getNextLesson(course.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {nextLesson ? (
        <CoursesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Up next
            </p>
            <p className="mt-1 text-base font-bold">
              Chapter {nextLesson.chapter}: {nextLesson.title}
            </p>
          </div>
          <CoursePrimaryButton href={`${courseHref(course.id, "lessons")}/${nextLesson.id}`}>
            Start lesson
          </CoursePrimaryButton>
        </CoursesPanel>
      ) : null}

      {lessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons available"
          description="Your teacher has not published lessons for this course yet."
        />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const href = `${courseHref(course.id, "lessons")}/${lesson.id}`;
            const content = (
              <CoursesPanel
                className={cn(
                  "flex items-center gap-4 transition-colors",
                  lesson.locked ? "opacity-60" : "hover:bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    lesson.completed
                      ? "bg-green/15 text-green"
                      : lesson.locked
                        ? "bg-muted text-muted-foreground"
                        : "bg-brand-orange/15 text-brand-orange",
                  )}
                >
                  {lesson.chapter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{lesson.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
                {lesson.completed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green" />
                ) : lesson.locked ? (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <span className="text-xs font-semibold text-brand-orange">Open</span>
                )}
              </CoursesPanel>
            );

            if (lesson.locked) {
              return <div key={lesson.id}>{content}</div>;
            }

            return (
              <Link key={lesson.id} href={href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
