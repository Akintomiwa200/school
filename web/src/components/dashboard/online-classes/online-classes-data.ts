import type { OnlineClassSession, OnlineClassStatus } from "@/lib/online-classes/sessions-hub";

export type { OnlineClassStatus };
export type { OnlineClassSession };

export function onlineClassesHref(segment?: string) {
  const base = "/shared/online-classes";
  return segment ? `${base}/${segment}` : base;
}

export function classSessionHref(sessionId: string) {
  return onlineClassesHref(sessionId);
}

export function classLiveHref(sessionId: string) {
  return onlineClassesHref(`${sessionId}/live`);
}

export function classRecordingHref(sessionId: string) {
  return onlineClassesHref(`${sessionId}/recording`);
}

export function formatClassTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const date = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const from = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const to = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${from} – ${to}`;
}

export function formatClassDuration(startAt: string, endAt: string) {
  const mins = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getStatusLabel(status: OnlineClassStatus) {
  switch (status) {
    case "live":
      return "Live now";
    case "scheduled":
      return "Scheduled";
    case "ended":
      return "Ended";
  }
}

export function canJoinSession(session: OnlineClassSession) {
  return session.status === "live" || session.status === "scheduled";
}

export function filterSessionsByTab(sessions: OnlineClassSession[], tab: "live" | "upcoming" | "recordings") {
  if (tab === "live") return sessions.filter((item) => item.status === "live");
  if (tab === "upcoming") return sessions.filter((item) => item.status === "scheduled");
  return sessions.filter((item) => item.hasRecording || item.status === "ended");
}
