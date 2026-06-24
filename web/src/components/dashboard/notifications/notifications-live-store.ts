"use client";

import { useSyncExternalStore } from "react";
import { NotificationType } from "@/shared";
import type { HubAnnouncement, HubNotification } from "@/lib/notifications/realtime-hub";

export type LiveAnnouncement = HubAnnouncement & { isRead?: boolean };

type RealtimeState = {
  notifications: HubNotification[];
  announcements: LiveAnnouncement[];
  connection: "idle" | "connecting" | "connected" | "reconnecting" | "error";
  lastSyncedAt: string | null;
};

let state: RealtimeState = {
  notifications: [],
  announcements: [],
  connection: "idle",
  lastSyncedAt: null,
};

const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let reconnectTimer: number | null = null;
let connectKey = "";

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function setState(patch: Partial<RealtimeState>) {
  state = { ...state, ...patch };
  emit();
}

function upsertNotification(item: HubNotification) {
  const existing = state.notifications.find((entry) => entry.id === item.id);
  const notifications = existing
    ? state.notifications.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
    : [item, ...state.notifications];
  setState({ notifications });
}

function removeNotification(id: string) {
  setState({ notifications: state.notifications.filter((entry) => entry.id !== id) });
}

function upsertAnnouncement(item: LiveAnnouncement) {
  const existing = state.announcements.find((entry) => entry.id === item.id);
  const announcements = existing
    ? state.announcements.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
    : [item, ...state.announcements];
  announcements.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  setState({ announcements });
}

function handleEvent(eventType: string, raw: string) {
  try {
    const payload = JSON.parse(raw) as unknown;

    if (eventType === "sync") {
      const data = payload as { notifications: HubNotification[]; announcements: LiveAnnouncement[] };
      setState({
        notifications: data.notifications,
        announcements: data.announcements,
        lastSyncedAt: new Date().toISOString(),
        connection: "connected",
      });
      return;
    }

    if (eventType === "notification:new" || eventType === "notification:update") {
      upsertNotification(payload as HubNotification);
      return;
    }

    if (eventType === "notification:remove") {
      const data = payload as { id: string };
      removeNotification(data.id);
      return;
    }

    if (eventType === "announcement:new" || eventType === "announcement:update") {
      upsertAnnouncement(payload as LiveAnnouncement);
    }
  } catch {
    // ignore malformed events
  }
}

function scheduleReconnect(userKey: string) {
  if (reconnectTimer != null) return;
  setState({ connection: "reconnecting" });
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectRealtime(userKey);
  }, 2500);
}

export function connectRealtime(userKey: string) {
  if (typeof window === "undefined") return;
  if (connectKey === userKey && eventSource && state.connection === "connected") return;

  connectKey = userKey;
  eventSource?.close();
  setState({ connection: "connecting" });

  const source = new EventSource("/api/v1/notifications/stream");
  eventSource = source;

  source.onopen = () => {
    setState({ connection: "connected" });
  };

  source.onerror = () => {
    source.close();
    if (eventSource === source) eventSource = null;
    scheduleReconnect(userKey);
  };

  const eventTypes = [
    "sync",
    "notification:new",
    "notification:update",
    "notification:remove",
    "announcement:new",
    "announcement:update",
  ];

  for (const type of eventTypes) {
    source.addEventListener(type, (event) => {
      handleEvent(type, (event as MessageEvent<string>).data);
    });
  }
}

export function disconnectRealtime() {
  eventSource?.close();
  eventSource = null;
  connectKey = "";
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  setState({ connection: "idle" });
}

export function useNotificationsStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getUnreadNotificationCount() {
  return state.notifications.filter((item) => !item.isRead).length;
}

export function getUnreadAnnouncementCount() {
  return state.announcements.filter((item) => !item.isRead).length;
}

export async function markNotificationReadApi(id: string) {
  upsertNotification({
    ...(state.notifications.find((entry) => entry.id === id) ?? {
      id,
      userId: "*",
      audience: "all",
      type: NotificationType.INFO,
      title: "",
      message: "",
      createdAt: new Date().toISOString(),
    }),
    isRead: true,
  });
  await fetch("/api/v1/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read", id }),
  });
}

export async function markAllNotificationsReadApi() {
  setState({
    notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
  });
  await fetch("/api/v1/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read-all" }),
  });
}

export async function clearNotificationsApi() {
  setState({ notifications: [] });
  await fetch("/api/v1/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "clear-all" }),
  });
}

export async function markAnnouncementReadApi(id: string) {
  upsertAnnouncement({
    ...(state.announcements.find((entry) => entry.id === id) ?? {
      id,
      title: "",
      body: "",
      authorId: "",
      authorName: "",
      authorRole: "STUDENT" as LiveAnnouncement["authorRole"],
      priority: "normal",
      pinned: false,
      audience: "all",
      createdAt: new Date().toISOString(),
      readBy: [],
    }),
    isRead: true,
  });
  await fetch("/api/v1/announcements", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read", id }),
  });
}

export async function publishAnnouncementApi(input: {
  title: string;
  body: string;
  priority?: "normal" | "important" | "urgent";
  pinned?: boolean;
}) {
  const response = await fetch("/api/v1/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message ?? json.error ?? "Could not publish announcement");
  }
  return json.data as { announcement: LiveAnnouncement; notification: HubNotification };
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getNotificationTone(type: NotificationType) {
  switch (type) {
    case NotificationType.SUCCESS:
      return "bg-green/15 text-green";
    case NotificationType.WARNING:
      return "bg-brand-orange/15 text-brand-orange";
    case NotificationType.ERROR:
      return "bg-destructive/15 text-destructive";
    case NotificationType.ANNOUNCEMENT:
      return "bg-brand-purple/15 text-brand-purple";
    case NotificationType.PAYMENT:
      return "bg-brand-blue/15 text-brand-blue";
    case NotificationType.MESSAGE:
      return "bg-primary/15 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}
