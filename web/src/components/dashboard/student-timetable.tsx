"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentTime } from "@/hooks/use-current-time";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_STYLES,
  buildWeekdayMonthGrid,
  courseMaterialsHref,
  filterEvents,
  formatMonthYear,
  formatScheduleDateHeader,
  getEventsForDate,
  getScheduleDayMeta,
  getScheduleEvents,
  isSameDay,
  shiftMonth,
  toDateKey,
  type ScheduleEvent,
  type ScheduleFilter,
} from "./timetable/student-timetable-data";
import { StudentTimetableSkeleton } from "./timetable/student-timetable-skeleton";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const FILTER_OPTIONS: { id: ScheduleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "class", label: "Classes" },
  { id: "hackathon", label: "Events" },
  { id: "internship", label: "Internships" },
  { id: "mixed", label: "Mixed" },
];

function SchedulePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card text-card-foreground shadow-float",
        className,
      )}
      {...props}
    />
  );
}

function AttendanceIcon({ status }: { status: "present" | "absent" }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
        status === "present" ? "bg-green" : "bg-destructive",
      )}
    >
      {status === "present" ? "✓" : "✕"}
    </span>
  );
}

function EventCard({
  event,
  compact,
  isSelected,
  onSelect,
}: {
  event: ScheduleEvent;
  compact?: boolean;
  isSelected?: boolean;
  onSelect: (event: ScheduleEvent) => void;
}) {
  const style = EVENT_TYPE_STYLES[event.type];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event);
      }}
      className={cn(
        "w-full rounded-xl border text-left transition-opacity hover:opacity-90",
        compact ? "px-1.5 py-1" : "px-2.5 py-2",
        style.card,
        isSelected && "ring-2 ring-brand-blue ring-offset-1",
      )}
    >
      <div className="flex items-center gap-1">
        <span className={compact ? "text-xs" : "text-sm"}>{event.emoji}</span>
        <span
          className={cn(
            "truncate font-semibold leading-tight",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {event.label}
        </span>
      </div>
      <p className={cn("opacity-80", compact ? "text-[9px]" : "mt-1 text-[10px]")}>{event.startsAt}</p>
    </button>
  );
}

function dayCellHeightClass(eventCount: number) {
  if (eventCount === 0) return "min-h-[88px]";
  if (eventCount <= 2) return "min-h-[110px]";
  if (eventCount <= 4) return "min-h-[180px]";
  return "min-h-[220px]";
}

function ScheduleSidebar({
  event,
  dayEvents,
  onSelectEvent,
  onClose,
}: {
  event: ScheduleEvent | null;
  dayEvents: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onClose: () => void;
}) {
  const [showDescription, setShowDescription] = useState(true);

  if (!event) {
    return (
      <SchedulePanel className="flex h-full min-h-[480px] flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Select a class or event</p>
        <p className="mt-1 text-xs text-muted-foreground">Click any item on the calendar to view details.</p>
      </SchedulePanel>
    );
  }

  return (
    <SchedulePanel className="relative flex h-full min-h-[480px] flex-col p-5 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Close details"
      >
        <X className="h-4 w-4" />
      </button>

      {dayEvents.length > 1 ? (
        <div className="pr-8">
          <p className="text-xs font-medium text-muted-foreground">
            {dayEvents.length} classes on this day
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dayEvents.map((dayEvent) => (
              <button
                key={dayEvent.id}
                type="button"
                onClick={() => onSelectEvent(dayEvent)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
                  dayEvent.id === event.id
                    ? "bg-brand-blue text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {dayEvent.startsAt} · {dayEvent.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {event.registered ? (
        <span className="inline-flex w-fit rounded-full bg-green/15 px-3 py-1 text-[11px] font-semibold text-green">
          You are registered
        </span>
      ) : null}

      <h2 className="mt-4 text-2xl font-bold leading-tight">{formatScheduleDateHeader(event.dateKey)}</h2>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-lg">{event.emoji}</span>
        <span className="font-medium text-foreground">{event.label}</span>
        <span>·</span>
        <span>
          {event.startsAt} – {event.endsAt}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold leading-snug">{event.sessionTitle}</h3>

      {showDescription ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setShowDescription((value) => !value)}
        className="mt-2 w-fit text-xs font-medium text-brand-blue hover:underline"
      >
        {showDescription ? "Hide" : "Show description"}
      </button>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Teacher</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/15 text-sm font-bold text-brand-blue">
              {event.teacher.initials}
            </span>
            <p className="text-sm font-semibold">{event.teacher.name}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">My group</p>
          <div className="mt-2 flex -space-x-2">
            {event.groupInitials.map((initials) => (
              <span
                key={initials}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground"
              >
                {initials}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-6">
        {event.courseId ? (
          <Button asChild variant="outline" className="h-11 rounded-2xl">
            <Link href={courseMaterialsHref(event.courseId)}>
              <Bookmark className="mr-2 h-4 w-4" />
              Materials
            </Link>
          </Button>
        ) : null}
        <Button className="h-11 rounded-2xl bg-brand-blue text-white hover:bg-brand-blue/90">
          <MessageCircle className="mr-2 h-4 w-4" />
          Enter Chat
        </Button>
      </div>
    </SchedulePanel>
  );
}

export function StudentTimetable() {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const [viewMonth, setViewMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const allEvents = useMemo(() => getScheduleEvents(viewMonth), [viewMonth]);
  const events = useMemo(() => filterEvents(allEvents, filter), [allEvents, filter]);
  const dayMeta = useMemo(() => getScheduleDayMeta(viewMonth), [viewMonth]);
  const weeks = useMemo(() => buildWeekdayMonthGrid(viewMonth), [viewMonth]);

  const attendanceByDate = useMemo(
    () => new Map(dayMeta.map((item) => [item.dateKey, item.attendance])),
    [dayMeta],
  );

  const selectedEvent = useMemo(() => {
    if (selectedEventId) {
      return events.find((event) => event.id === selectedEventId) ?? null;
    }
    if (selectedDateKey) {
      return getEventsForDate(events, selectedDateKey)[0] ?? null;
    }
    const todayKey = toDateKey(now);
    return getEventsForDate(events, todayKey)[0] ?? events[0] ?? null;
  }, [events, selectedEventId, selectedDateKey, now]);

  const sidebarDayEvents = useMemo(() => {
    const key = selectedEvent?.dateKey ?? selectedDateKey;
    if (!key) return [];
    return getEventsForDate(events, key);
  }, [events, selectedEvent, selectedDateKey]);

  function selectEvent(event: ScheduleEvent) {
    setSelectedEventId(event.id);
    setSelectedDateKey(event.dateKey);
  }

  function selectDate(date: Date) {
    const key = toDateKey(date);
    setSelectedDateKey(key);
    const dayEvents = getEventsForDate(events, key);
    setSelectedEventId(dayEvents[0]?.id ?? null);
  }

  if (isLoading) {
    return <StudentTimetableSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <nav className="text-sm text-muted-foreground">
        <Link href="/student" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Schedule</span>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <SchedulePanel className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {formatMonthYear(viewMonth)}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setViewMonth((current) => shiftMonth(current, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setViewMonth((current) => shiftMonth(current, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full px-4"
                  onClick={() => setShowFilter((value) => !value)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                {showFilter ? (
                  <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-border bg-card p-2 shadow-float">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setFilter(option.id);
                          setShowFilter(false);
                        }}
                        className={cn(
                          "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          filter === option.id
                            ? "bg-brand-blue/10 font-semibold text-brand-blue"
                            : "hover:bg-muted",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
            {WEEKDAY_LABELS.map((label) => (
              <p key={label} className="text-center text-xs font-semibold text-muted-foreground">
                {label}
              </p>
            ))}
          </div>

          <div className="mt-2 space-y-2 sm:space-y-3">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-5 gap-2 sm:gap-3">
                {week.map((date, colIndex) => {
                  if (!date) {
                    return <div key={`empty-${weekIndex}-${colIndex}`} className="min-h-[88px]" />;
                  }

                  const dateKey = toDateKey(date);
                  const dayEvents = getEventsForDate(events, dateKey);
                  const isToday = isSameDay(date, now);
                  const isSelected = selectedDateKey === dateKey;
                  const attendance = attendanceByDate.get(dateKey);

                  return (
                    <div
                      key={dateKey}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectDate(date)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") selectDate(date);
                      }}
                      className={cn(
                        "cursor-pointer rounded-2xl border bg-muted/20 p-2 text-left transition-colors sm:p-2.5",
                        dayCellHeightClass(dayEvents.length),
                        isSelected
                          ? "border-2 border-brand-blue bg-brand-blue/5"
                          : "border-border/60 hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                            isToday
                              ? "bg-brand-blue text-white"
                              : "text-foreground",
                          )}
                        >
                          {date.getDate()}
                        </span>
                        <div className="flex items-center gap-1">
                          {dayEvents.length > 1 ? (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                              {dayEvents.length}
                            </span>
                          ) : null}
                          {attendance ? <AttendanceIcon status={attendance} /> : null}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-2 space-y-1",
                          dayEvents.length > 4 && "max-h-[168px] overflow-y-auto pr-0.5",
                        )}
                      >
                        {dayEvents.map((dayEvent) => (
                          <EventCard
                            key={dayEvent.id}
                            event={dayEvent}
                            compact={dayEvents.length >= 3}
                            isSelected={selectedEventId === dayEvent.id}
                            onSelect={selectEvent}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </SchedulePanel>

        <ScheduleSidebar
          event={selectedEvent}
          dayEvents={sidebarDayEvents}
          onSelectEvent={selectEvent}
          onClose={() => {
            setSelectedEventId(null);
            setSelectedDateKey(null);
          }}
        />
      </div>
    </div>
  );
}
