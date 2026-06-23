"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  COURSE_SUB_NAV,
  courseHref,
  getStudentCourseById,
} from "./student-course-data";
import {
  CourseBackLink,
  CourseIllustration,
  CourseRating,
  CourseStatusBadge,
  CoursesPanel,
} from "./course-ui";

export function StudentCourseShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ courseId: string }>();
  const pathname = usePathname();
  const course = getStudentCourseById(params.courseId);

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <CourseBackLink />
        <CoursesPanel className="text-center">
          <h1 className="text-xl font-bold">Course not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This course does not exist or you are not enrolled in it.
          </p>
        </CoursesPanel>
      </div>
    );
  }

  const activeSegment = (() => {
    const base = `/student/courses/${course.id}`;
    if (pathname === base) return "";
    if (pathname.startsWith(`${base}/lessons`)) return "lessons";
    if (pathname.startsWith(`${base}/assignments`)) return "assignments";
    if (pathname.startsWith(`${base}/materials`)) return "materials";
    return "";
  })();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <CourseBackLink />

      <CoursesPanel className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <CourseIllustration
          illustration={course.illustration}
          className="h-[104px] w-[104px] sm:h-[118px] sm:w-[118px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CourseStatusBadge status={course.status} />
            <CourseRating rating={course.rating} />
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.teacher} · {course.teacherSubject}
          </p>
        </div>
      </CoursesPanel>

      <nav aria-label="Course sections" className="flex flex-wrap gap-2">
        {COURSE_SUB_NAV.map((item) => {
          const href = courseHref(course.id, item.segment || undefined);
          const isActive = item.segment === activeSegment;

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-orange text-ink"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {isActive ? (
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
