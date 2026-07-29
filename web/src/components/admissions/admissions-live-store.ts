"use client";

import { useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/shared/constants";

export type AdmissionsLiveConnection = "idle" | "connecting" | "connected" | "reconnecting" | "error";

type AdmissionsLiveState = {
  connection: AdmissionsLiveConnection;
  lastSyncedAt: string | null;
  lastInvalidatedAt: string | null;
  lastUpdatedAt: string | null;
};

let state: AdmissionsLiveState = {
  connection: "idle",
  lastSyncedAt: null,
  lastInvalidatedAt: null,
  lastUpdatedAt: null,
};

const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let reconnectTimer: number | null = null;
let onInvalidate: (() => void) | null = null;
let subscriberCount = 0;

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

function setState(patch: Partial<AdmissionsLiveState>) {
  state = { ...state, ...patch };
  emit();
}

function handlePayload(eventType: string, payload?: { updatedAt?: string }) {
  const now = new Date().toISOString();

  if (eventType === "admissions:sync") {
    setState({
      connection: "connected",
      lastSyncedAt: now,
      lastUpdatedAt: payload?.updatedAt ?? state.lastUpdatedAt,
    });
    onInvalidate?.();
    return;
  }

  if (eventType === "admissions:invalidate") {
    setState({
      connection: "connected",
      lastInvalidatedAt: now,
      lastSyncedAt: now,
      lastUpdatedAt: payload?.updatedAt ?? now,
    });
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

  const source = new EventSource(`${API_ENDPOINTS.ADMISSIONS}/stream`);
  eventSource = source;

  source.addEventListener("admissions:sync", (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data) as { updatedAt?: string };
      handlePayload("admissions:sync", payload);
    } catch {
      handlePayload("admissions:sync");
    }
  });

  source.addEventListener("admissions:invalidate", (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data) as { updatedAt?: string };
      handlePayload("admissions:invalidate", payload);
    } catch {
      handlePayload("admissions:invalidate");
    }
  });

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

export function connectAdmissionsLive(invalidate: () => void) {
  subscriberCount += 1;
  onInvalidate = invalidate;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (!eventSource) openStream();
}

export function disconnectAdmissionsLive() {
  subscriberCount = Math.max(0, subscriberCount - 1);
  if (subscriberCount > 0) return;

  onInvalidate = null;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  setState({
    connection: "idle",
    lastSyncedAt: null,
    lastInvalidatedAt: null,
    lastUpdatedAt: null,
  });
}

export function useAdmissionsLiveStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
