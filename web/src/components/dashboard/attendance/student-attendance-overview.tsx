"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarCheck,
  Clock,
  Footprints,
  MapPinCheck,
  Timer,
  UserX,
} from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useStudentAttendance, type StudentAttendanceData } from "@/hooks/use-dashboard-data";
import { AttendancePanel, attendanceHref } from "./attendance-ui";
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

function SummaryBarChart({ stats }: { stats: StudentAttendanceData["stats"] }) {
  const items = [
    { label: "Present", value: stats.present, tone: "bg-brand-blue", icon: Footprints },
    { label: "Late", value: stats.late, tone: "bg-green", icon: Clock },
    { label: "Half Day", value: stats.halfDay, tone: "bg-brand-orange", icon: Timer },
    { label: "Absent", value: stats.absent, tone: "bg-destructive", icon: UserX },
  ] as const;
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <AttendancePanel>
      <h2 className="text-base font-bold">Attendance Summary</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const heightPct = Math.max(28, (item.value / maxValue) * 100);
          return (
            <div key={item.label} className="flex flex-col items-center rounded-2xl bg-muted/35 px-3 pb-3 pt-4">
              <p className="text-2xl font-bold text-foreground">{String(item.value).padStart(2, "0")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              <div className="mt-4 flex h-28 w-full items-end justify-center">
                <div className={cn("relative flex w-14 items-end justify-center rounded-t-2xl", item.tone)} style={{ height: `${heightPct}%` }}>
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

function AttendanceHistoryTable({ records }: { records: StudentAttendanceData["records"] }) {
  return (
    <AttendancePanel>
      <h2 className="text-base font-bold">Recent Attendance</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Class</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 10).map((record) => {
              const statusStyle = record.status === "present" ? "bg-green/15 text-green" :
                record.status === "absent" ? "bg-destructive/15 text-destructive" :
                record.status === "late" ? "bg-brand-orange/15 text-brand-orange" :
                "bg-muted text-muted-foreground";
              return (
                <tr key={record.id} className="border-b border-border/60 last:border-none">
                  <td className="py-3 pr-4 font-medium">{record.date}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{record.className}</td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyle)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{record.remarks ?? "—"}</td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No attendance records yet. Attend classes to see your history here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AttendancePanel>
  );
}

const EMPTY_ATTENDANCE: StudentAttendanceData = {
  records: [],
  stats: { totalClasses: 0, present: 0, absent: 0, late: 0, excused: 0, halfDay: 0, attendanceRate: 100 },
  monthlyData: {},
};

type StudentAttendanceOverviewProps = {
  period: string;
  studentName: string;
};

export function StudentAttendanceOverview({ period, studentName }: StudentAttendanceOverviewProps) {
  const isLoading = usePageLoading();
  const { data: attendanceData } = useStudentAttendance(EMPTY_ATTENDANCE);
  const data = attendanceData ?? EMPTY_ATTENDANCE;

  if (isLoading) {
    return <StudentAttendanceSkeleton />;
  }

  const historyBase = `${attendanceHref("history")}?status=`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={data.stats.present} label="Total Present" icon={CalendarCheck} tone="blue" href={`${historyBase}present`} />
        <StatCard value={data.stats.late} label="Late Attendance" icon={Clock} tone="green" href={`${historyBase}late`} />
        <StatCard value={data.stats.halfDay} label="Half Day" icon={Timer} tone="orange" href={`${historyBase}halfday`} />
        <StatCard value={data.stats.absent} label="Total Absent" icon={UserX} tone="red" href={`${historyBase}absent`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <AttendancePanel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="mt-1 text-4xl font-bold text-foreground">{data.stats.attendanceRate}%</p>
              </div>
              <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-semibold text-brand-blue">
                Overall
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Classes</p>
                  <p className="text-xl font-bold">{data.stats.totalClasses}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Present</p>
                  <p className="text-xl font-bold text-green">{data.stats.present}</p>
                </div>
              </div>
            </div>
          </AttendancePanel>
        </div>

        <div className="space-y-5">
          <SummaryBarChart stats={data.stats} />
        </div>
      </div>

      <AttendanceHistoryTable records={data.records} />
    </>
  );
}
