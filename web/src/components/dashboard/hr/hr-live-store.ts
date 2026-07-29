"use client";

import { useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/shared/constants";

export type HrLiveConnection = "idle" | "connecting" | "connected" | "reconnecting" | "error";

type HrLiveState = {
  connection: HrLiveConnection;
  lastSyncedAt: string | null;
  lastInvalidatedAt: string | null;
};

let state: HrLiveState = {
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

function setState(patch: Partial<HrLiveState>) {
  state = { ...state, ...patch };
  emit();
}

function handleEvent(eventType: string) {
  const now = new Date().toISOString();

  if (eventType === "hr:sync") {
    setState({ connection: "connected", lastSyncedAt: now });
    onInvalidate?.();
    return;
  }

  if (eventType === "hr:invalidate") {
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

  const source = new EventSource(API_ENDPOINTS.HR_STREAM);
  eventSource = source;

  source.addEventListener("hr:sync", () => handleEvent("hr:sync"));
  source.addEventListener("hr:invalidate", () => handleEvent("hr:invalidate"));

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

export function connectHrLive(invalidate: () => void) {
  onInvalidate = invalidate;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  openStream();
}

export function disconnectHrLive() {
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

export function useHrLiveStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
