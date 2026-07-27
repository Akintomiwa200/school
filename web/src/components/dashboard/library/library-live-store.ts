"use client";

import { useSyncExternalStore } from "react";

export type LiveLibraryOrderLine = {
  itemId: string;
  title: string;
  amount: number;
  format: "physical" | "digital" | "bundle";
  bookId?: string;
};

export type LiveLibraryOrder = {
  id: string;
  lines: LiveLibraryOrderLine[];
  amount: number;
  method: "card" | "bank";
  status: "completed" | "processing" | "cancelled";
  date: string;
  receiptId: string;
  cardLast4?: string;
  gatewaySessionId?: string;
  paidAt: Date;
};

type LibraryShelfState = {
  ownedBookIds: string[];
  bookmarkedIds: string[];
  likedIds: string[];
  readingProgress: Record<string, number>;
  currentChapter: Record<string, string>;
};

let liveOrders: LiveLibraryOrder[] = [];

let shelfState: LibraryShelfState = {
  ownedBookIds: [],
  bookmarkedIds: [],
  likedIds: [],
  readingProgress: {},
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
  return useSyncExternalStore(subscribe, getOrdersSnapshot, () => []);
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
