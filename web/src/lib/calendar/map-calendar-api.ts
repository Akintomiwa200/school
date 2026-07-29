import type { CalendarEntry } from "@/components/dashboard/calendar/calendar-data";
import { toDateKey } from "@/components/dashboard/calendar/calendar-data";

export type ApiCalendarEntry = {
  id: string;
  title: string;
  description?: string;
  type: "event" | "class" | "announcement";
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  dayOfWeek?: number;
  classId?: string;
};

function formatTimeRange(start: string, end: string) {
  if (!start && !end) return "All day";
  if (start && end) return `${start} – ${end}`;
  return start || end || "All day";
}

function expandClassEntries(
  entry: ApiCalendarEntry,
  viewMonth: Date,
  timetableHref: string,
): CalendarEntry[] {
  if (entry.dayOfWeek == null) return [];

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const results: CalendarEntry[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    if (date.getDay() !== entry.dayOfWeek) continue;
    const dateKey = toDateKey(date);
    results.push({
      id: `${entry.id}-${dateKey}`,
      dateKey,
      type: "class",
      title: entry.title,
      description: entry.description ?? entry.location,
      timeLabel: formatTimeRange(entry.startTime, entry.endTime),
      href: entry.classId ? `${timetableHref}?class=${entry.classId}` : timetableHref,
      emoji: "📚",
    });
  }

  return results;
}

export function mapApiCalendarEntries(
  apiEntries: ApiCalendarEntry[],
  viewMonth: Date,
  options: { timetableHref: string; eventsPath?: string },
): CalendarEntry[] {
  const monthPrefix = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;
  const mapped: CalendarEntry[] = [];

  for (const entry of apiEntries) {
    if (entry.type === "class") {
      mapped.push(...expandClassEntries(entry, viewMonth, options.timetableHref));
      continue;
    }

    if (!entry.date.startsWith(monthPrefix)) continue;

    const isExam = /exam|quiz|assessment|final/i.test(entry.title);
    mapped.push({
      id: `cal-${entry.type}-${entry.id}`,
      dateKey: entry.date,
      type: entry.type === "announcement" ? "event" : isExam ? "exam" : "event",
      title: entry.title,
      description: entry.description ?? entry.location,
      timeLabel: formatTimeRange(entry.startTime, entry.endTime),
      href: options.eventsPath,
      emoji: entry.type === "announcement" ? "📢" : isExam ? "📝" : "🎉",
    });
  }

  return mapped.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.timeLabel.localeCompare(b.timeLabel);
  });
}

export function getMonthRange(viewMonth: Date) {
  const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
