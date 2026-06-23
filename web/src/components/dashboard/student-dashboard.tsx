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

const SUBJECTS = [
  "Algorithms structures",
  "Object program",
  "Database program",
  "Web develop",
  "Mobile application",
  "Machine learning",
] as const;

type SubjectLabel = (typeof SUBJECTS)[number];

const DASHBOARD_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type DashboardMonth = (typeof DASHBOARD_MONTHS)[number];

type MonthDashboardData = {
  bestScore: number;
  bestLesson: string;
  performance: Record<SubjectLabel, number>;
  visits: Record<SubjectLabel, number>;
};

const BEST_LESSONS_BY_MONTH: Record<DashboardMonth, string> = {
  January: "Introduction to programming",
  February: "Algorithms structures",
  March: "Object program",
  April: "Database program",
  May: "Web develop",
  June: "Mobile application",
  July: "Machine learning",
  August: "Database program",
  September: "Database program",
  October: "Web develop",
  November: "Machine learning",
  December: "Introduction to programming",
};

function buildPerformanceScore(monthIndex: number, subjectIndex: number): number {
  const value = 42 + monthIndex * 2.4 + ((subjectIndex * 6 + monthIndex * 3) % 30);
  return Math.min(98, Math.max(40, Math.round(value * 10) / 10));
}

function buildMonthlyDashboardData(): Record<DashboardMonth, MonthDashboardData> {
  return DASHBOARD_MONTHS.reduce(
    (acc, month, monthIndex) => {
      const performance = SUBJECTS.reduce(
        (subjectAcc, label, subjectIndex) => {
          subjectAcc[label] = buildPerformanceScore(monthIndex, subjectIndex);
          return subjectAcc;
        },
        {} as Record<SubjectLabel, number>,
      );

      const visits = SUBJECTS.reduce(
        (subjectAcc, label, subjectIndex) => {
          const value = 58 + monthIndex * 2.2 + ((subjectIndex * 5 + monthIndex * 3) % 24);
          subjectAcc[label] = Math.min(99, Math.max(40, Math.round(value)));
          return subjectAcc;
        },
        {} as Record<SubjectLabel, number>,
      );

      acc[month] = {
        bestScore: Math.round((82 + monthIndex * 1.15) * 10) / 10,
        bestLesson: BEST_LESSONS_BY_MONTH[month],
        performance,
        visits,
      };

      return acc;
    },
    {} as Record<DashboardMonth, MonthDashboardData>,
  );
}

const MONTHLY_DASHBOARD_DATA = buildMonthlyDashboardData();

MONTHLY_DASHBOARD_DATA.December = {
  bestScore: 95.4,
  bestLesson: "Introduction to programming",
  performance: {
    "Algorithms structures": 85.3,
    "Object program": 64.7,
    "Database program": 84.2,
    "Web develop": 45.6,
    "Mobile application": 43.5,
    "Machine learning": 74.4,
  },
  visits: {
    "Algorithms structures": 92,
    "Object program": 83,
    "Database program": 78,
    "Web develop": 97,
    "Mobile application": 96,
    "Machine learning": 89,
  },
};

const DEFAULT_MONTH: DashboardMonth = "December";

type CalendarFilter = "Today" | "Tomorrow" | "Yesterday" | "This week";

const CALENDAR_FILTERS: CalendarFilter[] = [
  "Today",
  "Tomorrow",
  "Yesterday",
  "This week",
];

type ScheduleItem = {
  time: string;
  title: string;
  detail: string;
  active: boolean;
};

type CalendarActiveLesson = {
  time: string;
  title: string;
  detail: string;
};

type CalendarSlotEvent = {
  startSlot: string;
  endSlot: string;
  title: string;
  detail: string;
};

type CalendarDayView = {
  eventCount: number;
  active: CalendarActiveLesson;
  slots: string[];
  events: CalendarSlotEvent[];
};

const CALENDAR_SLOT_GRID: CalendarDayView = {
  eventCount: 6,
  active: {
    time: "10:00",
    title: "Electronics lesson",
    detail: "9.45- 10.30, 21 lesson",
  },
  slots: ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
  events: [
    {
      startSlot: "11:00",
      endSlot: "12:00",
      title: "Electronics lesson",
      detail: "11.00- 11.40, 23 lesson",
    },
    {
      startSlot: "12:00",
      endSlot: "12:30",
      title: "Robotics lesson",
      detail: "12.00- 12.45, 73 lesson",
    },
    {
      startSlot: "13:30",
      endSlot: "14:30",
      title: "C++ lesson",
      detail: "13.45- 14.30, 21 lesson",
    },
  ],
};

const SCHEDULE_BY_FILTER: Record<CalendarFilter, ScheduleItem[]> = {
  Today: [
    {
      time: "10:00",
      title: "Electronics lesson",
      detail: "9:45 - 10:30, 33 lesson",
      active: true,
    },
    {
      time: "11:00",
      title: "Electronics lesson",
      detail: "11:00 - 11:40, 33 lesson",
      active: false,
    },
    {
      time: "12:00",
      title: "Robotics lesson",
      detail: "12:00 - 12:45, 73 lesson",
      active: false,
    },
    {
      time: "13:45",
      title: "C++ lesson",
      detail: "13:45 - 14:30, 21 lesson",
      active: false,
    },
  ],
  Tomorrow: [
    {
      time: "09:00",
      title: "Mathematics lesson",
      detail: "9:00 - 9:45, 12 lesson",
      active: true,
    },
    {
      time: "10:30",
      title: "Physics lab",
      detail: "10:30 - 11:30, 8 lesson",
      active: false,
    },
    {
      time: "13:00",
      title: "English literature",
      detail: "13:00 - 13:50, 19 lesson",
      active: false,
    },
  ],
  Yesterday: [
    {
      time: "08:30",
      title: "Morning assembly",
      detail: "8:30 - 9:00, 1 lesson",
      active: false,
    },
    {
      time: "11:15",
      title: "Chemistry lesson",
      detail: "11:15 - 12:00, 27 lesson",
      active: true,
    },
    {
      time: "14:00",
      title: "Art workshop",
      detail: "14:00 - 15:00, 5 lesson",
      active: false,
    },
    {
      time: "15:30",
      title: "Sports practice",
      detail: "15:30 - 16:30, 4 lesson",
      active: false,
    },
    {
      time: "16:45",
      title: "Study hall",
      detail: "16:45 - 17:30, 2 lesson",
      active: false,
    },
  ],
  "This week": [
    {
      time: "Mon 10:00",
      title: "Electronics lesson",
      detail: "10:00 - 10:45, 33 lesson",
      active: false,
    },
    {
      time: "Tue 11:00",
      title: "Robotics lesson",
      detail: "11:00 - 11:50, 73 lesson",
      active: false,
    },
    {
      time: "Wed 09:30",
      title: "Web develop",
      detail: "9:30 - 10:30, 41 lesson",
      active: true,
    },
    {
      time: "Thu 13:45",
      title: "C++ lesson",
      detail: "13:45 - 14:30, 21 lesson",
      active: false,
    },
    {
      time: "Fri 12:00",
      title: "Machine learning",
      detail: "12:00 - 12:55, 16 lesson",
      active: false,
    },
    {
      time: "Sat 10:00",
      title: "Robot Fest prep",
      detail: "10:00 - 12:00, 3 lesson",
      active: false,
    },
  ],
};

function calendarFilterLabel(filter: CalendarFilter, count: number): string {
  const suffix =
    filter === "Today"
      ? "today"
      : filter === "Tomorrow"
        ? "tomorrow"
        : filter === "Yesterday"
          ? "yesterday"
          : "this week";

  return `${count} events ${suffix}`;
}

const TEACHERS = [
  {
    name: "Mary Johnson",
    role: "mentor",
    subject: "Science",
    avatar: "MJ",
    accent: "from-violet-400 to-violet-600",
  },
  {
    name: "James Brown",
    role: null,
    subject: "Foreign language (Chinese)",
    avatar: "JB",
    accent: "from-sky-400 to-blue-600",
  },
] as const;

const UPCOMING_EVENTS = [
  {
    title: 'The main event in your life "Robot Fest" will coming soon in…',
    date: "14 December 2023",
    time: "12.00 pm",
    thumbnail: "robot" as const,
  },
  {
    title: "Webinar of new tools in Minecraft",
    date: "21 December 2023",
    time: "11.00 pm",
    thumbnail: "blocks" as const,
  },
] as const;

type Teacher = (typeof TEACHERS)[number];
type UpcomingEvent = (typeof UPCOMING_EVENTS)[number];

function cardClassName(className?: string) {
  return cn("rounded-[20px] bg-card p-5 text-card-foreground sm:p-6", className);
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  label: string;
}) {
  const selectId = useId();

  return (
    <div className="relative shrink-0">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="inline-flex max-w-[7.5rem] appearance-none rounded-full border border-border bg-muted/60 py-1.5 pl-3.5 pr-8 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70"
        aria-hidden
      />
    </div>
  );
}

function MonthSelect({
  value,
  onChange,
  options = DASHBOARD_MONTHS,
}: {
  value: string;
  onChange: (month: DashboardMonth) => void;
  options?: readonly DashboardMonth[];
}) {
  return (
    <FilterSelect
      value={value as DashboardMonth}
      onChange={onChange}
      options={options}
      label="Select month"
    />
  );
}

function SeeAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="shrink-0 text-xs font-semibold text-foreground underline underline-offset-2 hover:text-foreground/80"
    >
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
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="#4f8cff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {value}%
        </span>
      </div>
      <p className="line-clamp-2 max-w-[100px] text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function PerformanceBar({ score, label }: { score: number; label: string }) {
  const fillPct = Math.min(100, Math.max(0, score));

  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="text-[11px] font-medium text-foreground sm:text-xs">
        {score.toFixed(1)}
      </span>
      <div className="flex h-28 w-full max-w-[44px] flex-col justify-end overflow-hidden rounded-2xl bg-[#5b9aff]/60 sm:h-[7.5rem]">
        <div
          className="w-full rounded-b-2xl bg-[#1a3fa8]"
          style={{ height: `${fillPct}%` }}
        />
      </div>
      <p className="max-w-[72px] text-center text-[10px] leading-snug text-foreground/75">
        {label}
      </p>
    </div>
  );
}

function WelcomeBanner({ name }: { name: string }) {
  return (
    <div className="relative mt-10 sm:mt-12">
      <div className="relative min-h-[168px] overflow-visible rounded-[20px] bg-gradient-to-r from-[#2f6bff] via-brand-blue to-[#6aa8ff] px-7 py-8 sm:min-h-[190px] sm:px-8 sm:py-9">
        <div className="relative z-10 flex h-full min-h-[inherit] max-w-[min(100%,28rem)] flex-col justify-center">
          <p className="text-xl font-bold text-white sm:text-2xl">Hello {name}!</p>
          <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
            You have <span className="font-semibold">3 new tasks</span> & It is a lot of work for today! So
            let&apos;s start{" "}
            <Link href="/student/assignments" className="font-semibold text-white underline underline-offset-2">
              review it!
            </Link>
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 z-[1] flex items-end justify-end pr-1 sm:pr-2 md:pr-4">
          <Image
            src="/boy-ui.png"
            alt=""
            width={320}
            height={320}
            priority
            className="h-32 w-auto -translate-y-8 object-contain object-bottom sm:h-40 sm:-translate-y-10 md:h-44 md:-translate-y-12 lg:h-48"
          />
        </div>
      </div>
    </div>
  );
}

function CalendarActiveLessonCard({ lesson }: { lesson: CalendarActiveLesson }) {
  return (
    <div className="flex gap-2.5">
      <span className="w-10 shrink-0 pt-4 text-right text-[11px] font-medium text-muted-foreground">
        {lesson.time}
      </span>
      <div className="min-w-0 flex-1 rounded-2xl bg-brand-blue px-3.5 py-3 shadow-[0_8px_24px_rgba(79,140,255,0.38)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/80">
              <Clock className="h-3 w-3 shrink-0" />
              {lesson.detail}
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

function CalendarInactiveLessonCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-[#eef1f8] px-3 py-2.5 dark:bg-white/95">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/20" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-900">{title}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-500">
            <Clock className="h-2.5 w-2.5 shrink-0" />
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function CalendarSlotGrid({ slots, events }: { slots: string[]; events: CalendarSlotEvent[] }) {
  const rowHeight = 36;

  return (
    <div className="relative flex">
      <div className="w-10 shrink-0">
        {slots.map((slot) => (
          <div
            key={slot}
            className="flex h-9 items-start justify-end pr-1 pt-0.5"
          >
            <span className="text-[10px] font-medium text-muted-foreground">{slot}</span>
          </div>
        ))}
      </div>

      <div className="relative w-5 shrink-0">
        <div
          className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-muted-foreground/25"
          aria-hidden
        />
        {events.map((event) => {
          const startIndex = slots.indexOf(event.startSlot);
          const endIndex = slots.indexOf(event.endSlot);
          if (startIndex < 0 || endIndex < 0) return null;

          const top = startIndex * rowHeight + 8;
          const height = Math.max((endIndex - startIndex + 1) * rowHeight - 12, rowHeight - 12);

          return (
            <div
              key={`${event.startSlot}-${event.title}`}
              className="absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-brand-blue"
              style={{ top, height }}
              aria-hidden
            />
          );
        })}
        {events.map((event) => {
          const startIndex = slots.indexOf(event.startSlot);
          if (startIndex < 0) return null;

          return (
            <span
              key={`dot-${event.startSlot}-${event.title}`}
              className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-blue"
              style={{ top: startIndex * rowHeight + 8 }}
              aria-hidden
            />
          );
        })}
      </div>

      <div className="relative min-w-0 flex-1">
        {slots.map((slot) => (
          <div key={slot} className="h-9 border-t border-muted-foreground/20" />
        ))}

        {events.map((event) => {
          const startIndex = slots.indexOf(event.startSlot);
          if (startIndex < 0) return null;

          return (
            <div
              key={`card-${event.startSlot}-${event.title}`}
              className="absolute left-0 right-0 z-10 px-0.5"
              style={{ top: startIndex * rowHeight + 6 }}
            >
              <CalendarInactiveLessonCard title={event.title} detail={event.detail} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarSimpleList({ schedule }: { schedule: ScheduleItem[] }) {
  const active = schedule.find((item) => item.active);
  const upcoming = schedule.filter((item) => !item.active);

  if (schedule.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No lessons scheduled"
        description="Your calendar is clear for this period. Check back later for new classes."
        className="border-none bg-transparent py-8"
      />
    );
  }

  return (
    <div className="flex flex-col">
      {active ? <CalendarActiveLessonCard lesson={active} /> : null}
      {active && upcoming.length > 0 ? <CalendarNowMarker /> : null}
      <div className="space-y-3">
        {upcoming.map((item) => (
          <div key={`${item.time}-${item.title}`} className="flex gap-2.5">
            <span className="w-10 shrink-0 pt-3 text-right text-[11px] text-muted-foreground">
              {item.time}
            </span>
            <div className="min-w-0 flex-1">
              <CalendarInactiveLessonCard title={item.title} detail={item.detail} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarCard() {
  const [filter, setFilter] = useState<CalendarFilter>("Today");
  const schedule = SCHEDULE_BY_FILTER[filter];
  const isTodayGrid = filter === "Today";

  return (
    <section className={cn(cardClassName(), "flex h-full flex-col")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold">Calendar</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isTodayGrid
              ? `${CALENDAR_SLOT_GRID.eventCount} events today`
              : calendarFilterLabel(filter, schedule.length)}
          </p>
        </div>
        <FilterSelect
          value={filter}
          onChange={setFilter}
          options={CALENDAR_FILTERS}
          label="Select calendar day"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isTodayGrid ? (
          <>
            <CalendarActiveLessonCard lesson={CALENDAR_SLOT_GRID.active} />
            <CalendarNowMarker />
            <CalendarSlotGrid
              slots={CALENDAR_SLOT_GRID.slots}
              events={CALENDAR_SLOT_GRID.events}
            />
          </>
        ) : (
          <CalendarSimpleList schedule={schedule} />
        )}
      </div>
    </section>
  );
}

function PerformanceCard({
  month,
  onMonthChange,
}: {
  month: DashboardMonth;
  onMonthChange: (month: DashboardMonth) => void;
}) {
  const monthData = MONTHLY_DASHBOARD_DATA[month];
  const performanceBars = SUBJECTS.map((label) => ({
    label,
    score: monthData.performance[label],
  }));

  return (
    <section className={cardClassName()}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Performance</h2>
        <MonthSelect value={month} onChange={onMonthChange} />
      </div>

      <p className="text-sm text-foreground/70">The best lessons:</p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            {monthData.bestScore}
          </span>
          <span className="max-w-[8.5rem] pt-1 text-sm font-semibold leading-snug">
            {monthData.bestLesson}
          </span>
        </div>
        <Link
          href="/student/courses"
          className="inline-flex shrink-0 rounded-full border border-foreground/25 px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          All lessons
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-3">
        {performanceBars.map((item) => (
          <PerformanceBar key={item.label} score={item.score} label={item.label} />
        ))}
      </div>
    </section>
  );
}

function MyVisitCard({
  month,
  onMonthChange,
}: {
  month: DashboardMonth;
  onMonthChange: (month: DashboardMonth) => void;
}) {
  const monthData = MONTHLY_DASHBOARD_DATA[month];
  const visitStats = SUBJECTS.map((label) => ({
    label,
    value: monthData.visits[label],
  }));

  return (
    <section className={cn(cardClassName(), "flex h-full flex-col")}>
      <div className="mb-6 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-base font-bold">My visit</h2>
        <MonthSelect value={month} onChange={onMonthChange} />
      </div>

      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
        {visitStats.map((item) => (
          <DonutChart key={item.label} value={item.value} label={item.label} />
        ))}
      </div>
    </section>
  );
}

function LinkedTeachersCard({ teachers }: { teachers: readonly Teacher[] }) {
  return (
    <section className={cardClassName()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Linked Teachers</h2>
        <SeeAllLink href="/shared/messages" />
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No linked teachers yet"
          description="Teachers assigned to your classes will appear here."
          className="border-none bg-transparent py-8"
        />
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
          <div
            key={teacher.name}
            className="flex items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3.5"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                teacher.accent,
              )}
            >
              {teacher.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {teacher.name}
                {teacher.role ? (
                  <span className="font-normal text-muted-foreground"> ({teacher.role})</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">{teacher.subject}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Email ${teacher.name}`}
              >
                <Mail className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Call ${teacher.name}`}
              >
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </section>
  );
}

function UpcomingEventThumbnail({ type }: { type: (typeof UPCOMING_EVENTS)[number]["thumbnail"] }) {
  if (type === "robot") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8dde8]">
        <Bot className="h-6 w-6 text-slate-600" />
      </div>
    );
  }

  return (
    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-teal-400 via-cyan-600 to-slate-800" />
  );
}

function UpcomingEventCard({ event }: { event: (typeof UPCOMING_EVENTS)[number] }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] bg-muted/45 px-3.5 py-3.5">
      <UpcomingEventThumbnail type={event.thumbnail} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug">{event.title}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0 opacity-80" />
          <span>{event.date}</span>
          <span className="px-0.5 opacity-50">·</span>
          <span>{event.time}</span>
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 self-center rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        aria-label="Event options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

function UpcomingEventsCard({ events }: { events: readonly UpcomingEvent[] }) {
  return (
    <section className={cardClassName()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Upcoming events</h2>
        <SeeAllLink href="/shared/events" />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events"
          description="School events and activities will show up here when they are scheduled."
          className="border-none bg-transparent py-8"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((event) => (
            <UpcomingEventCard key={event.title} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export function StudentDashboard() {
  const { data: session } = useSession();
  const isLoading = usePageLoading();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Grace";
  const [selectedMonth, setSelectedMonth] = useState<DashboardMonth>(DEFAULT_MONTH);

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="overflow-visible lg:col-span-8">
            <WelcomeBanner name={firstName} />
          </div>

          <div className="lg:col-span-4 lg:row-span-2">
            <CalendarCard />
          </div>

          <div className="lg:col-span-5 lg:row-start-2">
            <PerformanceCard month={selectedMonth} onMonthChange={setSelectedMonth} />
          </div>

          <div className="lg:col-span-3 lg:row-span-2 lg:row-start-2">
            <MyVisitCard month={selectedMonth} onMonthChange={setSelectedMonth} />
          </div>

          <div className="lg:col-span-5 lg:row-start-3">
            <LinkedTeachersCard teachers={TEACHERS} />
          </div>

          <div className="lg:col-span-4">
            <UpcomingEventsCard events={UPCOMING_EVENTS} />
          </div>
        </div>
      </div>
    </div>
  );
}
