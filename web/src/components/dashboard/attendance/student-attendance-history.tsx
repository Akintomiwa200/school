"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  AttendancePanel,
  AttendanceStatusBadge,
} from "./attendance-ui";
import { CourseDotTabs } from "../courses/course-ui";
import {
  attendanceHistoryHref,
  formatDisplayDate,
  getAttendanceRecords,
  type AttendancePeriod,
  type StudentAttendanceStatus,
} from "./student-attendance-data";
import { StudentAttendanceListSkeleton } from "./student-attendance-skeleton";

type StatusFilter = "all" | StudentAttendanceStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "present", label: "Present" },
  { id: "late", label: "Late" },
  { id: "undertime", label: "Undertime" },
  { id: "absent", label: "Absent" },
];

type StudentAttendanceHistoryProps = {
  period: AttendancePeriod;
  initialStatus?: string;
};

function resolveStatusFilter(value?: string): StatusFilter {
  if (value && STATUS_TABS.some((tab) => tab.id === value)) {
    return value as StatusFilter;
  }
  return "all";
}

export function StudentAttendanceHistory({ period, initialStatus }: StudentAttendanceHistoryProps) {
  const isLoading = usePageLoading();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => resolveStatusFilter(initialStatus));

  const records = useMemo(
    () =>
      getAttendanceRecords({
        period,
        status: statusFilter,
      }),
    [period, statusFilter],
  );

  if (isLoading) {
    return <StudentAttendanceListSkeleton />;
  }

  return (
    <div className="space-y-5">
      <CourseDotTabs tabs={STATUS_TABS} active={statusFilter} onChange={setStatusFilter} />

      {records.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No records in this view"
          description="Try another filter or switch the period from the header."
          action={
            statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="text-sm font-medium text-brand-blue underline underline-offset-2"
              >
                View all records
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Link key={record.id} href={attendanceHistoryHref(record.id)} className="block">
              <AttendancePanel className="transition-colors hover:bg-muted/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{formatDisplayDate(record.date)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{record.className}</p>
                  </div>
                  <AttendanceStatusBadge status={record.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {record.checkIn ? <span>Check-in: {record.checkIn}</span> : null}
                  {record.checkOut ? <span>Check-out: {record.checkOut}</span> : null}
                </div>
              </AttendancePanel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
