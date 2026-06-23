"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  MapPin,
  Monitor,
  QrCode,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentTime } from "@/hooks/use-current-time";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  buildDemoSessions,
  formatSessionTimeRange,
  getSessionWindowState,
  hasMarkedSession,
  useLiveAttendanceMarks,
} from "./attendance-live-store";
import { AttendancePanel } from "./attendance-ui";
import { attendanceMarkHref } from "./student-attendance-data";
import { StudentAttendanceListSkeleton } from "./student-attendance-skeleton";

const MODE_META = {
  physical: { label: "Physical", icon: MapPin, tone: "text-brand-blue bg-brand-blue/10" },
  virtual: { label: "Virtual", icon: Monitor, tone: "text-brand-purple bg-brand-purple/10" },
  hybrid: { label: "Hybrid", icon: Video, tone: "text-brand-orange bg-brand-orange/10" },
} as const;

const WINDOW_LABELS = {
  upcoming: { label: "Upcoming", className: "bg-muted text-muted-foreground" },
  open: { label: "Open now", className: "bg-green/15 text-green" },
  ended: { label: "Ended", className: "bg-destructive/15 text-destructive" },
  marked: { label: "Marked", className: "bg-brand-blue/15 text-brand-blue" },
} as const;

export function StudentAttendanceMark() {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const liveMarks = useLiveAttendanceMarks();

  const sessions = useMemo(() => buildDemoSessions(now), [now.toDateString()]);

  const sorted = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const aMarked = hasMarkedSession(a.id);
        const bMarked = hasMarkedSession(b.id);
        const aState = getSessionWindowState(a, now, aMarked);
        const bState = getSessionWindowState(b, now, bMarked);
        const priority = { open: 0, upcoming: 1, marked: 2, ended: 3 };
        return priority[aState] - priority[bState] || a.startsAt.getTime() - b.startsAt.getTime();
      }),
    [sessions, now, liveMarks],
  );

  if (isLoading) {
    return <StudentAttendanceListSkeleton />;
  }

  const openCount = sorted.filter(
    (session) => getSessionWindowState(session, now, hasMarkedSession(session.id)) === "open",
  ).length;

  return (
    <div className="space-y-5">
      <AttendancePanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live attendance
          </p>
          <h2 className="mt-1 text-lg font-bold">Today&apos;s classes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {openCount > 0
              ? `${openCount} class${openCount === 1 ? "" : "es"} open for check-in right now.`
              : "No classes are open for check-in at the moment."}
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums text-brand-blue">
          {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      </AttendancePanel>

      <div className="space-y-3">
        {sorted.map((session) => {
          const marked = hasMarkedSession(session.id);
          const windowState = getSessionWindowState(session, now, marked);
          const mode = MODE_META[session.mode];
          const ModeIcon = mode.icon;
          const windowMeta = WINDOW_LABELS[windowState];

          return (
            <AttendancePanel key={session.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold", mode.tone)}>
                      <ModeIcon className="h-3.5 w-3.5" />
                      {mode.label}
                    </span>
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", windowMeta.className)}>
                      {windowMeta.label}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">{session.className}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{session.teacher}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{formatSessionTimeRange(session)}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {session.room ? <span>{session.building} · {session.room}</span> : null}
                {session.meetingUrl ? <span>Online session available</span> : null}
                {session.mode !== "virtual" ? <span>Campus check-in requires location</span> : null}
                {session.mode === "virtual" ? <span>Virtual code required</span> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {windowState === "open" ? (
                  <Button
                    asChild
                    className="shrink-0 rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue/90"
                  >
                    <Link href={attendanceMarkHref(session.id)}>Mark attendance</Link>
                  </Button>
                ) : windowState === "marked" ? (
                  <Button asChild variant="outline" className="shrink-0 rounded-full px-4">
                    <Link href={attendanceMarkHref(session.id)}>View check-in</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="shrink-0 rounded-full px-4" disabled>
                    {windowState === "upcoming" ? "Not open yet" : "Window closed"}
                  </Button>
                )}
                {session.meetingUrl && session.mode !== "physical" ? (
                  <Button asChild variant="outline" className="shrink-0 rounded-full px-4">
                    <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                      <QrCode className="h-4 w-4" />
                      Join class
                    </a>
                  </Button>
                ) : null}
              </div>
            </AttendancePanel>
          );
        })}
      </div>
    </div>
  );
}
