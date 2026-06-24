export type EventType = "Workshop" | "Competition" | "Ceremony" | "Social" | "Academic" | "Sports";

export type EventStatus = "pending" | "upcoming" | "past";

export type SchoolLounge = {
  id: string;
  name: string;
  eventCount: number;
  accent: string;
  gradient: string;
};

export type SchoolEvent = {
  id: string;
  title: string;
  lounge: string;
  loungeId: string;
  type: EventType;
  date: string;
  dateLabel: string;
  status: EventStatus;
  image: string;
  description?: string;
};

export const EVENT_STATS = {
  pendingReview: 16,
  upcoming: 29,
};

export const SCHOOL_LOUNGES: SchoolLounge[] = [
  {
    id: "music",
    name: "Music Club",
    eventCount: 7,
    accent: "from-sky-400 to-blue-500",
    gradient: "from-[#dbeafe] via-[#e0f2fe] to-[#f0f9ff]",
  },
  {
    id: "science",
    name: "Science Lab",
    eventCount: 5,
    accent: "from-emerald-400 to-teal-500",
    gradient: "from-[#d1fae5] via-[#ecfdf5] to-[#f0fdf4]",
  },
  {
    id: "sports",
    name: "Sports Arena",
    eventCount: 12,
    accent: "from-orange-400 to-amber-500",
    gradient: "from-[#ffedd5] via-[#fff7ed] to-[#fef3c7]",
  },
];

export const SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: "evt-1",
    title: "Spring Robotics Showcase",
    lounge: "Science Lab",
    loungeId: "science",
    type: "Competition",
    date: "2026-03-15",
    dateLabel: "Mar 15, 2026",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&q=80",
    description: "Student-built robots on display",
  },
  {
    id: "evt-2",
    title: "Jazz Night Rehearsal",
    lounge: "Music Club",
    loungeId: "music",
    type: "Social",
    date: "2026-03-02",
    dateLabel: "Mar 02, 2026",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&q=80",
  },
  {
    id: "evt-3",
    title: "Inter-house Football Finals",
    lounge: "Sports Arena",
    loungeId: "sports",
    type: "Sports",
    date: "2026-03-22",
    dateLabel: "Mar 22, 2026",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&q=80",
  },
  {
    id: "evt-4",
    title: "Parent-Teacher Forum",
    lounge: "Main Hall",
    loungeId: "science",
    type: "Ceremony",
    date: "2026-02-28",
    dateLabel: "Feb 28, 2026",
    status: "pending",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80",
  },
  {
    id: "evt-5",
    title: "Coding Bootcamp Day 1",
    lounge: "Science Lab",
    loungeId: "science",
    type: "Workshop",
    date: "2026-04-05",
    dateLabel: "Apr 05, 2026",
    status: "pending",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80",
  },
  {
    id: "evt-6",
    title: "Graduation Rehearsal",
    lounge: "Main Hall",
    loungeId: "science",
    type: "Ceremony",
    date: "2026-05-18",
    dateLabel: "May 18, 2026",
    status: "pending",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80",
  },
  {
    id: "evt-7",
    title: "Choir Winter Concert",
    lounge: "Music Club",
    loungeId: "music",
    type: "Social",
    date: "2025-12-14",
    dateLabel: "Dec 14, 2025",
    status: "past",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&q=80",
  },
  {
    id: "evt-8",
    title: "Science Fair 2025",
    lounge: "Science Lab",
    loungeId: "science",
    type: "Academic",
    date: "2026-01-13",
    dateLabel: "Jan 13, 2026",
    status: "past",
    image: "https://images.unsplash.com/photo-1532096710462-0c49617fb46?w=200&q=80",
  },
  {
    id: "evt-9",
    title: "Basketball Invitational",
    lounge: "Sports Arena",
    loungeId: "sports",
    type: "Sports",
    date: "2026-01-24",
    dateLabel: "Jan 24, 2026",
    status: "past",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&q=80",
  },
  {
    id: "evt-10",
    title: "Debate League Finals",
    lounge: "Main Hall",
    loungeId: "science",
    type: "Academic",
    date: "2026-02-10",
    dateLabel: "Feb 10, 2026",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&q=80",
  },
];

export type EventSortKey = "title" | "lounge" | "type" | "date";
export type EventSortDir = "asc" | "desc";

export function filterEvents(events: SchoolEvent[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return events;
  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(q) ||
      event.lounge.toLowerCase().includes(q) ||
      event.type.toLowerCase().includes(q) ||
      event.dateLabel.toLowerCase().includes(q),
  );
}

export function sortEvents(events: SchoolEvent[], key: EventSortKey, dir: EventSortDir) {
  const sorted = [...events].sort((a, b) => {
    let cmp = 0;
    if (key === "date") {
      cmp = a.date.localeCompare(b.date);
    } else {
      cmp = a[key].localeCompare(b[key]);
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function getEventsByStatus(status: EventStatus) {
  return SCHOOL_EVENTS.filter((event) => event.status === status);
}

export function formatEventBadgeDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  const month = parsed.toLocaleDateString("en-US", { month: "short" });
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${month}\n${day}`;
}
