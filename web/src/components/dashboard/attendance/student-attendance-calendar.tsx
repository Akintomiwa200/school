"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  AttendancePanel,
  AttendanceStatusDot,
  attendanceHref,
} from "./attendance-ui";
import {
  attendanceHistoryHref,
  getCalendarMonthDays,
  type StudentAttendanceStatus,
} from "./student-attendance-data";
import { StudentAttendanceListSkeleton } from "./student-attendance-skeleton";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const LEGEND: { status: StudentAttendanceStatus; label: string }[] = [
  { status: "present", label: "Present" },
  { status: "late", label: "Late" },
  { status: "undertime", label: "Undertime" },
  { status: "absent", label: "Absent" },
];

export function StudentAttendanceCalendar() {
  const isLoading = usePageLoading();
  const [focusDate, setFocusDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const monthLabel = focusDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = useMemo(
    () => getCalendarMonthDays(focusDate.getFullYear(), focusDate.getMonth()),
    [focusDate],
  );

  const shiftMonth = (delta: number) => {
    setFocusDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      return next;
    });
  };

  if (isLoading) {
    return <StudentAttendanceListSkeleton />;
  }

  return (
    <div className="space-y-5">
      <AttendancePanel>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">{monthLabel}</h2>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const content = (
              <div
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl py-2 transition-colors",
                  day.inMonth ? "text-foreground" : "text-muted-foreground/50",
                  day.record ? "hover:bg-muted/50" : "",
                )}
              >
                <span className="text-sm font-semibold">{day.date}</span>
                {day.record ? <AttendanceStatusDot status={day.record.status} /> : <span className="h-2 w-2" />}
              </div>
            );

            if (day.record) {
              return (
                <Link key={day.dateKey} href={attendanceHistoryHref(day.record.id)} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={day.dateKey}>{content}</div>;
          })}
        </div>
      </AttendancePanel>

      <AttendancePanel>
        <h3 className="text-sm font-bold">Legend</h3>
        <div className="mt-3 flex flex-wrap gap-4">
          {LEGEND.map((item) => (
            <div key={item.status} className="flex items-center gap-2 text-sm text-muted-foreground">
              <AttendanceStatusDot status={item.status} />
              {item.label}
            </div>
          ))}
        </div>
      </AttendancePanel>

      <EmptyState
        title="Need the full list?"
        description="Open the history page to filter and review every attendance record."
        action={
          <Link
            href={attendanceHref("history")}
            className="text-sm font-semibold text-brand-blue underline underline-offset-2"
          >
            View attendance history
          </Link>
        }
        className="border-none bg-transparent py-4"
      />
    </div>
  );
}
