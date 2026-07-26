"use client";

import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentAttendance, type StudentAttendanceData } from "@/hooks/use-dashboard-data";
import { AttendancePanel } from "./attendance-ui";
import {
  type AttendancePeriod,
} from "./student-attendance-data";
import { StudentAttendanceSkeleton } from "./student-attendance-skeleton";

type StudentAttendanceReportProps = {
  period: AttendancePeriod;
  studentName: string;
};

const EMPTY_ATTENDANCE: StudentAttendanceData = { records: [], stats: { totalClasses: 0, present: 0, absent: 0, late: 0, excused: 0, halfDay: 0, attendanceRate: 0 }, monthlyData: {} };

export function StudentAttendanceReport({ period, studentName }: StudentAttendanceReportProps) {
  const isLoading = usePageLoading();
  const { data: attendanceData } = useStudentAttendance(EMPTY_ATTENDANCE);
  const data = attendanceData ?? EMPTY_ATTENDANCE;

  const stats = useMemo(() => {
    const s = data.stats;
    return {
      totalAttendance: s.present + s.late,
      late: s.late,
      undertime: s.halfDay,
      absent: s.absent,
      attendanceRate: s.attendanceRate,
    };
  }, [data.stats]);

  const records = useMemo(() => {
    let filtered = [...data.records];
    if (period === "Weekly") filtered = filtered.slice(-5);
    else if (period === "Monthly") filtered = filtered.slice(-23);
    return filtered;
  }, [data.records, period]);

  const monthlyRates = useMemo(() => {
    const colors = ["blue", "orange", "green", "pink", "purple"] as const;
    return Object.entries(data.monthlyData).slice(-6).map(([month, mdata], i) => ({
      month: new Date(`${month}-15`).toLocaleDateString("en-US", { month: "long" }),
      rate: mdata.total > 0 ? Math.round(((mdata.present + mdata.late) / mdata.total) * 100) : 0,
      color: colors[i % colors.length],
    }));
  }, [data.monthlyData]);

  if (isLoading) {
    return <StudentAttendanceSkeleton />;
  }

  return (
    <div className="space-y-5">
      <AttendancePanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Attendance report
            </p>
            <h2 className="mt-1 text-xl font-bold">{studentName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{period} summary</p>
          </div>
          <Button className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-brand-blue/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="mt-1 text-2xl font-bold text-brand-blue">{stats.totalAttendance}</p>
          </div>
          <div className="rounded-2xl bg-green/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="mt-1 text-2xl font-bold text-green">{stats.late}</p>
          </div>
          <div className="rounded-2xl bg-brand-orange/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Undertime</p>
            <p className="mt-1 text-2xl font-bold text-brand-orange">{stats.undertime}</p>
          </div>
          <div className="rounded-2xl bg-destructive/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{stats.absent}</p>
          </div>
        </div>
      </AttendancePanel>

      {monthlyRates.length > 0 ? (
        <AttendancePanel>
          <h3 className="text-base font-bold">Monthly rates</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {monthlyRates.map((item) => (
              <div key={item.month} className="rounded-2xl bg-muted/45 px-4 py-3">
                <p className="text-xs text-muted-foreground">{item.month}</p>
                <p className="mt-1 text-lg font-bold">{item.rate}%</p>
              </div>
            ))}
          </div>
        </AttendancePanel>
      ) : null}

      <AttendancePanel>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-blue" />
          <h3 className="text-base font-bold">Included records ({records.length})</h3>
        </div>
        <div className="space-y-2">
          {records.slice(0, 8).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-xl bg-muted/35 px-4 py-3 text-sm"
            >
              <span>{record.date}</span>
              <span className="capitalize text-muted-foreground">{record.status}</span>
            </div>
          ))}
        </div>
      </AttendancePanel>
    </div>
  );
}
