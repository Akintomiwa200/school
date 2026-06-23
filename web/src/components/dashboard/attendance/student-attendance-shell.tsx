"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { useSession } from "next-auth/react";
import { Download, MapPinCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ATTENDANCE_PERIODS,
  DEFAULT_STUDENT,
  type AttendancePeriod,
} from "./student-attendance-data";
import {
  AttendancePanel,
  AttendanceSubNav,
  PeriodSelect,
  attendanceHref,
} from "./attendance-ui";
import { attendanceMarkHref } from "./student-attendance-data";

type StudentAttendanceShellProps = {
  children: React.ReactNode;
  period?: AttendancePeriod;
  onPeriodChange?: (period: AttendancePeriod) => void;
  showActions?: boolean;
};

export function StudentAttendanceShell({
  children,
  period = "Monthly",
  onPeriodChange,
  showActions = true,
}: StudentAttendanceShellProps) {
  const pathname = usePathname();
  const selectId = useId();
  const { data: session } = useSession();

  const student = {
    ...DEFAULT_STUDENT,
    name: session?.user?.name ?? DEFAULT_STUDENT.name,
    email: session?.user?.email ?? DEFAULT_STUDENT.email,
  };

  const initials = student.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeSegment = (() => {
    if (pathname === "/student/attendance") return "overview";
    if (pathname.startsWith("/student/attendance/mark")) return "mark";
    if (pathname.startsWith("/student/attendance/calendar")) return "calendar";
    if (pathname.startsWith("/student/attendance/history")) return "history";
    if (pathname.startsWith("/student/attendance/report")) return "report";
    return "overview";
  })();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Student Details
        </h1>
        {showActions ? (
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-9 rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90"
            >
              <Link href={attendanceMarkHref()}>
                <MapPinCheck className="mr-2 h-4 w-4" />
                Mark attendance
              </Link>
            </Button>
            {onPeriodChange ? (
              <PeriodSelect
                id={selectId}
                value={period}
                onChange={onPeriodChange}
                options={ATTENDANCE_PERIODS}
              />
            ) : null}
            <Button
              asChild
              className="h-9 rounded-full bg-brand-blue px-4 text-sm font-semibold text-white hover:bg-brand-blue/90"
            >
              <Link href={attendanceHref("report")}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <AttendancePanel className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue/15 text-xl font-bold text-brand-blue">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">ID:</span> {student.studentId}
            </p>
            <p>
              <span className="font-medium text-foreground">Number:</span> {student.phone}
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span> {student.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Address:</span> {student.address}
            </p>
          </div>
        </div>
      </AttendancePanel>

      <AttendanceSubNav activeSegment={activeSegment} />

      {children}
    </div>
  );
}
