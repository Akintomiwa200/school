export type ScheduleEventType = "class" | "hackathon" | "internship" | "mixed";

export type DayAttendanceStatus = "present" | "absent";

export type ScheduleEvent = {
  id: string;
  dateKey: string;
  type: ScheduleEventType;
  label: string;
  sessionTitle: string;
  description: string;
  startsAt: string;
  endsAt: string;
  courseId?: string;
  emoji: string;
  teacher: { name: string; initials: string };
  groupInitials: string[];
  registered: boolean;
};

export type ScheduleDayMeta = {
  dateKey: string;
  attendance?: DayAttendanceStatus;
};

export const EVENT_TYPE_STYLES: Record<
  ScheduleEventType,
  { card: string; dot: string; label: string }
> = {
  class: {
    card: "bg-brand-blue/12 border-brand-blue/25 text-brand-blue",
    dot: "bg-brand-blue",
    label: "Class",
  },
  hackathon: {
    card: "bg-brand-purple/12 border-brand-purple/25 text-brand-purple",
    dot: "bg-brand-purple",
    label: "Event",
  },
  internship: {
    card: "bg-brand-yellow/20 border-brand-yellow/40 text-amber-800",
    dot: "bg-brand-yellow",
    label: "Internship",
  },
  mixed: {
    card: "bg-brand-blue/10 border-brand-orange/30 text-foreground",
    dot: "bg-brand-orange",
    label: "Class + events",
  },
};

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string) {
  return new Date(`${key}T12:00:00`);
}

export type ScheduleFilter = "all" | "class" | "hackathon" | "internship" | "mixed";

/** Maximum schedule items allowed on a single weekday. */
export const MAX_EVENTS_PER_DAY = 6;

type EventPattern = {
  type: ScheduleEventType;
  label: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  courseId?: string;
  emoji: string;
  teacher?: { name: string; initials: string };
  description?: string;
};

type DayPattern = {
  day: number;
  events: EventPattern[];
};

function parseTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function sortEventsByTime(events: ScheduleEvent[]) {
  return [...events].sort((a, b) => parseTime(a.startsAt) - parseTime(b.startsAt));
}

function buildMonthPattern(year: number, month: number): ScheduleEvent[] {
  const defaultDescription =
    "In this lesson, we will learn how to read and write files in Python. We will work with text files, CSV, and JSON. We will also learn how to handle errors and use context managers for safe file operations.";

  const dayPatterns: DayPattern[] = [
    {
      day: 5,
      events: [
        {
          type: "hackathon",
          label: "Spring Hackathon",
          sessionTitle: "Spring Hackathon — Team sprint",
          startsAt: "09:00",
          endsAt: "18:00",
          emoji: "🚀",
        },
      ],
    },
    {
      day: 11,
      events: [
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Fundamentals of Data Processing in Python",
          startsAt: "09:00",
          endsAt: "10:30",
          courseId: "4",
          emoji: "🐍",
        },
        {
          type: "class",
          label: "English Lecture",
          sessionTitle: "Modern prose analysis",
          startsAt: "11:00",
          endsAt: "12:30",
          courseId: "1",
          emoji: "📖",
          teacher: { name: "Ms. Sarah Chen", initials: "SC" },
        },
      ],
    },
    {
      day: 16,
      events: [
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Fundamentals of Data Processing in Python",
          startsAt: "08:30",
          endsAt: "10:00",
          courseId: "4",
          emoji: "🐍",
        },
        {
          type: "class",
          label: "Design Strategy",
          sessionTitle: "User research methods",
          startsAt: "10:45",
          endsAt: "12:15",
          courseId: "2",
          emoji: "🎨",
          teacher: { name: "James Okonkwo", initials: "JO" },
        },
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Afternoon lab session",
          startsAt: "13:30",
          endsAt: "17:45",
          courseId: "4",
          emoji: "🐍",
        },
      ],
    },
    {
      day: 18,
      events: [
        {
          type: "mixed",
          label: "Class + events",
          sessionTitle: "Algorithms lab & campus event",
          startsAt: "09:00",
          endsAt: "11:00",
          courseId: "4",
          emoji: "📚",
        },
        {
          type: "class",
          label: "Business Lecture",
          sessionTitle: "Marketing fundamentals",
          startsAt: "11:30",
          endsAt: "13:00",
          courseId: "3",
          emoji: "💼",
          teacher: { name: "Dr. Amira Hassan", initials: "AH" },
        },
        {
          type: "mixed",
          label: "Class + events",
          sessionTitle: "Peer presentations",
          startsAt: "14:00",
          endsAt: "15:30",
          courseId: "4",
          emoji: "📚",
        },
      ],
    },
    {
      day: 20,
      events: [
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Morning algorithms review",
          startsAt: "08:00",
          endsAt: "09:30",
          courseId: "4",
          emoji: "🐍",
        },
        {
          type: "class",
          label: "Database Program",
          sessionTitle: "SQL joins & subqueries",
          startsAt: "09:45",
          endsAt: "11:15",
          courseId: "5",
          emoji: "🗄️",
          teacher: { name: "Prof. David Kim", initials: "DK" },
        },
        {
          type: "class",
          label: "English Lecture",
          sessionTitle: "Essay writing workshop",
          startsAt: "11:30",
          endsAt: "12:30",
          courseId: "1",
          emoji: "📖",
          teacher: { name: "Ms. Sarah Chen", initials: "SC" },
        },
        {
          type: "class",
          label: "Design Strategy",
          sessionTitle: "Wireframing sprint",
          startsAt: "13:00",
          endsAt: "14:30",
          courseId: "2",
          emoji: "🎨",
          teacher: { name: "James Okonkwo", initials: "JO" },
        },
        {
          type: "class",
          label: "Business Lecture",
          sessionTitle: "Finance basics",
          startsAt: "14:45",
          endsAt: "16:00",
          courseId: "3",
          emoji: "💼",
          teacher: { name: "Dr. Amira Hassan", initials: "AH" },
        },
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Evening revision clinic",
          startsAt: "16:15",
          endsAt: "17:30",
          courseId: "4",
          emoji: "🐍",
        },
      ],
    },
    {
      day: 23,
      events: [
        {
          type: "mixed",
          label: "Class + events",
          sessionTitle: "Database workshop & peer review",
          startsAt: "10:00",
          endsAt: "12:00",
          courseId: "5",
          emoji: "🗄️",
        },
        {
          type: "class",
          label: "Algorithms",
          sessionTitle: "Graph traversal practice",
          startsAt: "13:00",
          endsAt: "14:30",
          courseId: "4",
          emoji: "⚙️",
        },
      ],
    },
    {
      day: 24,
      events: [
        {
          type: "internship",
          label: "Internship",
          sessionTitle: "Industry placement — onsite day",
          startsAt: "11:45",
          endsAt: "17:00",
          emoji: "💼",
        },
      ],
    },
    {
      day: 25,
      events: [
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Working with APIs and JSON in Python",
          startsAt: "09:00",
          endsAt: "10:30",
          courseId: "4",
          emoji: "🐍",
        },
        {
          type: "class",
          label: "Database Program",
          sessionTitle: "NoSQL introduction",
          startsAt: "11:00",
          endsAt: "12:30",
          courseId: "5",
          emoji: "🗄️",
          teacher: { name: "Prof. David Kim", initials: "DK" },
        },
      ],
    },
    {
      day: 29,
      events: [
        {
          type: "hackathon",
          label: "Spring Hackathon",
          sessionTitle: "Final presentations",
          startsAt: "10:00",
          endsAt: "16:00",
          emoji: "🚀",
        },
      ],
    },
    {
      day: 30,
      events: [
        {
          type: "class",
          label: "Python : Class",
          sessionTitle: "Project review & Q&A",
          startsAt: "09:00",
          endsAt: "10:30",
          courseId: "4",
          emoji: "🐍",
        },
        {
          type: "class",
          label: "English Lecture",
          sessionTitle: "Term wrap-up discussion",
          startsAt: "11:00",
          endsAt: "12:00",
          courseId: "1",
          emoji: "📖",
          teacher: { name: "Ms. Sarah Chen", initials: "SC" },
        },
        {
          type: "class",
          label: "Design Strategy",
          sessionTitle: "Portfolio review",
          startsAt: "13:00",
          endsAt: "14:30",
          courseId: "2",
          emoji: "🎨",
          teacher: { name: "James Okonkwo", initials: "JO" },
        },
      ],
    },
  ];

  const lastDay = new Date(year, month + 1, 0).getDate();
  const allEvents: ScheduleEvent[] = [];

  for (const dayPattern of dayPatterns) {
    if (dayPattern.day > lastDay) continue;

    const cappedEvents = dayPattern.events.slice(0, MAX_EVENTS_PER_DAY);
    const date = new Date(year, month, dayPattern.day);
    const dateKey = formatDateKey(date);

    cappedEvents.forEach((pattern, index) => {
      allEvents.push({
        id: `sched-${dateKey}-${index}`,
        dateKey,
        type: pattern.type,
        label: pattern.label,
        sessionTitle: pattern.sessionTitle,
        description: pattern.description ?? defaultDescription,
        startsAt: pattern.startsAt,
        endsAt: pattern.endsAt,
        courseId: pattern.courseId,
        emoji: pattern.emoji,
        teacher: pattern.teacher ?? { name: "Konyukhov A.V.", initials: "KA" },
        groupInitials: ["AM", "JL", "SR", "DP"],
        registered: true,
      });
    });
  }

  return allEvents;
}

function buildAttendanceMeta(year: number, month: number): ScheduleDayMeta[] {
  const items: Array<{ day: number; status: DayAttendanceStatus }> = [
    { day: 2, status: "present" },
    { day: 4, status: "absent" },
    { day: 9, status: "present" },
  ];

  return items
    .filter(({ day }) => day <= new Date(year, month + 1, 0).getDate())
    .map(({ day, status }) => ({
      dateKey: formatDateKey(new Date(year, month, day)),
      attendance: status,
    }));
}

export function buildWeekdayMonthGrid(viewDate: Date): (Date | null)[][] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [null, null, null, null, null];

  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    const col = dow - 1;

    if (col === 0 && week.some(Boolean)) {
      weeks.push(week);
      week = [null, null, null, null, null];
    }

    week[col] = date;
  }

  if (week.some(Boolean)) weeks.push(week);
  return weeks;
}

export function getScheduleEvents(viewDate: Date): ScheduleEvent[] {
  return buildMonthPattern(viewDate.getFullYear(), viewDate.getMonth());
}

export function getScheduleDayMeta(viewDate: Date): ScheduleDayMeta[] {
  return buildAttendanceMeta(viewDate.getFullYear(), viewDate.getMonth());
}

export function getEventsForDate(events: ScheduleEvent[], dateKey: string) {
  return sortEventsByTime(events.filter((event) => event.dateKey === dateKey));
}

export function countEventsForDate(events: ScheduleEvent[], dateKey: string) {
  return getEventsForDate(events, dateKey).length;
}

export function formatScheduleDateHeader(dateKey: string) {
  const date = parseDateKey(dateKey);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${day}${suffix} of ${month} ${weekday}`;
}

export function formatMonthYear(viewDate: Date) {
  return viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

export function filterEvents(events: ScheduleEvent[], filter: ScheduleFilter) {
  if (filter === "all") return events;
  return events.filter((event) => event.type === filter);
}

export function courseMaterialsHref(courseId: string) {
  return `/student/courses/${courseId}/materials`;
}
