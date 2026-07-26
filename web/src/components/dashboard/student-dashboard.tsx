"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bot,
  CalendarDays,
  ChevronDown,
  Clock,
  Mail,
  MoreVertical,
  Phone,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { StudentDashboardSkeleton } from "./student-dashboard-skeleton";
import {
  useStudentDashboard,
  type StudentDashboardData,
} from "@/hooks/use-dashboard-data";

const DASHBOARD_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

type DashboardMonth = (typeof DASHBOARD_MONTHS)[number];

const DEFAULT_MONTH: DashboardMonth = DASHBOARD_MONTHS[new Date().getMonth()];

type CalendarFilter = "Today" | "Tomorrow" | "Yesterday" | "This week";
const CALENDAR_FILTERS: CalendarFilter[] = ["Today", "Tomorrow", "Yesterday", "This week"];

function calendarFilterLabel(filter: CalendarFilter, count: number): string {
  const suffix =
    filter === "Today" ? "today" : filter === "Tomorrow" ? "tomorrow" :
    filter === "Yesterday" ? "yesterday" : "this week";
  return `${count} events ${suffix}`;
}

function cardClassName(className?: string) {
  return cn("rounded-[20px] bg-card p-5 text-card-foreground sm:p-6", className);
}

function FilterSelect<T extends string>({
  value, onChange, options, label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  label: string;
}) {
  const selectId = useId();
  return (
    <div className="relative shrink-0">
      <label htmlFor={selectId} className="sr-only">{label}</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="inline-flex max-w-[7.5rem] appearance-none rounded-full border border-border bg-muted/60 py-1.5 pl-3.5 pr-8 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70" aria-hidden />
    </div>
  );
}

function MonthSelect({
  value, onChange, options = DASHBOARD_MONTHS,
}: {
  value: string;
  onChange: (month: DashboardMonth) => void;
  options?: readonly DashboardMonth[];
}) {
  return <FilterSelect value={value as DashboardMonth} onChange={onChange} options={options} label="Select month" />;
}

function SeeAllLink({ href }: { href: string }) {
  return (
    <Link href={href} className="shrink-0 text-xs font-semibold text-foreground underline underline-offset-2 hover:text-foreground/80">
      See all
    </Link>
  );
}

function DonutChart({ value, label }: { value: number; label: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const size = 76;

  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="38" cy="38" r={radius} fill="none" stroke="#4f8cff" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{value}%</span>
      </div>
      <p className="line-clamp-2 max-w-[100px] text-[10px] leading-snug text-muted-foreground sm:text-[11px]">{label}</p>
    </div>
  );
}

function PerformanceBar({ score, label }: { score: number; label: string }) {
  const fillPct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="text-[11px] font-medium text-foreground sm:text-xs">{score.toFixed(1)}</span>
      <div className="flex h-28 w-full max-w-[44px] flex-col justify-end overflow-hidden rounded-2xl bg-[#5b9aff]/60 sm:h-[7.5rem]">
        <div className="w-full rounded-b-2xl bg-[#1a3fa8]" style={{ height: `${fillPct}%` }} />
      </div>
      <p className="max-w-[72px] text-center text-[10px] leading-snug text-foreground/75">{label}</p>
    </div>
  );
}

function WelcomeBanner({ name, pendingCount }: { name: string; pendingCount: number }) {
  return (
    <div className="relative mt-10 sm:mt-12">
      <div className="relative min-h-[168px] overflow-visible rounded-[20px] bg-gradient-to-r from-[#2f6bff] via-brand-blue to-[#6aa8ff] px-7 py-8 sm:min-h-[190px] sm:px-8 sm:py-9">
        <div className="relative z-10 flex h-full min-h-[inherit] max-w-[min(100%,28rem)] flex-col justify-center">
          <p className="text-xl font-bold text-white sm:text-2xl">Hello {name}!</p>
          <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
            {pendingCount > 0 ? (
              <>
                You have <span className="font-semibold">{pendingCount} new task{pendingCount > 1 ? "s" : ""}</span> & It is a lot of work for today! So let&apos;s start{" "}
                <Link href="/student/assignments" className="font-semibold text-white underline underline-offset-2">review it!</Link>
              </>
            ) : (
              <>You have no pending tasks right now. Check your courses for updates!</>
            )}
          </p>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 z-[1] flex items-end justify-end pr-1 sm:pr-2 md:pr-4">
          <Image src="/boy-ui.png" alt="" width={320} height={320} priority className="h-32 w-auto -translate-y-8 object-contain object-bottom sm:h-40 sm:-translate-y-10 md:h-44 md:-translate-y-12 lg:h-48" />
        </div>
      </div>
    </div>
  );
}

function CalendarActiveLessonCard({ lesson }: { lesson: { time: string; title: string; detail: string } }) {
  return (
    <div className="flex gap-2.5">
      <span className="w-10 shrink-0 pt-4 text-right text-[11px] font-medium text-muted-foreground">{lesson.time}</span>
      <div className="min-w-0 flex-1 rounded-2xl bg-brand-blue px-3.5 py-3 shadow-[0_8px_24px_rgba(79,140,255,0.38)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/80">
              <Clock className="h-3 w-3 shrink-0" />{lesson.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarNowMarker() {
  return (
    <div className="my-4 flex items-center">
      <div className="w-10 shrink-0" />
      <div className="flex w-5 shrink-0 justify-center">
        <span className="h-3 w-3 rounded-full bg-brand-blue shadow-[0_0_0_3px_rgba(79,140,255,0.25)]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 border-t border-dashed border-muted-foreground/40" />
    </div>
  );
}

function CalendarInactiveLessonCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[#eef1f8] px-3 py-2.5 dark:bg-white/95">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/20" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-900">{title}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-500">
            <Clock className="h-2.5 w-2.5 shrink-0" />{detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function CalendarSimpleList({ schedule }: { schedule: { time: string; title: string; detail: string; active: boolean }[] }) {
  const active = schedule.find((item) => item.active);
  const upcoming = schedule.filter((item) => !item.active);

  if (schedule.length === 0) {
    return (
      <EmptyState icon={CalendarDays} title="No lessons scheduled" description="Your calendar is clear for this period. Check back later for new classes." className="border-none bg-transparent py-8" />
    );
  }

  return (
    <div className="flex flex-col">
      {active ? <CalendarActiveLessonCard lesson={active} /> : null}
      {active && upcoming.length > 0 ? <CalendarNowMarker /> : null}
      <div className="space-y-3">
        {upcoming.map((item) => (
          <div key={`${item.time}-${item.title}`} className="flex gap-2.5">
            <span className="w-10 shrink-0 pt-3 text-right text-[11px] text-muted-foreground">{item.time}</span>
            <div className="min-w-0 flex-1">
              <CalendarInactiveLessonCard title={item.title} detail={item.detail} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarCard({ timetable }: { timetable: StudentDashboardData["timetable"] }) {
  const [filter, setFilter] = useState<CalendarFilter>("Today");
  const dayOfWeek = new Date().getDay();

  const todayItems = timetable.filter((t) => t.dayOfWeek === dayOfWeek);
  const tomorrowItems = timetable.filter((t) => t.dayOfWeek === (dayOfWeek + 1) % 7);
  const yesterdayItems = timetable.filter((t) => t.dayOfWeek === (dayOfWeek + 6) % 7);
  const weekItems = timetable;

  const scheduleMap: Record<CalendarFilter, { time: string; title: string; detail: string; active: boolean }[]> = {
    Today: todayItems.map((t, i) => ({ time: t.startTime, title: t.subject, detail: `${t.startTime} - ${t.endTime}, ${t.room ?? "TBA"}`, active: i === 0 })),
    Tomorrow: tomorrowItems.map((t, i) => ({ time: t.startTime, title: t.subject, detail: `${t.startTime} - ${t.endTime}, ${t.room ?? "TBA"}`, active: i === 0 })),
    Yesterday: yesterdayItems.map((t, i) => ({ time: t.startTime, title: t.subject, detail: `${t.startTime} - ${t.endTime}, ${t.room ?? "TBA"}`, active: i === 0 })),
    "This week": weekItems.map((t) => ({
      time: `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][t.dayOfWeek]} ${t.startTime}`,
      title: t.subject,
      detail: `${t.startTime} - ${t.endTime}, ${t.room ?? "TBA"}`,
      active: false,
    })),
  };

  const schedule = scheduleMap[filter];

  return (
    <section className={cn(cardClassName(), "flex h-full flex-col")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold">Calendar</h2>
          <p className="mt-1 text-xs text-muted-foreground">{calendarFilterLabel(filter, schedule.length)}</p>
        </div>
        <FilterSelect value={filter} onChange={setFilter} options={CALENDAR_FILTERS} label="Select calendar day" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <CalendarSimpleList schedule={schedule} />
      </div>
    </section>
  );
}

function PerformanceCard({ performance }: { performance: StudentDashboardData["performance"] }) {
  return (
    <section className={cardClassName()}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Performance</h2>
      </div>
      <p className="text-sm text-foreground/70">Subject scores:</p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            {performance.length > 0 ? Math.round(performance.reduce((s, p) => s + p.score, 0) / performance.length) : 0}
          </span>
          <span className="max-w-[8.5rem] pt-1 text-sm font-semibold leading-snug">Average Score</span>
        </div>
        <Link href="/student/courses" className="inline-flex shrink-0 rounded-full border border-foreground/25 px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/40">
          All lessons
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-3">
        {performance.map((item) => (
          <PerformanceBar key={item.id} score={item.score} label={item.name} />
        ))}
      </div>
      {performance.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No performance data yet. Complete assignments to see your scores.</p>
      )}
    </section>
  );
}

function MyVisitCard({ attendance }: { attendance: StudentDashboardData["attendance"] }) {
  const subjects = ["Present", "Absent", "Late", "Rate"];
  const values = [
    attendance.present,
    attendance.absent,
    attendance.late,
    attendance.rate,
  ];

  return (
    <section className={cn(cardClassName(), "flex h-full flex-col")}>
      <div className="mb-6 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-base font-bold">Attendance</h2>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
        {subjects.map((label, i) => (
          <DonutChart key={label} value={values[i]} label={label} />
        ))}
      </div>
    </section>
  );
}

function LinkedTeachersCard({ teachers }: { teachers: StudentDashboardData["teachers"] }) {
  const accents = ["from-violet-400 to-violet-600", "from-sky-400 to-blue-600", "from-emerald-400 to-green-600", "from-amber-400 to-orange-600"];
  return (
    <section className={cardClassName()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Linked Teachers</h2>
        <SeeAllLink href="/student/messages" />
      </div>
      {teachers.length === 0 ? (
        <EmptyState icon={Users} title="No linked teachers yet" description="Teachers assigned to your classes will appear here." className="border-none bg-transparent py-8" />
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher, i) => (
            <div key={teacher.id} className="flex items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3.5">
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white", accents[i % accents.length])}>
                {teacher.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{teacher.name}</p>
                <p className="truncate text-xs text-muted-foreground">{teacher.designation}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href="/student/messages" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Message ${teacher.name}`}>
                  <Mail className="h-4 w-4" />
                </Link>
                <Link href="/student/messages" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Call ${teacher.name}`}>
                  <Phone className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingEventCard({ event }: { event: StudentDashboardData["events"][number] }) {
  const dateStr = new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = new Date(event.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] bg-muted/45 px-3.5 py-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8dde8]">
        <CalendarDays className="h-6 w-6 text-slate-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug">{event.title}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0 opacity-80" />
          <span>{dateStr}</span>
          <span className="px-0.5 opacity-50">·</span>
          <span>{timeStr}</span>
        </p>
      </div>
      <button type="button" className="shrink-0 self-center rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground" aria-label="Event options">
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

function UpcomingEventsCard({ events }: { events: StudentDashboardData["events"] }) {
  return (
    <section className={cardClassName()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Upcoming events</h2>
        <SeeAllLink href="/student/events" />
      </div>
      {events.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="School events and activities will show up here when they are scheduled." className="border-none bg-transparent py-8" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((event) => (
            <UpcomingEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

const EMPTY_DASHBOARD: StudentDashboardData = {
  student: { id: "", admissionNumber: "", firstName: "", lastName: "", email: "", avatar: null, phone: null, className: "", classSection: null, bloodGroup: null, dateOfAdmission: new Date() },
  subjects: [],
  teachers: [],
  performance: [],
  attendance: { totalClasses: 0, present: 0, absent: 0, late: 0, rate: 100 },
  timetable: [],
  events: [],
  pendingAssignments: [],
  unreadNotificationCount: 0,
  recentAnnouncements: [],
};

export function StudentDashboard() {
  const { data: session } = useSession();
  const isLoading = usePageLoading();
  const { data: dashboard } = useStudentDashboard(EMPTY_DASHBOARD);
  const firstName = dashboard?.student?.firstName || session?.user?.name?.split(" ")[0] || "Student";
  const [selectedMonth, setSelectedMonth] = useState<DashboardMonth>(DEFAULT_MONTH);

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  const data = dashboard ?? EMPTY_DASHBOARD;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="overflow-visible lg:col-span-8">
            <WelcomeBanner name={firstName} pendingCount={data.pendingAssignments.length} />
          </div>

          <div className="lg:col-span-4 lg:row-span-2">
            <CalendarCard timetable={data.timetable} />
          </div>

          <div className="lg:col-span-5 lg:row-start-2">
            <PerformanceCard performance={data.performance} />
          </div>

          <div className="lg:col-span-3 lg:row-span-2 lg:row-start-2">
            <MyVisitCard attendance={data.attendance} />
          </div>

          <div className="lg:col-span-5 lg:row-start-3">
            <LinkedTeachersCard teachers={data.teachers} />
          </div>

          <div className="lg:col-span-4">
            <UpcomingEventsCard events={data.events} />
          </div>
        </div>
      </div>
    </div>
  );
}
