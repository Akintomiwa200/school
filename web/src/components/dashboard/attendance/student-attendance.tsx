"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { DEFAULT_STUDENT, type AttendancePeriod } from "./student-attendance-data";
import { StudentAttendanceMark } from "./student-attendance-mark";
import { StudentAttendanceCalendar } from "./student-attendance-calendar";
import { StudentAttendanceHistory } from "./student-attendance-history";
import { StudentAttendanceOverview } from "./student-attendance-overview";
import { StudentAttendanceReport } from "./student-attendance-report";
import { StudentAttendanceShell } from "./student-attendance-shell";

type StudentAttendanceProps = {
  view: "overview" | "mark" | "calendar" | "history" | "report";
  initialStatus?: string;
};

export function StudentAttendance({ view, initialStatus }: StudentAttendanceProps) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<AttendancePeriod>("Monthly");

  const studentName = session?.user?.name ?? DEFAULT_STUDENT.name;

  return (
    <StudentAttendanceShell
      period={period}
      onPeriodChange={view === "overview" || view === "history" || view === "report" ? setPeriod : undefined}
      showActions={view !== "report"}
    >
      {view === "overview" ? <StudentAttendanceOverview period={period} studentName={studentName} /> : null}
      {view === "mark" ? <StudentAttendanceMark /> : null}
      {view === "calendar" ? <StudentAttendanceCalendar /> : null}
      {view === "history" ? <StudentAttendanceHistory period={period} initialStatus={initialStatus} /> : null}
      {view === "report" ? <StudentAttendanceReport period={period} studentName={studentName} /> : null}
    </StudentAttendanceShell>
  );
}

export { StudentAttendanceRecord } from "./student-attendance-record";
