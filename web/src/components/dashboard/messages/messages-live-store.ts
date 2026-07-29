"use client";

import { useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/shared/constants";
import { apiPost } from "@/lib/api/client";
import type { ActiveCall, ChatMessage, ChatParticipant, Conversation } from "./messages-types";

type MessagesState = {
  currentUserId: string;
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  activeCall: ActiveCall | null;
  typingByConversation: Record<string, string[]>;
  hydrated: boolean;
};

let state: MessagesState = {
  currentUserId: "",
  conversations: [],
  messages: [],
  activeConversationId: null,
  activeCall: null,
  typingByConversation: {},
  hydrated: false,
};

const listeners = new Set<() => void>();
let refreshFn: (() => void) | null = null;

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

export function useMessagesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getMessagesState() {
  return state;
}

export function registerMessagesRefresh(fn: (() => void) | null) {
  refreshFn = fn;
}

export function hydrateMessagesFromApi(payload: {
  currentUserId: string;
  conversations: Conversation[];
  messages: ChatMessage[];
}) {
  const activeStillExists = payload.conversations.some((c) => c.id === state.activeConversationId);
  state = {
    ...state,
    currentUserId: payload.currentUserId,
    conversations: payload.conversations,
    messages: payload.messages,
    activeConversationId: activeStillExists
      ? state.activeConversationId
      : state.activeConversationId ?? payload.conversations[0]?.id ?? null,
    hydrated: true,
  };
  emit();
}

export function setActiveConversation(conversationId: string | null) {
  state = { ...state, activeConversationId: conversationId };
  if (conversationId) {
    state = {
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    };
  }
  emit();
}

function addMessage(message: ChatMessage) {
  const conversations = state.conversations.map((conversation) => {
    if (conversation.id !== message.conversationId) return conversation;
    return {
      ...conversation,
      lastMessage: message,
      unreadCount:
        message.senderId === state.currentUserId || conversation.id === state.activeConversationId
          ? conversation.unreadCount
          : conversation.unreadCount + 1,
    };
  });

  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  state = {
    ...state,
    conversations: sorted,
    messages: [...state.messages.filter((m) => m.id !== message.id), message],
  };
  emit();
}

function updateMessage(messageId: string, patch: Partial<ChatMessage>) {
  state = {
    ...state,
    messages: state.messages.map((message) =>
      message.id === messageId ? { ...message, ...patch } : message,
    ),
  };
  emit();
}

export async function sendTextMessage(conversationId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return;

  const conversation = state.conversations.find((c) => c.id === conversationId);
  const receiverId = conversation?.participants[0]?.id;
  if (!receiverId) return;

  const tempId = `msg-live-${Date.now()}`;
  const message: ChatMessage = {
    id: tempId,
    conversationId,
    senderId: state.currentUserId,
    kind: "text",
    content: trimmed,
    createdAt: new Date().toISOString(),
    status: "sending",
  };

  addMessage(message);

  try {
    await apiPost(API_ENDPOINTS.MESSAGES, { receiverId, content: trimmed });
    updateMessage(tempId, { status: "delivered" });
    refreshFn?.();
  } catch {
    updateMessage(tempId, { status: "sent" });
  }
}

export function sendAttachmentMessage(
  conversationId: string,
  attachment: NonNullable<ChatMessage["attachments"]>[number],
  caption = "",
) {
  const kind = attachment.fileType.startsWith("image/")
    ? "image"
    : attachment.fileType.startsWith("audio/")
      ? "audio"
      : attachment.fileType.startsWith("video/")
        ? "video"
        : "document";

  const id = `msg-live-${Date.now()}`;
  const message: ChatMessage = {
    id,
    conversationId,
    senderId: state.currentUserId,
    kind,
    content: caption || attachment.fileName,
    attachments: [attachment],
    createdAt: new Date().toISOString(),
    status: "delivered",
  };

  addMessage(message);
}

export function sendCallLog(
  conversationId: string,
  callType: ActiveCall["callType"],
  callStatus: ChatMessage["callStatus"],
  durationSec?: number,
) {
  const message: ChatMessage = {
    id: `msg-call-${Date.now()}`,
    conversationId,
    senderId: state.currentUserId,
    kind: "call",
    content: callType === "video" ? "Video call" : "Voice call",
    callType,
    callStatus,
    callDurationSec: durationSec,
    createdAt: new Date().toISOString(),
    status: "read",
  };
  addMessage(message);
}

export function setActiveCall(call: ActiveCall | null) {
  state = { ...state, activeCall: call };
  emit();
}

export function setTyping(conversationId: string, userId: string, isTyping: boolean) {
  const current = state.typingByConversation[conversationId] ?? [];
  const next = isTyping
    ? current.includes(userId)
      ? current
      : [...current, userId]
    : current.filter((id) => id !== userId);

  state = {
    ...state,
    typingByConversation: { ...state.typingByConversation, [conversationId]: next },
  };
  emit();
}

export function getConversationMessages(conversationId: string) {
  return state.messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getTotalUnreadCount() {
  return state.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
}

export function getCurrentUserId() {
  return state.currentUserId;
}

export function getParticipantById(id: string): ChatParticipant | undefined {
  for (const conversation of state.conversations) {
    const participant = conversation.participants.find((p) => p.id === id);
    if (participant) return participant;
  }
  return undefined;
}
