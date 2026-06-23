"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentTime } from "@/hooks/use-current-time";
import { usePageLoading } from "@/hooks/use-page-loading";
import { getActiveScheduleItemId } from "@/lib/schedule-time";
import { cn } from "@/lib/utils";
import {
  CourseDotTabs,
  CourseIllustration,
  CoursePrimaryButton,
  CourseRating,
  CoursesPanel,
} from "./courses/course-ui";
import {
  STUDENT_COURSES,
  courseHref,
  getCourseScheduleItems,
  getDatePrefix,
  type CourseTab,
  type StudentCourseListItem,
} from "./courses/student-course-data";
import { StudentCoursesSkeleton } from "./student-courses-skeleton";

const TABS: { id: CourseTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function CourseCard({ course }: { course: StudentCourseListItem }) {
  const datePrefix = getDatePrefix(course.status);
  const href = courseHref(course.id);

  return (
    <CoursesPanel className="flex gap-4 sm:gap-5">
      <Link href={href} className="shrink-0">
        <CourseIllustration
          illustration={course.illustration}
          className="h-[104px] w-[104px] transition-opacity hover:opacity-90 sm:h-[118px] sm:w-[118px]"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0 hover:text-brand-orange">
            <h2 className="text-heading-sm font-bold leading-snug text-card-foreground">{course.title}</h2>
          </Link>
          <CourseRating rating={course.rating} />
        </div>

        <p className="mt-1.5 line-clamp-2 text-type-link-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-type-link-sm">
            <span className="text-muted-foreground">{datePrefix}: </span>
            <span className="font-medium text-card-foreground">{course.dateValue}</span>
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

  const monthLabel = focusDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <button
            key={`${day.year}-${day.month}-${day.date}`}
            type="button"
            onClick={() => setFocusDate(new Date(day.year, day.month, day.date))}
            className="flex flex-col items-center gap-1.5 py-0.5"
          >
            <span className="text-[10px] font-medium text-muted-foreground">{day.label}</span>
            <span
              className={cn(
                "text-sm font-semibold transition-colors",
                day.isSelected ? "text-brand-orange" : "text-card-foreground",
                day.month !== focusDate.getMonth() && "text-muted-foreground/70",
              )}
            >
              {day.date}
            </span>
            {day.isSelected ? (
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            ) : (
              <span className="h-1.5 w-1.5" />
            )}
          </button>
        ))}
      </div>
    </CoursesPanel>
  );
}

function CoursesSchedule({
  items,
}: {
  items: ReturnType<typeof getCourseScheduleItems>;
}) {
  const now = useCurrentTime();
  const activeId = useMemo(() => getActiveScheduleItemId(items, now), [items, now]);

  return (
    <CoursesPanel className="bg-muted">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Schedule</h3>
        <Link
          href="/student/timetable"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          See All
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No schedule yet"
          description="Your class schedule will appear here once courses are assigned."
          className="mt-4 border-none bg-transparent py-8"
        />
      ) : (
        <div className="mt-4 space-y-1.5">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <Link
                key={item.id}
                href={courseHref(item.courseId)}
                className={cn(
                  "flex min-h-[5rem] items-center gap-3 transition-colors",
                  isActive
                    ? "rounded-lg bg-card px-3 py-5 text-card-foreground shadow-float"
                    : "rounded-lg px-1 py-3 hover:bg-card/60",
                )}
              >
                <span className="w-9 shrink-0 text-center text-xl font-bold leading-none tabular-nums text-foreground">
                  {String(item.day).padStart(2, "0")}
                </span>

                <div
                  className="h-16 w-px shrink-0 border-l border-dashed border-border"
                  aria-hidden
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.progress}</p>
                </div>

                <p className="shrink-0 text-xs font-medium text-muted-foreground">{item.time}</p>
              </Link>
            );
          })}
        </div>
      )}
    </CoursesPanel>
  );
}

function CoursesSidebar({ schedule }: { schedule: ReturnType<typeof getCourseScheduleItems> }) {
  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-24">
      <CoursesCalendar />
      <CoursesSchedule items={schedule} />
    </aside>
  );
}

export function StudentCourses() {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const [activeTab, setActiveTab] = useState<CourseTab>("upcoming");
  const dayKey = now.toDateString();
  const scheduleItems = useMemo(() => getCourseScheduleItems(now), [dayKey]);

  const filteredCourses = useMemo(() => {
    if (activeTab === "all") return STUDENT_COURSES;
    return STUDENT_COURSES.filter((course) => course.status === activeTab);
  }, [activeTab]);

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
              filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)
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

        <CoursesSidebar schedule={scheduleItems} />
      </div>
    </div>
  );
}
