import { SCHOOL_EVENTS } from "../events/events-data";
import { getScheduleEvents } from "../timetable/student-timetable-data";

export type CalendarEntryType = "class" | "exam" | "holiday" | "event";

export type CalendarFilter = "all" | CalendarEntryType;

export type CalendarEntry = {
  id: string;
  dateKey: string;
  type: CalendarEntryType;
  title: string;
  description?: string;
  timeLabel: string;
  href?: string;
  emoji?: string;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const EXTRA_ENTRIES: Omit<CalendarEntry, "id">[] = [
  {
    dateKey: "2026-06-01",
    type: "holiday",
    title: "Summer term begins",
    description: "Welcome back — check your timetable for new class times.",
    timeLabel: "All day",
    emoji: "🎒",
  },
  {
    dateKey: "2026-06-15",
    type: "exam",
    title: "Biology final examination",
    description: "Room B204 · Bring student ID and permitted materials.",
    timeLabel: "09:00 – 11:00",
    href: "/student/courses",
    emoji: "📝",
  },
  {
    dateKey: "2026-06-20",
    type: "exam",
    title: "Mathematics final examination",
    description: "Main hall · Calculators permitted.",
    timeLabel: "10:00 – 12:30",
    href: "/student/courses",
    emoji: "📐",
  },
  {
    dateKey: "2026-06-19",
    type: "holiday",
    title: "Public holiday — no classes",
    description: "School offices open limited hours.",
    timeLabel: "All day",
    emoji: "🏖️",
  },
  {
    dateKey: "2026-06-28",
    type: "holiday",
    title: "End of term break starts",
    description: "Assignments due before midnight.",
    timeLabel: "All day",
    emoji: "☀️",
  },
];

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string) {
  return new Date(`${key}T12:00:00`);
}

function mapScheduleType(type: string): CalendarEntryType {
  if (type === "class" || type === "mixed") return "class";
  return "event";
}

export function getCalendarEntries(viewDate: Date): CalendarEntry[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fromSchedule: CalendarEntry[] = getScheduleEvents(viewDate).map((item) => ({
    id: `cal-${item.id}`,
    dateKey: item.dateKey,
    type: mapScheduleType(item.type),
    title: item.sessionTitle,
    description: item.description,
    timeLabel: `${item.startsAt} – ${item.endsAt}`,
    href: item.courseId ? `/student/courses/${item.courseId}` : "/student/timetable",
    emoji: item.emoji,
  }));

  const fromEvents: CalendarEntry[] = SCHOOL_EVENTS.filter((item) =>
    item.date.startsWith(monthPrefix),
  ).map((item) => ({
    id: `cal-evt-${item.id}`,
    dateKey: item.date,
    type: "event" as const,
    title: item.title,
    description: item.description ?? `${item.type} · ${item.lounge}`,
    timeLabel: "See event page",
    href: "/shared/events",
    emoji: "🎉",
  }));

  const extras: CalendarEntry[] = EXTRA_ENTRIES.filter((item) =>
    item.dateKey.startsWith(monthPrefix),
  ).map((item, index) => ({
    ...item,
    id: `cal-extra-${item.dateKey}-${index}`,
  }));

  return [...fromSchedule, ...fromEvents, ...extras].sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.timeLabel.localeCompare(b.timeLabel);
  });
}

export function filterCalendarEntries(entries: CalendarEntry[], filter: CalendarFilter) {
  if (filter === "all") return entries;
  return entries.filter((entry) => entry.type === filter);
}

export function getEntriesForDate(entries: CalendarEntry[], dateKey: string) {
  return entries.filter((entry) => entry.dateKey === dateKey);
}

export function countEntriesForDate(entries: CalendarEntry[], dateKey: string) {
  return getEntriesForDate(entries, dateKey).length;
}

export function getCalendarStats(entries: CalendarEntry[]) {
  return {
    total: entries.length,
    classes: entries.filter((e) => e.type === "class").length,
    exams: entries.filter((e) => e.type === "exam").length,
    holidays: entries.filter((e) => e.type === "holiday").length,
    events: entries.filter((e) => e.type === "event").length,
  };
}

export function buildMonthGrid(viewDate: Date): (Date | null)[][] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  const startPad = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= lastDate; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function formatMonthYear(viewDate: Date) {
  return viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDayHeader(dateKey: string) {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateKey(date: Date) {
  return formatDateKey(date);
}

export function shiftMonth(viewDate: Date, delta: number) {
  return new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
}

export { WEEKDAYS };
