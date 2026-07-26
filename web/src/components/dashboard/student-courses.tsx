"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useStudentCourses, type StudentCourseItem } from "@/hooks/use-dashboard-data";
import {
  CourseDotTabs,
  CourseIllustration,
  CoursePrimaryButton,
  CourseRating,
  CoursesPanel,
} from "./courses/course-ui";
import { StudentCoursesSkeleton } from "./student-courses-skeleton";

type CourseTab = "all" | "active" | "upcoming" | "completed";

const TABS: { id: CourseTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const ILLUSTRATIONS = [
  { bg: "bg-brand-yellow/35", accent: "bg-brand-yellow", emoji: "👩‍🎓" },
  { bg: "bg-brand-blue/30", accent: "bg-brand-blue", emoji: "🧤" },
  { bg: "bg-brand-pink/30", accent: "bg-brand-pink", emoji: "👨‍💼" },
  { bg: "bg-brand-purple/20", accent: "bg-brand-purple", emoji: "⚙️" },
  { bg: "bg-green/25", accent: "bg-green", emoji: "🗄️" },
];

function mapCourseStatus(status: string): CourseTab {
  const s = status.toLowerCase();
  if (s === "published" || s === "active") return "active";
  if (s === "archived" || s === "completed") return "completed";
  if (s === "draft" || s === "upcoming") return "upcoming";
  return "active";
}

function getDateString(course: StudentCourseItem): string {
  const date = course.startDate ?? course.endDate;
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function getDatePrefix(status: CourseTab): string {
  if (status === "upcoming") return "Start";
  if (status === "completed") return "Taken";
  return "Started";
}

function courseHref(courseId: string, segment?: string) {
  const base = `/student/courses/${courseId}`;
  return segment ? `${base}/${segment}` : base;
}

function CourseCard({ course, index }: { course: StudentCourseItem; index: number }) {
  const status = mapCourseStatus(course.status);
  const datePrefix = getDatePrefix(status);
  const href = courseHref(course.id);
  const illustration = ILLUSTRATIONS[index % ILLUSTRATIONS.length];

  return (
    <CoursesPanel className="flex gap-4 sm:gap-5">
      <Link href={href} className="shrink-0">
        <CourseIllustration
          illustration={illustration}
          className="h-[104px] w-[104px] transition-opacity hover:opacity-90 sm:h-[118px] sm:w-[118px]"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0 hover:text-brand-orange">
            <h2 className="text-heading-sm font-bold leading-snug text-card-foreground">{course.title}</h2>
          </Link>
          <CourseRating rating={course.averageScore ? Math.round(course.averageScore / 20 * 10) / 10 : 4.0} />
        </div>

        <p className="mt-1.5 line-clamp-2 text-type-link-sm leading-relaxed text-muted-foreground">
          {course.description ?? "Course description not available."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {course.subject}
          </span>
          {course.mode && (
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {course.mode}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-type-link-sm">
            <span className="text-muted-foreground">{datePrefix}: </span>
            <span className="font-medium text-card-foreground">{getDateString(course)}</span>
          </p>
          <CoursePrimaryButton href={href}>Open course</CoursePrimaryButton>
        </div>
      </div>
    </CoursesPanel>
  );
}

function getWeekDays(focusDate: Date) {
  const weekday = focusDate.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(focusDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(focusDate.getDate() + mondayOffset);

  return WEEKDAYS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      label,
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isSelected:
        date.getFullYear() === focusDate.getFullYear() &&
        date.getMonth() === focusDate.getMonth() &&
        date.getDate() === focusDate.getDate(),
    };
  });
}

function CoursesCalendar() {
  const [focusDate, setFocusDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const monthLabel = focusDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = useMemo(() => getWeekDays(focusDate), [focusDate]);
  const shiftMonth = (delta: number) => {
    setFocusDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      return next;
    });
  };

  return (
    <CoursesPanel>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-card-foreground">{monthLabel}</h3>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => shiftMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Previous month">
            <ChevronLeft size={15} />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Next month">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <button key={`${day.year}-${day.month}-${day.date}`} type="button" onClick={() => setFocusDate(new Date(day.year, day.month, day.date))} className="flex flex-col items-center gap-1.5 py-0.5">
            <span className="text-[10px] font-medium text-muted-foreground">{day.label}</span>
            <span className={cn("text-sm font-semibold transition-colors", day.isSelected ? "text-brand-orange" : "text-card-foreground", day.month !== focusDate.getMonth() && "text-muted-foreground/70")}>
              {day.date}
            </span>
            {day.isSelected ? <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> : <span className="h-1.5 w-1.5" />}
          </button>
        ))}
      </div>
    </CoursesPanel>
  );
}

function CoursesSchedule({ courses }: { courses: StudentCourseItem[] }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];

  return (
    <CoursesPanel className="bg-muted">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Schedule</h3>
        <Link href="/student/timetable" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          See All
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No schedule yet" description="Your class schedule will appear here once courses are assigned." className="mt-4 border-none bg-transparent py-8" />
      ) : (
        <div className="mt-4 space-y-1.5">
          {courses.slice(0, 5).map((course, index) => (
            <Link key={course.id} href={courseHref(course.id)} className="flex min-h-[5rem] items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-card/60">
              <span className="w-9 shrink-0 text-center text-xl font-bold leading-none tabular-nums text-foreground">
                {String(today.getDate()).padStart(2, "0")}
              </span>
              <div className="h-16 w-px shrink-0 border-l border-dashed border-border" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{course.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{course.subject}</p>
              </div>
              <p className="shrink-0 text-xs font-medium text-muted-foreground">{dayName}</p>
            </Link>
          ))}
        </div>
      )}
    </CoursesPanel>
  );
}

function CoursesSidebar({ courses }: { courses: StudentCourseItem[] }) {
  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-24">
      <CoursesCalendar />
      <CoursesSchedule courses={courses} />
    </aside>
  );
}

const EMPTY_COURSES: StudentCourseItem[] = [];

export function StudentCourses() {
  const isLoading = usePageLoading();
  const { data: courses } = useStudentCourses(EMPTY_COURSES);
  const [activeTab, setActiveTab] = useState<CourseTab>("all");

  const filteredCourses = useMemo(() => {
    const list = courses ?? [];
    if (activeTab === "all") return list;
    return list.filter((course) => mapCourseStatus(course.status) === activeTab);
  }, [activeTab, courses]);

  if (isLoading) {
    return <StudentCoursesSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Courses
          </h1>

          <CourseDotTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

          <div className="space-y-5">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No courses in this category"
                description="Try another tab to browse your enrolled courses."
                action={
                  activeTab !== "all" ? (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("all")}>
                      View all courses
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>

        <CoursesSidebar courses={courses ?? []} />
      </div>
    </div>
  );
}
