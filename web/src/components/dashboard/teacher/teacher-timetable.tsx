"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  GraduationCap,
  MapPin,
  Users,
  Bell,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherTimetable } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { TeacherLiveBadge, teacherInitialLoading } from "./teacher-workflow-ui";

type TimetableDay = {
  day: string;
  periods: { time: string; subject: string; room: string; classId?: string }[];
};

type TimetableEntry = TimetableDay & {
  date: string; // ISO date string
};

type WeeklySchedule = {
  weekLabel: string;
  days: TimetableEntry[];
};

function TimetableSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-10 w-56 rounded-xl bg-muted" />
          <div className="h-5 w-40 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-[24px] bg-muted" />
        ))}
      </div>
    </div>
  );
}

const PERIOD_COLORS = [
  "border-l-brand-purple bg-brand-purple/5",
  "border-l-brand-blue bg-brand-blue/5",
  "border-l-green bg-green/5",
  "border-l-brand-orange bg-brand-orange/5",
  "border-l-brand-pink bg-brand-pink/5",
  "border-l-brand-yellow bg-brand-yellow/5",
] as const;

const DAY_LABELS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function getCurrentWeekLabel(): string {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${formatDate(startOfWeek)} – ${formatDate(endOfWeek)}`;
}

function getWeekFromOffset(offset: number): string {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${formatDate(startOfWeek)} – ${formatDate(endOfWeek)}`;
}

export function TeacherTimetable() {
  const { data: session } = useSession();
  const loading = usePageLoading();
  const { data: rawTimetable = [], isFetching, isFetched } = useTeacherTimetable<TimetableEntry[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekLabel = useMemo(() => getWeekFromOffset(weekOffset), [weekOffset]);
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay() + 1);

  const isCurrentWeek = weekOffset === 0;
  const isPastWeek = weekOffset < 0;

  const teacherName = session?.user?.name?.split(" ")[0] ?? "Teacher";

  // Transform timetable data to include date references
  const weekDays = useMemo(() => {
    const baseDate = new Date(currentWeekStart);
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);

    return rawTimetable.map((day, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        ...day,
        date: date.toISOString(),
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      };
    });
  }, [rawTimetable, weekOffset, today, currentWeekStart]);

  const totalPeriods = useMemo(
    () => weekDays.reduce((acc, day) => acc + day.periods.length, 0),
    [weekDays]
  );

  const totalSubjects = useMemo(() => {
    const subjects = new Set(
      weekDays.flatMap((day) => day.periods.map((p) => p.subject))
    );
    return subjects.size;
  }, [weekDays]);

  const totalRooms = useMemo(() => {
    const rooms = new Set(
      weekDays.flatMap((day) => day.periods.map((p) => p.room))
    );
    return rooms.size;
  }, [weekDays]);

  if (teacherInitialLoading(loading, isFetching, isFetched)) return <TimetableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Timetable
            </h1>
            <TeacherLiveBadge isFetching={isFetching} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {weekDays.length > 0
              ? `${totalPeriods} periods · ${totalSubjects} subjects · ${totalRooms} rooms`
              : "No classes scheduled yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={isCurrentWeek ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full min-w-[120px]",
              isCurrentWeek && "bg-brand-purple text-white hover:bg-brand-purple/90"
            )}
            onClick={() => setWeekOffset(0)}
          >
            {isCurrentWeek ? "This Week" : "Today"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setWeekOffset((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Banner */}
      {weekDays.length > 0 && (
        <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-purple to-brand-blue p-0 text-white shadow-float">
          <div className="relative z-10 p-6 sm:p-8 sm:pr-40">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-white/85">
                {isCurrentWeek ? "Current Week" : isPastWeek ? "Past Week" : "Upcoming Week"}
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
                {weekLabel}
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
                Hi {teacherName}, you have {totalPeriods} periods across {totalSubjects} subjects this
                week.
              </p>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
          >
            <Calendar className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
          </div>
        </ManagementPanel>
      )}

      {/* Timetable Grid */}
      {weekDays.length === 0 ? (
        <ManagementPanel className="border border-border py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No timetable data</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Your weekly schedule will appear here once classes are assigned to you.
          </p>
        </ManagementPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {weekDays.map((day, dayIndex) => (
            <ManagementPanel
              key={day.day}
              className={cn(
                "border transition-all hover:-translate-y-0.5",
                day.isToday
                  ? "border-brand-purple/30 bg-brand-purple/5 shadow-float"
                  : "border-border"
              )}
            >
              {/* Day Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3
                    className={cn(
                      "text-lg font-bold",
                      day.isToday ? "text-brand-purple" : "text-foreground"
                    )}
                  >
                    {DAY_LABELS[day.day] || day.day}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {day.isToday && (
                  <span className="rounded-full bg-brand-purple/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-purple">
                    Today
                  </span>
                )}
              </div>

              {/* Periods List */}
              {day.periods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No classes</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {day.periods.map((period, periodIndex) => {
                    const colorClass = PERIOD_COLORS[periodIndex % PERIOD_COLORS.length];
                    return (
                      <li
                        key={periodIndex}
                        className={cn(
                          "rounded-xl border-l-4 p-3 transition-colors hover:brightness-[0.98]",
                          colorClass
                        )}
                      >
                        {/* Time Badge */}
                        <div className="mb-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {period.time}
                          </span>
                        </div>

                        {/* Subject Name */}
                        {period.classId ? (
                          <Link
                            href={`/teacher/classes/${period.classId}`}
                            className="block text-sm font-bold text-foreground hover:text-brand-purple"
                          >
                            {period.subject}
                          </Link>
                        ) : (
                          <p className="text-sm font-bold text-foreground">
                            {period.subject}
                          </p>
                        )}

                        {/* Room */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{period.room}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ManagementPanel>
          ))}
        </div>
      )}

      {/* Quick Stats Footer */}
      {weekDays.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10">
                <GraduationCap className="h-5 w-5 text-brand-purple" />
              </span>
              <div>
                <p className="text-2xl font-bold">{totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </div>
          </ManagementPanel>
          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
                <Clock className="h-5 w-5 text-brand-blue" />
              </span>
              <div>
                <p className="text-2xl font-bold">{totalPeriods}</p>
                <p className="text-xs text-muted-foreground">Periods</p>
              </div>
            </div>
          </ManagementPanel>
          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10">
                <DoorOpen className="h-5 w-5 text-green" />
              </span>
              <div>
                <p className="text-2xl font-bold">{totalRooms}</p>
                <p className="text-xs text-muted-foreground">Rooms</p>
              </div>
            </div>
          </ManagementPanel>
        </div>
      )}
    </div>
  );
}
