"use client";

import { useMemo, useState } from "react";
import { CalendarClock, PlayCircle, Radio, Search, Users, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  classLiveHref,
  classRecordingHref,
  classSessionHref,
  classWaitingHref,
  filterSessionsByTab,
  formatClassDuration,
  formatClassTimeRange,
} from "./online-classes-data";
import { useOnlineClassesBase } from "./online-classes-context";
import {
  getClassStatsFromStore,
  useOnlineClassesStore,
} from "./online-classes-live-store";
import { ClassStatusBadge, ClassActionLink, LiveConnectionBadge, OnlineClassesPanel } from "./online-classes-ui";

export type OnlineClassesTab = "live" | "upcoming" | "recordings";

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
    <OnlineClassesPanel className={cn("flex min-w-0 items-center gap-4 border p-5", styles.card)}>
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", styles.icon)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-3xl font-bold leading-none", styles.value)}>{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </OnlineClassesPanel>
  );
}

export function OnlineClassesStats() {
  const stats = getClassStatsFromStore();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard value={stats.live} label="Live now" icon={Radio} tone="green" />
      <StatCard value={stats.upcoming} label="Upcoming" icon={CalendarClock} tone="blue" />
      <StatCard value={stats.recordings} label="Recordings" icon={PlayCircle} tone="purple" />
    </div>
  );
}

function SessionCard({ session }: { session: ReturnType<typeof filterSessionsByTab>[number] }) {
  const basePath = useOnlineClassesBase();

  const primaryHref =
    session.status === "live"
      ? classLiveHref(session.id, basePath)
      : session.hasRecording
        ? classRecordingHref(session.id, basePath)
        : session.status === "scheduled"
          ? classWaitingHref(session.id, basePath)
          : classSessionHref(session.id, basePath);

  const primaryLabel =
    session.status === "live"
      ? "Join live"
      : session.hasRecording
        ? "Recording"
        : session.status === "scheduled"
          ? "Waiting room"
          : "View details";

  const PrimaryIcon =
    session.status === "live" ? Video : session.hasRecording ? PlayCircle : CalendarClock;

  const canOpen =
    session.status === "live" || session.hasRecording || session.status === "scheduled";

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-float">
      <div className={cn("h-28 shrink-0 bg-gradient-to-br p-5", session.coverTone)}>
        <div className="flex items-start justify-between gap-2">
          <ClassStatusBadge status={session.status} />
          <span className="shrink-0 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground">
            {session.meetingCode}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{session.subject}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{session.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{session.description}</p>
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{formatClassTimeRange(session.startAt, session.endAt)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>
              {session.joinCount}/{session.maxParticipants} participants
            </span>
          </li>
          <li className="pl-5">{formatClassDuration(session.startAt, session.endAt)}</li>
        </ul>
        <p className="text-sm font-medium text-foreground">{session.teacherName}</p>
        <div className="mt-auto flex flex-col gap-2">
          {canOpen ? (
            <ClassActionLink href={primaryHref} variant="primary">
              <PrimaryIcon className="h-4 w-4 shrink-0" />
              <span>{primaryLabel}</span>
            </ClassActionLink>
          ) : (
            <span className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted px-4 text-sm font-semibold text-muted-foreground">
              <PrimaryIcon className="h-4 w-4 shrink-0" />
              <span>{primaryLabel}</span>
            </span>
          )}
          <ClassActionLink href={classSessionHref(session.id, basePath)} variant="outline">
            Details
          </ClassActionLink>
        </div>
      </div>
    </article>
  );
}

export function OnlineClassesSessionList({
  fixedTab,
  hideTabBar = false,
  title,
}: {
  fixedTab?: OnlineClassesTab;
  hideTabBar?: boolean;
  title?: string;
}) {
  const isLoading = usePageLoading();
  const { sessions, connection } = useOnlineClassesStore();
  const [tab, setTab] = useState<OnlineClassesTab>(fixedTab ?? "live");
  const [query, setQuery] = useState("");
  const activeTab = fixedTab ?? tab;

  const filtered = useMemo(() => {
    const byTab = filterSessionsByTab(sessions, activeTab);
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q),
    );
  }, [activeTab, query, sessions]);

  if (isLoading) return <ClassesSkeleton />;

  const tabLabels: Record<OnlineClassesTab, string> = {
    live: "Live now",
    upcoming: "Upcoming",
    recordings: "Recordings",
  };

  return (
    <OnlineClassesPanel className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {title ? (
            <div>
              <h2 className="text-base font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tabLabels[activeTab]} classes</p>
            </div>
          ) : null}
          {hideTabBar || fixedTab ? <LiveConnectionBadge status={connection} /> : null}
        </div>
        <div className="relative w-full shrink-0 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search classes…"
            className="h-10 w-full rounded-full pl-9"
          />
        </div>
      </div>

      {!hideTabBar && !fixedTab ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          <LiveConnectionBadge status={connection} />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          {connection === "connecting" ? "Loading live schedule…" : "No classes in this section."}
        </div>
      ) : (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </OnlineClassesPanel>
  );
}

export function SharedOnlineClasses({ embedded = false }: { embedded?: boolean }) {
  const { connection } = useOnlineClassesStore();

  return (
    <div className="space-y-6">
      {!embedded ? (
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
      ) : null}

      <OnlineClassesStats />
      <OnlineClassesSessionList />
    </div>
  );
}
