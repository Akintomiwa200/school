"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarClock,
  ChevronDown,
  Search,
} from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  EVENT_STATS,
  SCHOOL_EVENTS,
  SCHOOL_LOUNGES,
  filterEvents,
  formatEventBadgeDate,
  sortEvents,
  type EventSortDir,
  type EventSortKey,
  type SchoolEvent,
} from "./events-data";
import { EVENT_TYPE_STYLES, EventsPanel } from "./events-ui";

function EventsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 rounded-[20px] bg-muted" />
        <div className="h-24 rounded-[20px] bg-muted" />
      </div>
      <div className="h-11 rounded-full bg-muted" />
      <div className="h-80 rounded-[20px] bg-muted" />
    </div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  tone,
}: {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "orange" | "green";
}) {
  const styles =
    tone === "orange"
      ? {
          card: "border border-brand-orange/15 bg-[#fff8f0]",
          icon: "bg-brand-orange/15 text-brand-orange",
          value: "text-brand-orange",
        }
      : {
          card: "border border-green/15 bg-[#f0fdf6]",
          icon: "bg-green/15 text-green",
          value: "text-green",
        };

  return (
    <EventsPanel className={cn("flex items-center gap-4 p-5", styles.card)}>
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", styles.icon)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className={cn("text-3xl font-bold leading-none", styles.value)}>{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </EventsPanel>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
    >
      {label}
      <ChevronDown className={cn("h-4 w-4 transition-transform", active && "rotate-180")} />
    </button>
  );
}

function EventsTable({
  events,
  sortKey,
  sortDir,
  onSort,
}: {
  events: SchoolEvent[];
  sortKey: EventSortKey;
  sortDir: EventSortDir;
  onSort: (key: EventSortKey) => void;
}) {
  return (
    <EventsPanel className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-[#d4f1f7] text-foreground">
              <th className="px-5 py-3.5 font-semibold">
                <SortButton
                  label="Event"
                  active={sortKey === "title"}
                  onClick={() => onSort("title")}
                />
              </th>
              <th className="px-5 py-3.5 font-semibold">
                <SortButton
                  label="Lounge"
                  active={sortKey === "lounge"}
                  onClick={() => onSort("lounge")}
                />
              </th>
              <th className="px-5 py-3.5 font-semibold">
                <SortButton
                  label="Type"
                  active={sortKey === "type"}
                  onClick={() => onSort("type")}
                />
              </th>
              <th className="px-5 py-3.5 font-semibold">
                <SortButton
                  label="Date"
                  active={sortKey === "date"}
                  onClick={() => onSort("date")}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No events match your search.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t border-border/60 transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{event.title}</p>
                        {event.description ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{event.lounge}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        EVENT_TYPE_STYLES[event.type],
                      )}
                    >
                      {event.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{event.dateLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </EventsPanel>
  );
}

function LoungeCard({ lounge }: { lounge: (typeof SCHOOL_LOUNGES)[number] }) {
  return (
    <div
      className={cn(
        "relative min-w-[260px] shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br p-5",
        lounge.gradient,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your lounge</p>
          <h3 className="mt-1 text-xl font-bold text-foreground">{lounge.name}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-brand-blue shadow-sm">
          <Calendar className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-6 text-sm font-semibold text-foreground/80">{lounge.eventCount} events</p>
      <div
        className={cn(
          "absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl",
          lounge.accent,
        )}
      />
    </div>
  );
}

function EventCarouselCard({
  event,
  size = "large",
}: {
  event: SchoolEvent;
  size?: "large" | "small";
}) {
  const badge = formatEventBadgeDate(event.date);

  return (
    <article
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[20px] bg-card shadow-float",
        size === "large" ? "w-[200px]" : "w-[140px]",
      )}
    >
      <div className={cn("relative w-full bg-muted", size === "large" ? "h-[220px]" : "h-[150px]")}>
        <Image src={event.image} alt={event.title} fill className="object-cover" sizes="200px" />
        <span className="absolute right-2 top-2 whitespace-pre-line rounded-lg bg-white/95 px-2 py-1 text-center text-[10px] font-bold leading-tight text-foreground shadow-sm">
          {badge}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        <p
          className={cn(
            "font-semibold leading-snug text-foreground",
            size === "large" ? "text-sm" : "text-xs",
          )}
        >
          {event.title}
        </p>
        <p className="text-[11px] text-muted-foreground">{event.lounge}</p>
      </div>
    </article>
  );
}

function MobileEventsView({
  upcoming,
  past,
}: {
  upcoming: SchoolEvent[];
  past: SchoolEvent[];
}) {
  return (
    <div className="space-y-8 md:hidden">
      <section>
        <h2 className="mb-3 text-base font-bold">Your lounges</h2>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SCHOOL_LOUNGES.map((lounge) => (
            <LoungeCard key={lounge.id} lounge={lounge} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events found.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {upcoming.map((event) => (
              <EventCarouselCard key={event.id} event={event} size="large" />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Past events</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past events found.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {past.map((event) => (
              <EventCarouselCard key={event.id} event={event} size="small" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function SharedEvents() {
  const isLoading = usePageLoading();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<EventSortKey>("date");
  const [sortDir, setSortDir] = useState<EventSortDir>("asc");

  const filtered = useMemo(() => filterEvents(SCHOOL_EVENTS, query), [query]);
  const tableEvents = useMemo(
    () => sortEvents(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );
  const upcoming = useMemo(
    () =>
      sortEvents(
        filtered.filter((event) => event.status === "upcoming" || event.status === "pending"),
        "date",
        "asc",
      ),
    [filtered],
  );
  const past = useMemo(
    () => sortEvents(filtered.filter((event) => event.status === "past"), "date", "desc"),
    [filtered],
  );

  const handleSort = (key: EventSortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  if (isLoading) {
    return <EventsSkeleton />;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">Events</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          value={EVENT_STATS.pendingReview}
          label="Pending Review"
          icon={CalendarClock}
          tone="orange"
        />
        <StatCard
          value={EVENT_STATS.upcoming}
          label="Upcoming Events"
          icon={Calendar}
          tone="green"
        />
      </div>

      <label className="relative block">
        <span className="sr-only">Search events</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className="h-12 w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </label>

      <EventsTable
        events={tableEvents}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <MobileEventsView upcoming={upcoming} past={past} />
    </div>
  );
}
