"use client";

import { useSyncExternalStore } from "react";
import type { ActiveCall, ChatMessage, Conversation } from "./messages-types";
import {
  CURRENT_USER_ID,
  getSeedConversations,
  getSeedMessages,
} from "./messages-data";

type MessagesState = {
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  activeCall: ActiveCall | null;
  typingByConversation: Record<string, string[]>;
};

let state: MessagesState = {
  conversations: getSeedConversations(),
  messages: getSeedMessages(),
  activeConversationId: getSeedConversations()[0]?.id ?? null,
  activeCall: null,
  typingByConversation: {},
};

const listeners = new Set<() => void>();

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

export function addMessage(message: ChatMessage) {
  const conversations = state.conversations.map((conversation) => {
    if (conversation.id !== message.conversationId) return conversation;
    return {
      ...conversation,
      lastMessage: message,
      unreadCount:
        message.senderId === CURRENT_USER_ID || conversation.id === state.activeConversationId
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
    messages: [...state.messages, message],
  };
  emit();
}

export function updateMessage(messageId: string, patch: Partial<ChatMessage>) {
  state = {
    ...state,
    messages: state.messages.map((message) =>
      message.id === messageId ? { ...message, ...patch } : message,
    ),
  };
  emit();
}

export function sendTextMessage(conversationId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return;

  const id = `msg-live-${Date.now()}`;
  const message: ChatMessage = {
    id,
    conversationId,
    senderId: CURRENT_USER_ID,
    kind: "text",
    content: trimmed,
    createdAt: new Date().toISOString(),
    status: "sending",
  };

  addMessage(message);

  window.setTimeout(() => {
    updateMessage(id, { status: "sent" });
    window.setTimeout(() => updateMessage(id, { status: "delivered" }), 600);
  }, 400);
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
    senderId: CURRENT_USER_ID,
    kind,
    content: caption || attachment.fileName,
    attachments: [attachment],
    createdAt: new Date().toISOString(),
    status: "sending",
  };

  addMessage(message);
  window.setTimeout(() => updateMessage(id, { status: "delivered" }), 800);
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
    senderId: CURRENT_USER_ID,
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
