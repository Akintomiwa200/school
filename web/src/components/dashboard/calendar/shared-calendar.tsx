"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentTime } from "@/hooks/use-current-time";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  type CalendarEntry,
  type CalendarFilter,
  WEEKDAYS,
  buildMonthGrid,
  filterCalendarEntries,
  formatDayHeader,
  formatMonthYear,
  getCalendarEntries,
  getCalendarStats,
  getEntriesForDate,
  isSameDay,
  shiftMonth,
  toDateKey,
} from "./calendar-data";
import {
  CalendarActionLink,
  CalendarPanel,
  CalendarTypeBadge,
  CALENDAR_TYPE_STYLES,
} from "./calendar-ui";

const FILTER_TABS: { id: CalendarFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "class", label: "Classes" },
  { id: "exam", label: "Exams" },
  { id: "holiday", label: "Holidays" },
  { id: "event", label: "Events" },
];

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-[420px] rounded-[20px] bg-muted" />
    </div>
  );
}

function StatCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "purple" | "blue" | "orange" | "green";
}) {
  const styles =
    tone === "purple"
      ? { card: "border-brand-purple/15 bg-brand-purple/5", value: "text-brand-purple" }
      : tone === "blue"
        ? { card: "border-brand-blue/15 bg-brand-blue/5", value: "text-brand-blue" }
        : tone === "orange"
          ? { card: "border-brand-orange/15 bg-brand-orange/5", value: "text-brand-orange" }
          : { card: "border-green/15 bg-green/5", value: "text-green" };

  return (
    <CalendarPanel className={cn("border p-4", styles.card)}>
      <p className={cn("text-3xl font-bold leading-none", styles.value)}>{value}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
    </CalendarPanel>
  );
}

function DayEntryChip({ entry }: { entry: CalendarEntry }) {
  const style = CALENDAR_TYPE_STYLES[entry.type];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]",
        style.badge,
      )}
    >
      {entry.emoji ? <span className="shrink-0">{entry.emoji}</span> : null}
      <span className="truncate">{entry.title}</span>
    </span>
  );
}

function DayDetailList({
  dateKey,
  entries,
}: {
  dateKey: string | null;
  entries: CalendarEntry[];
}) {
  if (!dateKey) {
    return (
      <CalendarPanel className="flex h-full min-h-[280px] flex-col items-center justify-center border border-border text-center">
        <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Select a day</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Tap a date on the month view to see classes, exams, and events.
        </p>
      </CalendarPanel>
    );
  }

  const dayEntries = getEntriesForDate(entries, dateKey);

  return (
    <CalendarPanel className="flex h-full min-h-[280px] flex-col border border-border">
      <div className="min-w-0 border-b border-border pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">My events</p>
        <h2 className="mt-1 text-lg font-bold leading-snug">{formatDayHeader(dateKey)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dayEntries.length === 0
            ? "Nothing scheduled"
            : `${dayEntries.length} item${dayEntries.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {dayEntries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Clear day"
          description="No classes, exams, or events on this date."
          className="border-none bg-transparent py-8"
        />
      ) : (
        <ul className="mt-4 min-w-0 flex-1 space-y-3 overflow-y-auto">
          {dayEntries.map((entry) => (
            <li key={entry.id}>
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.emoji ? <span className="text-lg">{entry.emoji}</span> : null}
                      <CalendarTypeBadge type={entry.type} />
                    </div>
                    <h3 className="mt-2 font-semibold leading-snug">{entry.title}</h3>
                    {entry.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entry.description}</p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {entry.timeLabel}
                </p>
                {entry.href ? (
                  <Link
                    href={entry.href}
                    className="mt-3 inline-flex text-sm font-medium text-brand-purple hover:underline"
                  >
                    View details →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </CalendarPanel>
  );
}

export function SharedCalendar() {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const [viewMonth, setViewMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() => toDateKey(now));

  const allEntries = useMemo(() => getCalendarEntries(viewMonth), [viewMonth]);
  const entries = useMemo(() => filterCalendarEntries(allEntries, filter), [allEntries, filter]);
  const stats = useMemo(() => getCalendarStats(allEntries), [allEntries]);
  const weeks = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  if (isLoading) {
    return (
      <div className="mx-auto min-w-0 w-full max-w-7xl">
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Events, exams, and school holidays in one month view.
          </p>
        </div>
        <Button asChild variant="outline" className="h-9 shrink-0 rounded-full px-4">
          <Link href="/shared/events" className="inline-flex items-center gap-2">
            <PartyPopper className="h-4 w-4 shrink-0" />
            School events
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={stats.total} label="This month" tone="purple" />
        <StatCard value={stats.classes} label="Classes" tone="blue" />
        <StatCard value={stats.exams} label="Exams" tone="orange" />
        <StatCard value={stats.holidays + stats.events} label="Holidays & events" tone="green" />
      </div>

      <nav
        aria-label="Calendar filters"
        className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full gap-2 sm:w-auto sm:min-w-0 sm:flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === tab.id
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <CalendarPanel className="min-w-0 border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">{formatMonthYear(viewMonth)}</h2>
            <div className="flex shrink-0 items-center gap-1">
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
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground sm:text-xs">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-1 space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, colIndex) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${colIndex}`}
                        className="min-h-[4.5rem] rounded-xl bg-muted/10 sm:min-h-[5.5rem]"
                      />
                    );
                  }

                  const dateKey = toDateKey(date);
                  const dayEntries = getEntriesForDate(entries, dateKey);
                  const isToday = isSameDay(date, now);
                  const isSelected = selectedDateKey === dateKey;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(dateKey)}
                      className={cn(
                        "flex min-h-[4.5rem] flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-[5.5rem] sm:p-2",
                        isSelected
                          ? "border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple/30"
                          : "border-border/60 bg-background hover:bg-muted/40",
                        isWeekend && !isSelected && "bg-muted/15",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            isToday ? "bg-brand-purple text-white" : "text-foreground",
                          )}
                        >
                          {date.getDate()}
                        </span>
                        {dayEntries.length > 0 ? (
                          <span className="flex gap-0.5">
                            {dayEntries.slice(0, 3).map((entry) => (
                              <span
                                key={entry.id}
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  CALENDAR_TYPE_STYLES[entry.type].dot,
                                )}
                              />
                            ))}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 hidden min-w-0 flex-1 flex-col gap-0.5 sm:flex">
                        {dayEntries.slice(0, 2).map((entry) => (
                          <DayEntryChip key={entry.id} entry={entry} />
                        ))}
                        {dayEntries.length > 2 ? (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            +{dayEntries.length - 2} more
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </CalendarPanel>

        <DayDetailList dateKey={selectedDateKey} entries={entries} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CalendarPanel className="flex h-full flex-col border border-border">
          <h2 className="text-base font-bold">Full class timetable</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Week-by-week schedule with filters and session details.
          </p>
          <CalendarActionLink href="/student/timetable" className="mt-4">
            Open timetable
            <ChevronRight className="h-4 w-4 shrink-0" />
          </CalendarActionLink>
        </CalendarPanel>
        <CalendarPanel className="flex h-full flex-col border border-border">
          <h2 className="text-base font-bold">School events</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sports, cultural activities, and RSVP for upcoming events.
          </p>
          <CalendarActionLink href="/shared/events" variant="outline" className="mt-4">
            Browse events
            <ChevronRight className="h-4 w-4 shrink-0" />
          </CalendarActionLink>
        </CalendarPanel>
      </div>
    </div>
  );
}
