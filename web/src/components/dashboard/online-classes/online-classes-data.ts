import type { OnlineClassSession, OnlineClassStatus } from "@/lib/online-classes/sessions-hub";

export type { OnlineClassStatus };
export type { OnlineClassSession };

export const DEFAULT_ONLINE_CLASSES_BASE = "/shared/online-classes";
export const STUDENT_ONLINE_CLASSES_BASE = "/student/online-classes";

export function onlineClassesHref(segment?: string, basePath = DEFAULT_ONLINE_CLASSES_BASE) {
  return segment ? `${basePath}/${segment}` : basePath;
}

export function classSessionHref(sessionId: string, basePath = DEFAULT_ONLINE_CLASSES_BASE) {
  return onlineClassesHref(sessionId, basePath);
}

export function classLiveHref(sessionId: string, basePath = DEFAULT_ONLINE_CLASSES_BASE) {
  return onlineClassesHref(`${sessionId}/live`, basePath);
}

export function classRecordingHref(sessionId: string, basePath = DEFAULT_ONLINE_CLASSES_BASE) {
  return onlineClassesHref(`${sessionId}/recording`, basePath);
}

export function classWaitingHref(sessionId: string, basePath = DEFAULT_ONLINE_CLASSES_BASE) {
  return onlineClassesHref(`${sessionId}/waiting`, basePath);
}

export function studentOnlineClassesHref(segment?: string) {
  return onlineClassesHref(segment, STUDENT_ONLINE_CLASSES_BASE);
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

export function findSessionByMeetingCode(
  sessions: OnlineClassSession[],
  code: string,
): OnlineClassSession | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  return sessions.find((session) => session.meetingCode.toUpperCase() === normalized);
}

export type ClassParticipant = {
  id: string;
  name: string;
  avatar: string;
  role: "host" | "student";
  audio: boolean;
  video: boolean;
  handRaised?: boolean;
  isYou?: boolean;
};

export function getMockParticipants(
  session: OnlineClassSession,
  options?: { youName?: string; muted?: boolean; videoOn?: boolean; handRaised?: boolean },
): ClassParticipant[] {
  const youName = options?.youName ?? "Alex Johnson";
  const youAvatar = youName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const extras = Math.max(0, Math.min(session.joinCount - 2, 10));
  const students: ClassParticipant[] = Array.from({ length: extras }, (_, index) => ({
    id: `student-${index}`,
    name: ["Jordan Lee", "Sam Rivera", "Priya Patel", "Chris Wong", "Emma Davis"][index % 5] ?? `Student ${index + 1}`,
    avatar: ["JL", "SR", "PP", "CW", "ED"][index % 5] ?? "ST",
    role: "student" as const,
    audio: index % 4 !== 0,
    video: index % 3 !== 0,
    handRaised: index === 1,
  }));

  return [
    {
      id: "host",
      name: session.teacherName,
      avatar: session.teacherAvatar,
      role: "host",
      audio: true,
      video: true,
    },
    {
      id: "you",
      name: youName,
      avatar: youAvatar,
      role: "student",
      audio: !options?.muted,
      video: options?.videoOn ?? true,
      handRaised: options?.handRaised,
      isYou: true,
    },
    ...students,
  ];
}
