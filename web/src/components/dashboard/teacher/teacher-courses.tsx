"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  PencilRuler,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTeacherCourses } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  DashboardSearchField,
  dashboardFilterBarClass,
  dashboardFilterSelectClass,
} from "../form-controls";
import { ManagementPanel } from "../management/management-ui";
import { TeacherLiveBadge, teacherInitialLoading } from "./teacher-workflow-ui";

type CourseItem = {
  id: string;
  title: string;
  modules: number;
  lessons: number;
  students: number;
  progress: number;
  classId: string;
  className: string;
  status?: "draft" | "in_progress" | "published";
  lastUpdated?: string;
};

type CoursesData = {
  classes: { id: string; name: string }[];
  courses: CourseItem[];
  subjects?: { id: string; name: string; code: string; classId: string }[];
};

const COURSES_EMPTY: CoursesData = {
  classes: [],
  courses: [],
};

const COURSE_CARD_STYLES = {
  purple: "border-brand-purple/15 bg-brand-purple/8",
  blue: "border-brand-blue/15 bg-brand-blue/8",
  green: "border-green/15 bg-green/8",
  orange: "border-brand-orange/15 bg-brand-orange/8",
  pink: "border-brand-pink/15 bg-brand-pink/8",
} as const;

const COURSE_ICONS = [Sparkles, BookOpen, Layers, GraduationCap, PencilRuler] as const;

const STATUS_BADGES = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-brand-blue/10 text-brand-blue",
  published: "bg-green/10 text-green",
} as const;

const STATUS_LABELS = {
  draft: "Draft",
  in_progress: "In Progress",
  published: "Published",
} as const;

const PROGRESS_COLORS = {
  high: { bar: "bg-green", badge: "bg-green/10 text-green" },
  medium: { bar: "bg-brand-blue", badge: "bg-brand-blue/10 text-brand-blue" },
  low: { bar: "bg-brand-orange", badge: "bg-brand-orange/10 text-brand-orange" },
  none: { bar: "bg-muted-foreground/30", badge: "bg-muted text-muted-foreground" },
} as const;

function getProgressColor(progress: number) {
  if (progress >= 80) return PROGRESS_COLORS.high;
  if (progress >= 50) return PROGRESS_COLORS.medium;
  if (progress > 0) return PROGRESS_COLORS.low;
  return PROGRESS_COLORS.none;
}

function getCourseCardStyle(index: number) {
  const keys = Object.keys(COURSE_CARD_STYLES) as (keyof typeof COURSE_CARD_STYLES)[];
  return COURSE_CARD_STYLES[keys[index % keys.length]];
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CoursesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 rounded-xl bg-muted" />
          <div className="h-5 w-64 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-40 rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[24px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-[24px] bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function TeacherCourses() {
  const { data: session } = useSession();
  const pageLoading = usePageLoading();
  const { data: coursesData = COURSES_EMPTY, isFetching, isFetched } =
    useTeacherCourses<CoursesData>(COURSES_EMPTY);
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const courses = coursesData.courses ?? [];
  const classes = coursesData.classes ?? [];

  // Filter by class if selected
  const classFiltered = useMemo(() => {
    if (!classId) return courses;
    return courses.filter((c) => c.classId === classId);
  }, [courses, classId]);

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return classFiltered;
    const q = search.toLowerCase();
    return classFiltered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q)
    );
  }, [classFiltered, search]);

  const isLoading = teacherInitialLoading(pageLoading, isFetching, isFetched);

  // Calculate real statistics
  const totalCourses = courses.length;
  const totalModules = courses.reduce((sum, c) => sum + (c.modules || 0), 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);
  const avgProgress =
    totalCourses > 0
      ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
      : 0;
  const publishedCourses = courses.filter(
    (c) => c.progress === 100 || c.status === "published"
  ).length;
  const inProgressCourses = courses.filter(
    (c) => (c.progress > 0 && c.progress < 100) || c.status === "in_progress"
  ).length;

  const teacherName = session?.user?.name?.split(" ")[0] ?? "Teacher";
  const selectedClass = classes.find((c) => c.id === classId);

  if (isLoading) return <CoursesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Courses
            </h1>
            <TeacherLiveBadge isFetching={isFetching} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCourses > 0
              ? `${totalCourses} courses · ${totalModules} modules · ${totalLessons} lessons`
              : "No courses created yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full",
              viewMode === "grid" && "bg-brand-purple/10 border-brand-purple/30"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Layers className="mr-2 h-4 w-4" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full",
              viewMode === "list" && "bg-brand-purple/10 border-brand-purple/30"
            )}
            onClick={() => setViewMode("list")}
          >
            <FileText className="mr-2 h-4 w-4" />
            List
          </Button>
          {totalCourses > 0 && (
            <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href="/teacher/courses/create">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Welcome Banner - Only show when courses exist */}
      {totalCourses > 0 && (
        <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-purple to-brand-blue p-0 text-white shadow-float">
          <div className="relative z-10 p-6 sm:p-8 sm:pr-40 lg:pr-48">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-white/85">Course Management</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
                {teacherName}&apos;s Curriculum
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
                {avgProgress >= 80
                  ? "Great progress! Most of your courses are near completion."
                  : avgProgress >= 50
                  ? "Keep building! Your courses are coming along nicely."
                  : "Start creating engaging content for your students."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {publishedCourses} Published
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {inProgressCourses} In Progress
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {totalStudents} Students
                </span>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
          >
            <BookOpen className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
          </div>
        </ManagementPanel>
      )}

      {/* Quick Stats */}
      {totalCourses > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10">
                <BookOpen className="h-5 w-5 text-brand-purple" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalCourses}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
                <Layers className="h-5 w-5 text-brand-blue" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalModules}</p>
                <p className="text-xs text-muted-foreground">
                  Modules · {totalLessons} Lessons
                </p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  avgProgress >= 80
                    ? "bg-green/10"
                    : avgProgress >= 50
                    ? "bg-brand-blue/10"
                    : "bg-brand-orange/10"
                )}
              >
                <Clock
                  className={cn(
                    "h-5 w-5",
                    avgProgress >= 80
                      ? "text-green"
                      : avgProgress >= 50
                      ? "text-brand-blue"
                      : "text-brand-orange"
                  )}
                />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">
                  {avgProgress >= 80
                    ? "On Track"
                    : avgProgress >= 50
                    ? "In Progress"
                    : "Getting Started"}
                </p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10">
                <CheckCircle2 className="h-5 w-5 text-green" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{publishedCourses}</p>
                <p className="text-xs text-muted-foreground">
                  Published · {inProgressCourses} Draft
                </p>
              </div>
            </div>
          </ManagementPanel>
        </div>
      )}

      {/* Filters */}
      <div className={dashboardFilterBarClass()} data-filter-bar="true">
        <DashboardSearchField
          value={search}
          onChange={setSearch}
          placeholder="Search courses by name or class..."
          type="text"
          inputClassName="bg-background pl-9 pr-4"
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className={dashboardFilterSelectClass}
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        {search && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Found {filtered.length} of {totalCourses} courses
          </p>
        )}
      </div>

      {/* Empty State */}
      {totalCourses === 0 && (
        <ManagementPanel className="border border-border py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No courses yet</p>
          <p className="mt-1 mb-6 text-xs text-muted-foreground/70">
            Create your first course to start organizing lessons and content.
          </p>
          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href="/teacher/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
        </ManagementPanel>
      )}

      {/* No Results State */}
      {totalCourses > 0 && filtered.length === 0 && (
        <ManagementPanel className="border border-border py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No courses found</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {search
              ? `No results for "${search}". Try a different search term.`
              : classId
              ? `No courses in ${selectedClass?.name || "this class"}.`
              : "No courses match your filters."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            onClick={() => {
              setSearch("");
              setClassId("");
            }}
          >
            Clear filters
          </Button>
        </ManagementPanel>
      )}

      {/* Grid View */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course, index) => {
            const cardStyle = getCourseCardStyle(index);
            const IconComponent = COURSE_ICONS[index % COURSE_ICONS.length];
            const progressColor = getProgressColor(course.progress || 0);
            const status = course.status || (course.progress === 100 ? "published" : course.progress > 0 ? "in_progress" : "draft");

            return (
              <Link
                key={course.id}
                href={`/teacher/courses/${course.id}`}
                className="group block"
              >
                <ManagementPanel
                  className={cn(
                    "h-full border transition-all hover:-translate-y-0.5 hover:shadow-float",
                    cardStyle
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm",
                        index % 2 === 0 ? "bg-brand-purple text-white" : "bg-brand-blue text-white"
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                        STATUS_BADGES[status]
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-brand-purple transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  {/* Class Name */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {course.className}
                  </p>

                  {/* Stats */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {course.modules || 0} modules
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {course.lessons || 0} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.students || 0} students
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Progress
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold tabular-nums",
                          progressColor.badge
                        )}
                      >
                        {course.progress || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
                      <div
                        className={cn("h-full rounded-full transition-all", progressColor.bar)}
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {course.lastUpdated
                        ? `Updated ${formatRelativeDate(course.lastUpdated)}`
                        : "Not modified"}
                    </span>
                    <span className="text-xs font-semibold text-brand-purple opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ChevronRight className="ml-0.5 inline h-3 w-3" />
                    </span>
                  </div>
                </ManagementPanel>
              </Link>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && filtered.length > 0 && (
        <ManagementPanel className="overflow-hidden border border-border p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Content</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((course) => {
                  const progressColor = getProgressColor(course.progress || 0);
                  const status = course.status || (course.progress === 100 ? "published" : course.progress > 0 ? "in_progress" : "draft");

                  return (
                    <tr
                      key={course.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple/10">
                            <BookOpen className="h-4 w-4 text-brand-purple" />
                          </span>
                          <div>
                            <Link
                              href={`/teacher/courses/${course.id}`}
                              className="font-semibold text-foreground hover:text-brand-purple transition-colors"
                            >
                              {course.title}
                            </Link>
                            {course.lastUpdated && (
                              <p className="text-xs text-muted-foreground">
                                Updated {formatRelativeDate(course.lastUpdated)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/teacher/classes/${course.classId}`}
                          className="text-muted-foreground hover:text-brand-purple transition-colors"
                        >
                          {course.className}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div className="space-y-1">
                          <p className="text-xs">{course.modules || 0} modules</p>
                          <p className="text-xs">{course.lessons || 0} lessons</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{course.students || 0}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            STATUS_BADGES[status]
                          )}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-all", progressColor.bar)}
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums",
                              progressColor.badge
                            )}
                          >
                            {course.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/teacher/courses/${course.id}`}
                          className="inline-flex items-center text-sm font-semibold text-brand-purple hover:underline"
                        >
                          Open <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {totalCourses} course{totalCourses !== 1 ? "s" : ""}
          </div>
        </ManagementPanel>
      )}
    </div>
  );
}
