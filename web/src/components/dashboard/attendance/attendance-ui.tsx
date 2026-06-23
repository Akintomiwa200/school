import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendancePeriod, StudentAttendanceStatus } from "./student-attendance-data";

export function AttendancePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card p-4 text-card-foreground shadow-float sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function PeriodSelect({
  value,
  onChange,
  options,
  id,
}: {
  value: AttendancePeriod;
  onChange: (value: AttendancePeriod) => void;
  options: readonly AttendancePeriod[];
  id: string;
}) {
  return (
    <div className="relative shrink-0">
      <label htmlFor={id} className="sr-only">
        Select period
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as AttendancePeriod)}
        className="inline-flex appearance-none rounded-full border border-border bg-card py-2 pl-4 pr-9 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

const STATUS_STYLES: Record<
  StudentAttendanceStatus,
  { label: string; badge: string; dot: string }
> = {
  present: { label: "Present", badge: "bg-brand-blue/15 text-brand-blue", dot: "bg-brand-blue" },
  late: { label: "Late", badge: "bg-green/15 text-green", dot: "bg-green" },
  undertime: { label: "Undertime", badge: "bg-brand-orange/15 text-brand-orange", dot: "bg-brand-orange" },
  absent: { label: "Absent", badge: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  excused: { label: "Excused", badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export function AttendanceStatusBadge({ status }: { status: StudentAttendanceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", style.badge)}>
      {style.label}
    </span>
  );
}

export function AttendanceStatusDot({ status }: { status: StudentAttendanceStatus }) {
  return <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[status].dot)} />;
}

export function attendanceHref(segment?: string) {
  const base = "/student/attendance";
  return segment ? `${base}/${segment}` : base;
}

export function AttendanceSubNav({ activeSegment }: { activeSegment: string }) {
  const items = [
    { id: "overview", label: "Overview", href: attendanceHref() },
    { id: "mark", label: "Mark", href: attendanceHref("mark") },
    { id: "calendar", label: "Calendar", href: attendanceHref("calendar") },
    { id: "history", label: "History", href: attendanceHref("history") },
    { id: "report", label: "Report", href: attendanceHref("report") },
  ] as const;

  return (
    <nav aria-label="Attendance sections" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.id === activeSegment;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-blue text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
