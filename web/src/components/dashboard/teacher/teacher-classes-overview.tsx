"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  Layers,
  Palette,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherClassesOverview } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { TEACHER_AVATAR_TONES, buildTeacherOverviewPerformers, TEACHER_ASSIGNMENTS, TEACHER_COURSES } from "./teacher-data";

type OverviewData = {
  courseCards: {
    id: string;
    classId: string;
    title: string;
    students: number;
    modules: number;
    lessons: number;
    materials: number;
    assignments: number;
    progress: number;
    tone: "purple" | "green" | "pink" | "orange";
  }[];
  bestPerformers: {
    rank: number;
    id: string;
    name: string;
    initials: string;
    avatarTone: keyof typeof TEACHER_AVATAR_TONES;
    classId: string;
    courses: number;
    assignments: number;
    hours: number;
    quiz: number;
    points: number;
    trend: "up" | "down";
    badge: "gold" | "silver" | "bronze" | "rose" | "default";
  }[];
  assignments: {
    id: string;
    title: string;
    className: string;
    status: string;
    tone: "pink" | "blue" | "green" | "yellow";
  }[];
  classCount: number;
  studentCount: number;
};

const OVERVIEW_FALLBACK: OverviewData = {
  courseCards: TEACHER_COURSES.map((course, index) => ({
    id: course.id,
    classId: index === 0 ? "class-a" : index === 1 ? "class-b" : "class-c",
    title: course.title,
    students: course.students,
    modules: course.modules,
    lessons: course.lessons,
    materials: 12 + index * 4,
    assignments: 8 + index * 3,
    progress: course.progress,
    tone: (["purple", "green", "pink", "orange"] as const)[index % 4],
  })),
  bestPerformers: buildTeacherOverviewPerformers(),
  assignments: TEACHER_ASSIGNMENTS.slice(0, 4).map((item, index) => ({
    id: item.id,
    title: item.title,
    className: item.className,
    status: item.status === "grading" ? "Grading in progress" : "Pending",
    tone: (["pink", "blue", "green", "yellow"] as const)[index % 4],
  })),
  classCount: 3,
  studentCount: 29,
};

const COURSE_TONE_STYLES = {
  purple: {
    card: "border-brand-purple/15 bg-brand-purple/8",
    icon: "bg-brand-purple text-white",
  },
  green: {
    card: "border-green/15 bg-green/8",
    icon: "bg-green text-white",
  },
  pink: {
    card: "border-brand-pink/15 bg-brand-pink/8",
    icon: "bg-brand-pink text-white",
  },
  orange: {
    card: "border-brand-orange/15 bg-brand-orange/8",
    icon: "bg-brand-orange text-white",
  },
} as const;

const COURSE_ICONS = [Palette, Sparkles, Layers, BookOpen] as const;

const ASSIGNMENT_TONE_STYLES = {
  pink: "bg-brand-pink/12 border-brand-pink/20",
  blue: "bg-brand-blue/12 border-brand-blue/20",
  green: "bg-green/12 border-green/20",
  yellow: "bg-brand-yellow/20 border-brand-yellow/30",
} as const;

const RANK_BADGE_STYLES = {
  gold: "bg-brand-yellow/25 text-brand-orange ring-brand-yellow/40",
  silver: "bg-muted text-muted-foreground ring-border",
  bronze: "bg-brand-orange/15 text-brand-orange ring-brand-orange/30",
  rose: "bg-brand-pink/15 text-brand-pink ring-brand-pink/30",
  default: "bg-muted text-muted-foreground ring-border",
} as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-56 rounded-xl bg-muted" />
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="h-36 rounded-[24px] bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-[24px] bg-muted" />)}</div>
          <div className="h-72 rounded-[24px] bg-muted" />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <div className="h-56 rounded-[24px] bg-muted" />
          <div className="h-72 rounded-[24px] bg-muted" />
        </div>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = `${MONTHS[viewDate.getMonth()]}, ${viewDate.getFullYear()}`;
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );

  const shiftMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  return (
    <ManagementPanel className="border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{monthLabel}</h3>
        <div className="flex gap-1">
          <button type="button" onClick={() => shiftMonth(-1)} className="rounded-full p-1.5 hover:bg-muted" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} className="rounded-full p-1.5 hover:bg-muted" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((day, index) => {
          const isToday =
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear();
          return (
            <span
              key={index}
              className={cn(
                "flex h-8 items-center justify-center rounded-full",
                day == null && "invisible",
                isToday && "bg-brand-yellow/30 font-bold text-brand-orange",
                !isToday && day != null && "text-foreground",
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </ManagementPanel>
  );
}

export function TeacherClasses() {
  const { data: session } = useSession();
  const loading = usePageLoading();
  const { data: overview = OVERVIEW_FALLBACK, isFetching } = useTeacherClassesOverview(OVERVIEW_FALLBACK);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [sortDesc, setSortDesc] = useState(true);

  const performers = useMemo(() => {
    const list = [...overview.bestPerformers];
    list.sort((a, b) => (sortDesc ? b.points - a.points : a.points - b.points));
    return list;
  }, [overview.bestPerformers, sortDesc]);

  if (loading && isFetching) return <OverviewSkeleton />;

  const teacherName = session?.user?.name?.split(" ")[0] ?? "Teacher";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Course Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.classCount} classes · {overview.studentCount} students
          </p>
        </div>
        <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href="/teacher/materials">
            <Upload className="mr-2 h-4 w-4" />
            Upload file
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-blue to-brand-purple p-0 text-white shadow-float">
            <div className="relative z-10 p-6 sm:p-8 sm:pr-40 lg:pr-48">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-white/85">Welcome back</p>
                <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{session?.user?.name ?? "Jenny Wilson"}</h2>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
                  Hi {teacherName}, track your classes, top students, and pending assignments from one place.
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="mt-5 w-fit shrink-0 rounded-full bg-white/15 px-5 text-white hover:bg-white/25"
                >
                  <Link href="/teacher/assignments">
                    <ClipboardList className="mr-2 h-4 w-4 shrink-0" />
                    To-do list
                  </Link>
                </Button>
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
            >
              <Users className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
            </div>
          </ManagementPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            {overview.courseCards.map((course, index) => {
              const styles = COURSE_TONE_STYLES[course.tone];
              const Icon = COURSE_ICONS[index % COURSE_ICONS.length];
              return (
                <Link key={course.id} href={`/teacher/classes/${course.classId}`} className="group block">
                  <ManagementPanel className={cn("h-full border transition-transform hover:-translate-y-0.5", styles.card)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm", styles.icon)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">{course.progress}%</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-brand-purple">{course.title}</h3>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" />{course.lessons}</span>
                      <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4" />{course.materials}</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{course.students}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/80">
                      <div className="h-full rounded-full bg-brand-purple" style={{ width: `${course.progress}%` }} />
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs font-medium">
                      <span className="text-brand-purple opacity-0 transition-opacity group-hover:opacity-100">Open class →</span>
                      <Link
                        href={`/teacher/courses/${course.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-brand-purple"
                      >
                        Course content
                      </Link>
                    </div>
                  </ManagementPanel>
                </Link>
              );
            })}
          </div>

          <ManagementPanel className="overflow-hidden border border-border p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="text-base font-bold">Best performers</h2>
              <div className="flex items-center gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-9 rounded-full border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {MONTHS.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSortDesc((v) => !v)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Courses</th>
                    <th className="px-5 py-3">Assignments</th>
                    <th className="px-5 py-3">Hours</th>
                    <th className="px-5 py-3">Quiz</th>
                    <th className="px-5 py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {performers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                        Performance data will appear as students complete work.
                      </td>
                    </tr>
                  ) : (
                    performers.map((student) => (
                      <tr key={student.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-2", RANK_BADGE_STYLES[student.badge])}>
                              {student.rank}
                            </span>
                            {student.trend === "up" ? (
                              <ArrowUpRight className="h-4 w-4 text-green" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-brand-pink" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/teacher/students/${student.id}`} className="flex items-center gap-3 hover:text-brand-purple">
                            <span className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>
                              {student.initials}
                            </span>
                            <span className="font-semibold">{student.name}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-4 tabular-nums text-muted-foreground">{String(student.courses).padStart(2, "0")}</td>
                        <td className="px-5 py-4 tabular-nums text-muted-foreground">{student.assignments}</td>
                        <td className="px-5 py-4 tabular-nums text-muted-foreground">{student.hours}</td>
                        <td className="px-5 py-4 tabular-nums text-muted-foreground">{student.quiz}</td>
                        <td className="px-5 py-4 font-bold tabular-nums">{student.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ManagementPanel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <MiniCalendar />

          <ManagementPanel className="border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Assignments</h3>
              <Link href="/teacher/assignments" className="text-sm font-semibold text-brand-purple hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {overview.assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/teacher/assignments/${assignment.id}`}
                  className={cn(
                    "block rounded-2xl border p-4 transition-colors hover:brightness-[0.98]",
                    ASSIGNMENT_TONE_STYLES[assignment.tone],
                  )}
                >
                  <p className="font-semibold leading-snug text-foreground">{assignment.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{assignment.className}</p>
                  <p className="mt-2 text-xs font-medium text-foreground/80">{assignment.status}</p>
                </Link>
              ))}
            </div>
          </ManagementPanel>
        </div>
      </div>
    </div>
  );
}
