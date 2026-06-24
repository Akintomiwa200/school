"use client";

import { useSyncExternalStore } from "react";
import type { ClassChatMessage, OnlineClassSession } from "@/lib/online-classes/sessions-hub";

type ClassState = {
  sessions: OnlineClassSession[];
  chatBySession: Record<string, ClassChatMessage[]>;
  connection: "idle" | "connecting" | "connected" | "reconnecting" | "error";
};

let state: ClassState = {
  sessions: [],
  chatBySession: {},
  connection: "idle",
};

const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let reconnectTimer: number | null = null;
let connected = false;

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

function setState(patch: Partial<ClassState>) {
  state = { ...state, ...patch };
  emit();
}

function upsertSession(session: OnlineClassSession) {
  const existing = state.sessions.find((item) => item.id === session.id);
  const sessions = existing
    ? state.sessions.map((item) => (item.id === session.id ? session : item))
    : [...state.sessions, session];
  setState({ sessions });
}

function appendChat(message: ClassChatMessage) {
  const current = state.chatBySession[message.sessionId] ?? [];
  setState({
    chatBySession: {
      ...state.chatBySession,
      [message.sessionId]: [...current, message],
    },
  });
}

function handleEvent(eventType: string, raw: string) {
  try {
    const payload = JSON.parse(raw) as unknown;
    if (eventType === "sync") {
      const data = payload as { sessions: OnlineClassSession[] };
      setState({ sessions: data.sessions, connection: "connected" });
      return;
    }
    if (eventType === "session:update") {
      upsertSession(payload as OnlineClassSession);
      return;
    }
    if (eventType === "chat:message") {
      appendChat(payload as ClassChatMessage);
    }
  } catch {
    // ignore malformed payloads
  }
}

function scheduleReconnect() {
  if (reconnectTimer != null) return;
  setState({ connection: "reconnecting" });
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectOnlineClassesStream();
  }, 2500);
}

export function connectOnlineClassesStream() {
  if (typeof window === "undefined") return;
  if (connected && eventSource) return;

  eventSource?.close();
  setState({ connection: "connecting" });

  const source = new EventSource("/api/v1/online-classes/stream");
  eventSource = source;

  source.onopen = () => {
    connected = true;
    setState({ connection: "connected" });
  };

  source.onerror = () => {
    connected = false;
    source.close();
    if (eventSource === source) eventSource = null;
    scheduleReconnect();
  };

  for (const type of ["sync", "session:update", "chat:message"] as const) {
    source.addEventListener(type, (event) => {
      handleEvent(type, (event as MessageEvent<string>).data);
    });
  }
}

export function disconnectOnlineClassesStream() {
  connected = false;
  eventSource?.close();
  eventSource = null;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  setState({ connection: "idle" });
}

export function useOnlineClassesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getSessionFromStore(sessionId: string) {
  return state.sessions.find((item) => item.id === sessionId);
}

export function getChatFromStore(sessionId: string) {
  return state.chatBySession[sessionId] ?? [];
}

export async function joinClassSessionApi(sessionId: string) {
  const res = await fetch(`/api/v1/online-classes/${sessionId}/join`, { method: "POST" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? json.error ?? "Could not join class");
  upsertSession(json.data as OnlineClassSession);
  return json.data as OnlineClassSession;
}

export async function sendClassChatApi(sessionId: string, content: string) {
  const res = await fetch(`/api/v1/online-classes/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "chat", content }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? json.error ?? "Could not send message");
  appendChat(json.data as ClassChatMessage);
  return json.data as ClassChatMessage;
}

export async function startClassEarlyApi(sessionId: string) {
  const res = await fetch(`/api/v1/online-classes/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? json.error ?? "Could not start class");
  upsertSession(json.data as OnlineClassSession);
  return json.data as OnlineClassSession;
}

export function getClassStatsFromStore() {
  return {
    live: state.sessions.filter((item) => item.status === "live").length,
    upcoming: state.sessions.filter((item) => item.status === "scheduled").length,
    recordings: state.sessions.filter((item) => item.hasRecording || item.status === "ended").length,
  };
}
