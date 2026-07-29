import type { EventStatus, EventType, SchoolEvent, SchoolLounge } from "@/components/dashboard/events/events-data";

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&q=80",
  "https://images.unsplash.com/photo-1532096710462-0c49617fb46?w=200&q=80",
];

const EVENT_TYPES: EventType[] = ["Workshop", "Competition", "Ceremony", "Social", "Academic", "Sports"];

function inferEventType(title: string): EventType {
  const lower = title.toLowerCase();
  if (lower.includes("sport") || lower.includes("football") || lower.includes("basketball")) return "Sports";
  if (lower.includes("workshop") || lower.includes("bootcamp")) return "Workshop";
  if (lower.includes("competition") || lower.includes("fair")) return "Competition";
  if (lower.includes("graduation") || lower.includes("ceremony") || lower.includes("forum")) return "Ceremony";
  if (lower.includes("concert") || lower.includes("social")) return "Social";
  return "Academic";
}

function eventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  if (endDate < now) return "past";
  if (startDate > now) return "upcoming";
  return "pending";
}

export type ApiEvent = {
  id: string;
  title: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  location?: string | null;
};

export function mapApiEventToSchoolEvent(event: ApiEvent, index: number): SchoolEvent {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const lounge = event.location?.trim() || "Main Hall";
  const loungeId = lounge.toLowerCase().replace(/\s+/g, "-").slice(0, 24);

  return {
    id: event.id,
    title: event.title,
    lounge,
    loungeId,
    type: inferEventType(event.title),
    date: start.toISOString().slice(0, 10),
    dateLabel: start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: eventStatus(start, end),
    image: EVENT_IMAGES[index % EVENT_IMAGES.length]!,
    description: event.description ?? undefined,
  };
}

export function buildEventStats(events: SchoolEvent[]) {
  return {
    pendingReview: events.filter((e) => e.status === "pending").length,
    upcoming: events.filter((e) => e.status === "upcoming" || e.status === "pending").length,
  };
}

export function buildLoungesFromEvents(events: SchoolEvent[]): SchoolLounge[] {
  const map = new Map<string, SchoolLounge>();
  const gradients = [
    { gradient: "from-[#dbeafe] via-[#e0f2fe] to-[#f0f9ff]", accent: "from-sky-400 to-blue-500" },
    { gradient: "from-[#d1fae5] via-[#ecfdf5] to-[#f0fdf4]", accent: "from-emerald-400 to-teal-500" },
    { gradient: "from-[#ffedd5] via-[#fff7ed] to-[#fef3c7]", accent: "from-orange-400 to-amber-500" },
  ];

  for (const event of events) {
    const existing = map.get(event.loungeId);
    if (existing) {
      existing.eventCount += 1;
      continue;
    }
    const style = gradients[map.size % gradients.length]!;
    map.set(event.loungeId, {
      id: event.loungeId,
      name: event.lounge,
      eventCount: 1,
      accent: style.accent,
      gradient: style.gradient,
    });
  }

  return [...map.values()];
}
