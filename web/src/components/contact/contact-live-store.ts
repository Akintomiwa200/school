"use client";

import { useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/shared/constants";

export type ContactLiveConnection = "idle" | "connecting" | "connected" | "reconnecting" | "error";

type ContactLiveState = {
  connection: ContactLiveConnection;
  lastSyncedAt: string | null;
  lastInvalidatedAt: string | null;
  lastUpdatedAt: string | null;
};

let state: ContactLiveState = {
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

function setState(patch: Partial<ContactLiveState>) {
  state = { ...state, ...patch };
  emit();
}

function handlePayload(eventType: string, payload?: { updatedAt?: string }) {
  const now = new Date().toISOString();
  if (eventType === "contact:sync") {
    setState({ connection: "connected", lastSyncedAt: now, lastUpdatedAt: payload?.updatedAt ?? state.lastUpdatedAt });
    onInvalidate?.();
    return;
  }
  if (eventType === "contact:invalidate") {
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
  const source = new EventSource(`${API_ENDPOINTS.CONTACT}/stream`);
  eventSource = source;

  source.addEventListener("contact:sync", (event) => {
    try {
      handlePayload("contact:sync", JSON.parse((event as MessageEvent).data));
    } catch {
      handlePayload("contact:sync");
    }
  });

  source.addEventListener("contact:invalidate", (event) => {
    try {
      handlePayload("contact:invalidate", JSON.parse((event as MessageEvent).data));
    } catch {
      handlePayload("contact:invalidate");
    }
  });

  source.onopen = () => setState({ connection: "connected" });
  source.onerror = () => {
    source.close();
    eventSource = null;
    setState({ connection: "error" });
    scheduleReconnect();
  };
}

export function connectContactLive(invalidate: () => void) {
  subscriberCount += 1;
  onInvalidate = invalidate;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (!eventSource) openStream();
}

export function disconnectContactLive() {
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
  setState({ connection: "idle", lastSyncedAt: null, lastInvalidatedAt: null, lastUpdatedAt: null });
}

export function useContactLiveStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
