"use client";

import { useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/shared/constants";

export type TeacherLiveConnection = "idle" | "connecting" | "connected" | "reconnecting" | "error";

type TeacherLiveState = {
  connection: TeacherLiveConnection;
  lastSyncedAt: string | null;
  lastInvalidatedAt: string | null;
};

let state: TeacherLiveState = {
  connection: "idle",
  lastSyncedAt: null,
  lastInvalidatedAt: null,
};

const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let reconnectTimer: number | null = null;
let onInvalidate: (() => void) | null = null;

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

function setState(patch: Partial<TeacherLiveState>) {
  state = { ...state, ...patch };
  emit();
}

function handleEvent(eventType: string) {
  const now = new Date().toISOString();

  if (eventType === "teacher:sync") {
    setState({ connection: "connected", lastSyncedAt: now });
    onInvalidate?.();
    return;
  }

  if (eventType === "teacher:invalidate") {
    setState({ lastInvalidatedAt: now, lastSyncedAt: now });
    onInvalidate?.();
  }
}

function scheduleReconnect() {
  if (reconnectTimer != null) return;
  setState({ connection: "reconnecting" });
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    openStream();
  }, 4_000);
}

function openStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  setState({ connection: "connecting" });

  const source = new EventSource(API_ENDPOINTS.TEACHER_STREAM);
  eventSource = source;

  source.addEventListener("teacher:sync", () => handleEvent("teacher:sync"));
  source.addEventListener("teacher:invalidate", () => handleEvent("teacher:invalidate"));

  source.onopen = () => {
    setState({ connection: "connected" });
  };

  source.onerror = () => {
    source.close();
    eventSource = null;
    setState({ connection: "error" });
    scheduleReconnect();
  };
}

export function connectTeacherLive(invalidate: () => void) {
  onInvalidate = invalidate;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  openStream();
}

export function disconnectTeacherLive() {
  onInvalidate = null;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  setState({ connection: "idle", lastSyncedAt: null, lastInvalidatedAt: null });
}

export function useTeacherLiveStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
