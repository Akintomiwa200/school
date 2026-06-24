"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, PlayCircle, Radio, Search, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  canJoinSession,
  classLiveHref,
  classRecordingHref,
  classSessionHref,
  filterSessionsByTab,
  formatClassDuration,
  formatClassTimeRange,
} from "./online-classes-data";
import {
  getClassStatsFromStore,
  useOnlineClassesStore,
} from "./online-classes-live-store";
import { ClassStatusBadge, LiveConnectionBadge, OnlineClassesPanel } from "./online-classes-ui";

type Tab = "live" | "upcoming" | "recordings";

function ClassesSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-[20px] bg-muted" />
        <div className="h-24 rounded-[20px] bg-muted" />
        <div className="h-24 rounded-[20px] bg-muted" />
      </div>
      <div className="h-64 rounded-[20px] bg-muted" />
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
  tone: "green" | "blue" | "purple";
}) {
  const styles =
    tone === "green"
      ? { card: "border-green/15 bg-green/5", icon: "bg-green/15 text-green", value: "text-green" }
      : tone === "blue"
        ? { card: "border-brand-blue/15 bg-brand-blue/5", icon: "bg-brand-blue/15 text-brand-blue", value: "text-brand-blue" }
        : { card: "border-brand-purple/15 bg-brand-purple/5", icon: "bg-brand-purple/15 text-brand-purple", value: "text-brand-purple" };

  return (
    <OnlineClassesPanel className={cn("flex items-center gap-4 border p-5", styles.card)}>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", styles.icon)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className={cn("text-3xl font-bold leading-none", styles.value)}>{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </OnlineClassesPanel>
  );
}

function SessionCard({ session }: { session: ReturnType<typeof filterSessionsByTab>[number] }) {
  const joinable = canJoinSession(session);

  return (
    <article className="overflow-hidden rounded-[20px] border border-border bg-card shadow-float">
      <div className={cn("h-28 bg-gradient-to-br p-5", session.coverTone)}>
        <div className="flex items-start justify-between gap-3">
          <ClassStatusBadge status={session.status} />
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground">
            {session.meetingCode}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{session.subject}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{session.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{session.description}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatClassTimeRange(session.startAt, session.endAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {session.joinCount}/{session.maxParticipants}
          </span>
          <span>{formatClassDuration(session.startAt, session.endAt)}</span>
        </div>
        <p className="text-sm font-medium text-foreground">{session.teacherName}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={!joinable && !session.hasRecording}>
            {session.status === "live" ? (
              <Link href={classLiveHref(session.id)}>
                <Video className="mr-2 h-4 w-4" />
                Join live
              </Link>
            ) : session.hasRecording ? (
              <Link href={classRecordingHref(session.id)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Watch recording
              </Link>
            ) : (
              <Link href={classSessionHref(session.id)}>View details</Link>
            )}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={classSessionHref(session.id)}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function SharedOnlineClasses() {
  const isLoading = usePageLoading();
  const { sessions, connection } = useOnlineClassesStore();
  const [tab, setTab] = useState<Tab>("live");
  const [query, setQuery] = useState("");
  const stats = getClassStatsFromStore();

  const filtered = useMemo(() => {
    const byTab = filterSessionsByTab(sessions, tab);
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q),
    );
  }, [query, sessions, tab]);

  if (isLoading) return <ClassesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Online Classes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join live sessions, view upcoming classes, and watch recordings.
          </p>
        </div>
        <LiveConnectionBadge status={connection} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={stats.live} label="Live now" icon={Radio} tone="green" />
        <StatCard value={stats.upcoming} label="Upcoming" icon={CalendarClock} tone="blue" />
        <StatCard value={stats.recordings} label="Recordings" icon={PlayCircle} tone="purple" />
      </div>

      <OnlineClassesPanel className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "live", label: "Live now" },
                { id: "upcoming", label: "Upcoming" },
                { id: "recordings", label: "Recordings" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "bg-brand-purple text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search classes…"
              className="rounded-full pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            {connection === "connecting" ? "Loading live schedule…" : "No classes in this section."}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </OnlineClassesPanel>
    </div>
  );
}
