"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { AttendancePanel, AttendanceStatusBadge, attendanceHref } from "./attendance-ui";
import {
  formatDisplayDate,
  getAttendanceRecordById,
} from "./student-attendance-data";
import { StudentAttendanceListSkeleton } from "./student-attendance-skeleton";

export function StudentAttendanceRecord({ recordId }: { recordId: string }) {
  const isLoading = usePageLoading();
  const record = getAttendanceRecordById(recordId);

  if (isLoading) {
    return <StudentAttendanceListSkeleton />;
  }

  if (!record) {
    return (
      <AttendancePanel className="text-center">
        <h2 className="text-lg font-bold">Record not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This attendance record does not exist or is no longer available.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={attendanceHref("history")}>Back to history</Link>
        </Button>
      </AttendancePanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={attendanceHref("history")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to history
      </Link>

      <AttendancePanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Attendance record
            </p>
            <h2 className="mt-1 text-xl font-bold">{formatDisplayDate(record.date)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{record.className}</p>
          </div>
          <AttendanceStatusBadge status={record.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="mt-1 text-sm font-semibold">{record.checkIn ?? "—"}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="mt-1 text-sm font-semibold">{record.checkOut ?? "—"}</p>
          </div>
        </div>

        {record.remarks ? (
          <div className="mt-5">
            <h3 className="text-sm font-bold">Remarks</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{record.remarks}</p>
          </div>
        ) : null}
      </AttendancePanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={attendanceHref("calendar")}>View calendar</Link>
        </Button>
        <Button asChild className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
          <Link href={attendanceHref("report")}>Download report</Link>
        </Button>
      </div>
    </div>
  );
}
