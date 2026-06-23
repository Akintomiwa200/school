"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  courseHref,
  getCourseLesson,
  getCourseLessons,
  getStudentCourseById,
} from "./student-course-data";
import { CoursesPanel } from "./course-ui";

export function StudentCourseLesson({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const isLoading = usePageLoading();
  const course = getStudentCourseById(courseId);
  const lesson = course ? getCourseLesson(courseId, lessonId) : undefined;

  if (!course) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-[20px]" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <CoursesPanel className="text-center">
        <h2 className="text-lg font-bold">Lesson not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This lesson does not exist or is not available yet.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={courseHref(courseId, "lessons")}>Back to lessons</Link>
        </Button>
      </CoursesPanel>
    );
  }

  if (lesson.locked) {
    return (
      <CoursesPanel className="text-center">
        <h2 className="text-lg font-bold">Lesson locked</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete the previous chapter to unlock this lesson.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={courseHref(courseId, "lessons")}>Back to lessons</Link>
        </Button>
      </CoursesPanel>
    );
  }

  const lessons = getCourseLessons(course.id);
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="space-y-5">
      <CoursesPanel>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Chapter {lesson.chapter}
        </p>
        <h2 className="mt-1 text-xl font-bold">{lesson.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{lesson.summary}</p>
        <p className="mt-4 text-sm leading-relaxed text-foreground">{lesson.content}</p>
        {lesson.completed ? (
          <p className="mt-5 text-sm font-medium text-green">You completed this lesson.</p>
        ) : (
          <Button className="mt-5 rounded-full bg-brand-orange text-ink hover:bg-brand-orange/90">
            Mark as complete
          </Button>
        )}
      </CoursesPanel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {previousLesson && !previousLesson.locked ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`${courseHref(course.id, "lessons")}/${previousLesson.id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {nextLesson && !nextLesson.locked ? (
          <Button asChild className="rounded-full bg-brand-orange text-ink hover:bg-brand-orange/90">
            <Link href={`${courseHref(course.id, "lessons")}/${nextLesson.id}`}>
              Next lesson
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
