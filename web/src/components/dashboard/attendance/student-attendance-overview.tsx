"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock,
  Footprints,
  MapPinCheck,
  Search,
  Timer,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentTime } from "@/hooks/use-current-time";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  buildDemoSessions,
  getSessionWindowState,
  hasMarkedSession,
  useLiveAttendanceMarks,
} from "./attendance-live-store";
import {
  AttendancePanel,
  attendanceHref,
} from "./attendance-ui";
import {
  MONTHLY_RATES,
  TOP_ATTENDANCE_STUDENTS,
  attendanceMarkHref,
  getAttendanceStats,
  getMonthlyRateColor,
  type AttendancePeriod,
} from "./student-attendance-data";
import { StudentAttendanceSkeleton } from "./student-attendance-skeleton";

function StatCard({
  value,
  label,
  icon: Icon,
  tone,
  href,
}: {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "orange" | "red";
  href: string;
}) {
  const tones = {
    blue: { card: "bg-brand-blue/10", icon: "bg-brand-blue/15 text-brand-blue", value: "text-brand-blue" },
    green: { card: "bg-green/10", icon: "bg-green/15 text-green", value: "text-green" },
    orange: { card: "bg-brand-orange/10", icon: "bg-brand-orange/15 text-brand-orange", value: "text-brand-orange" },
    red: { card: "bg-destructive/10", icon: "bg-destructive/15 text-destructive", value: "text-destructive" },
  } as const;

  const style = tones[tone];

  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      <AttendancePanel className={cn("flex items-center gap-3", style.card)}>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-2xl font-bold leading-none", style.value)}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </AttendancePanel>
    </Link>
  );
}

function MonthlyRateChart() {
  const points = MONTHLY_RATES.map((item, index) => ({ ...item, x: index, y: item.rate }));
  const width = 320;
  const height = 120;
  const padding = 12;
  const stepWidth = (width - padding * 2) / (points.length - 1);
  const linePath = points
    .map((point, index) => {
      const x = padding + index * stepWidth;
      const y = height - padding - ((point.y - 50) / 20) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">Monthly Rate</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full min-w-[280px]">
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue" />
        {points.map((point, index) => {
          const x = padding + index * stepWidth;
          const y = height - padding - ((point.y - 50) / 20) * (height - padding * 2);
          return <circle key={point.month} cx={x} cy={y} r="4" className="fill-brand-blue" />;
        })}
      </svg>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MONTHLY_RATES.map((item) => (
          <div
            key={item.month}
            className={cn("rounded-lg px-2 py-2 text-center text-white", getMonthlyRateColor(item.color))}
          >
            <p className="text-[10px] font-medium opacity-90">{item.month.slice(0, 3)}</p>
            <p className="text-sm font-bold">{item.rate}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryBarChart({
  stats,
  studentName,
}: {
  stats: ReturnType<typeof getAttendanceStats>;
  studentName: string;
}) {
  const items = [
    { label: "Attendance", value: stats.totalAttendance, tone: "bg-brand-blue", icon: Footprints },
    { label: "Late", value: stats.late, tone: "bg-green", icon: Clock },
    { label: "Undertime", value: stats.undertime, tone: "bg-brand-orange", icon: Timer },
    { label: "Absent", value: stats.absent, tone: "bg-destructive", icon: UserX },
  ] as const;
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <AttendancePanel>
      <h2 className="text-base font-bold">Summary - {studentName}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const heightPct = Math.max(28, (item.value / maxValue) * 100);
          return (
            <div key={item.label} className="flex flex-col items-center rounded-2xl bg-muted/35 px-3 pb-3 pt-4">
              <p className="text-2xl font-bold text-foreground">{String(item.value).padStart(2, "0")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              <div className="mt-4 flex h-28 w-full items-end justify-center">
                <div
                  className={cn("relative flex w-14 items-end justify-center rounded-t-2xl", item.tone)}
                  style={{ height: `${heightPct}%` }}
                >
                  <Icon className="absolute bottom-2 h-5 w-5 text-white/90" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AttendancePanel>
  );
}

function TopStudentsTable() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return TOP_ATTENDANCE_STUDENTS;
    return TOP_ATTENDANCE_STUDENTS.filter(
      (student) =>
        student.name.toLowerCase().includes(normalized) ||
        student.studentId.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <AttendancePanel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Top Attendance Students</h2>
        <div className="relative w-full max-w-[12rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Number</th>
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">ID</th>
              <th className="pb-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-b border-border/60 last:border-none">
                <td className="py-3 pr-4 font-medium">{student.number}</td>
                <td className="py-3 pr-4">{student.name}</td>
                <td className="py-3 pr-4 text-muted-foreground">{student.studentId}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand-blue" style={{ width: `${student.progress}%` }} />
                    </div>
                    <span className="w-10 text-xs font-medium text-muted-foreground">{student.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AttendancePanel>
  );
}

type StudentAttendanceOverviewProps = {
  period: AttendancePeriod;
  studentName: string;
};

export function StudentAttendanceOverview({ period, studentName }: StudentAttendanceOverviewProps) {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const liveMarks = useLiveAttendanceMarks();
  const stats = useMemo(() => getAttendanceStats(period), [period, liveMarks]);

  const openSessions = useMemo(() => {
    const sessions = buildDemoSessions(now);
    return sessions.filter(
      (session) =>
        getSessionWindowState(session, now, hasMarkedSession(session.id)) === "open",
    );
  }, [now, liveMarks]);

  if (isLoading) {
    return <StudentAttendanceSkeleton />;
  }

  const historyBase = `${attendanceHref("history")}?status=`;

  return (
    <>
      {openSessions.length > 0 ? (
        <AttendancePanel className="flex flex-col gap-4 border border-brand-orange/25 bg-brand-orange/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
              Check-in open
            </p>
            <h2 className="mt-1 text-base font-bold">
              {openSessions.length} class{openSessions.length === 1 ? "" : "es"} ready for attendance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {openSessions.map((session) => session.className).join(" · ")}
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
          >
            <Link href={attendanceMarkHref()}>
              <MapPinCheck className="mr-2 h-4 w-4" />
              Mark attendance
            </Link>
          </Button>
        </AttendancePanel>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          value={stats.totalAttendance}
          label="Total Attendance"
          icon={CalendarCheck}
          tone="blue"
          href={`${historyBase}present`}
        />
        <StatCard value={stats.late} label="Late Attendance" icon={Clock} tone="green" href={`${historyBase}late`} />
        <StatCard
          value={stats.undertime}
          label="Undertime Attendance"
          icon={Timer}
          tone="orange"
          href={`${historyBase}undertime`}
        />
        <StatCard value={stats.absent} label="Total Absent" icon={UserX} tone="red" href={`${historyBase}absent`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <Link href={attendanceHref("calendar")} className="block transition-opacity hover:opacity-90">
            <AttendancePanel>
              <p className="text-3xl font-bold text-foreground">{stats.classDays}</p>
              <p className="mt-1 text-sm text-muted-foreground">Days</p>
              <p className="mt-2 text-xs text-muted-foreground">Class days for {period}</p>
            </AttendancePanel>
          </Link>

          <AttendancePanel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="mt-1 text-4xl font-bold text-foreground">{stats.attendanceRate}%</p>
              </div>
              <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-semibold text-brand-blue">
                This Year
              </span>
            </div>
            <MonthlyRateChart />
          </AttendancePanel>
        </div>

        <div className="space-y-5">
          <SummaryBarChart stats={stats} studentName={studentName} />
          <TopStudentsTable />
        </div>
      </div>
    </>
  );
}
