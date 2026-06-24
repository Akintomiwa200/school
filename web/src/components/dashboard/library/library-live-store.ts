"use client";

import { useSyncExternalStore } from "react";
import type { LibraryOrder } from "./library-data";
import { DEMO_ORDERS } from "./library-data";

export type LiveLibraryOrder = LibraryOrder & {
  paidAt: Date;
  gatewaySessionId?: string;
};

type LibraryShelfState = {
  ownedBookIds: string[];
  bookmarkedIds: string[];
  likedIds: string[];
  readingProgress: Record<string, number>;
  currentChapter: Record<string, string>;
};

let liveOrders: LiveLibraryOrder[] = DEMO_ORDERS.map((order) => ({
  ...order,
  paidAt: new Date(order.date),
}));

let shelfState: LibraryShelfState = {
  ownedBookIds: [],
  bookmarkedIds: ["pop-2", "ong-1"],
  likedIds: ["pop-1", "ong-3"],
  readingProgress: {
    "pop-1": 40,
    "ong-1": 62,
    "ong-3": 35,
    "ong-4": 44,
    "ong-2": 18,
  },
  currentChapter: {},
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getOrdersSnapshot() {
  return liveOrders;
}

function getShelfSnapshot() {
  return shelfState;
}

export function useLiveLibraryOrders() {
  return useSyncExternalStore(subscribe, getOrdersSnapshot, () => DEMO_ORDERS);
}

export function useLibraryShelf() {
  return useSyncExternalStore(subscribe, getShelfSnapshot, () => shelfState);
}

export function getLiveLibraryOrders() {
  return liveOrders;
}

export function getLibraryShelf() {
  return shelfState;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildReceiptId(date: Date) {
  const key = formatDateKey(date).replace(/-/g, "");
  const suffix = String(liveOrders.length + 1).padStart(3, "0");
  return `LIB-RCP-${key}-${suffix}`;
}

function buildOrderId(date: Date) {
  const key = formatDateKey(date).replace(/-/g, "");
  const suffix = String(liveOrders.length + 1).padStart(3, "0");
  return `ord-${key.slice(2)}-${suffix}`;
}

export function toggleBookmark(bookId: string) {
  const next = new Set(shelfState.bookmarkedIds);
  if (next.has(bookId)) next.delete(bookId);
  else next.add(bookId);
  shelfState = { ...shelfState, bookmarkedIds: [...next] };
  emit();
}

export function toggleLike(bookId: string) {
  const next = new Set(shelfState.likedIds);
  if (next.has(bookId)) next.delete(bookId);
  else next.add(bookId);
  shelfState = { ...shelfState, likedIds: [...next] };
  emit();
}

export function isBookOwned(bookId: string) {
  return shelfState.ownedBookIds.includes(bookId);
}

export function isBookmarked(bookId: string) {
  return shelfState.bookmarkedIds.includes(bookId);
}

export function isLiked(bookId: string) {
  return shelfState.likedIds.includes(bookId);
}

export function getReadingProgress(bookId: string) {
  return shelfState.readingProgress[bookId] ?? 0;
}

export function setReadingProgress(bookId: string, progress: number, chapterId?: string) {
  shelfState = {
    ...shelfState,
    readingProgress: {
      ...shelfState.readingProgress,
      [bookId]: Math.min(100, Math.max(0, progress)),
    },
    currentChapter: chapterId
      ? { ...shelfState.currentChapter, [bookId]: chapterId }
      : shelfState.currentChapter,
  };
  emit();
}

export function grantBookAccess(bookId: string) {
  if (shelfState.ownedBookIds.includes(bookId)) return;
  shelfState = {
    ...shelfState,
    ownedBookIds: [...shelfState.ownedBookIds, bookId],
  };
  emit();
}

export function addLiveLibraryOrder(input: {
  itemIds: string[];
  lines: LiveLibraryOrder["lines"];
  amount: number;
  method: LiveLibraryOrder["method"];
  cardLast4?: string;
  gatewaySessionId?: string;
}): LiveLibraryOrder {
  const paidAt = new Date();
  const order: LiveLibraryOrder = {
    id: buildOrderId(paidAt),
    lines: input.lines,
    amount: input.amount,
    method: input.method,
    status: "completed",
    date: formatDateKey(paidAt),
    receiptId: buildReceiptId(paidAt),
    cardLast4: input.cardLast4,
    gatewaySessionId: input.gatewaySessionId,
    paidAt,
  };

  liveOrders = [order, ...liveOrders];

  for (const line of input.lines) {
    if (line.bookId) grantBookAccess(line.bookId);
  }

  emit();
  return order;
}

export function getOrderByIdLive(orderId: string) {
  return liveOrders.find((order) => order.id === orderId);
}
