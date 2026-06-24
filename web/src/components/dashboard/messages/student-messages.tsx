"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Pin,
  Search,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./messages-bubble";
import { MessagesCallOverlay } from "./messages-call-overlay";
import { MessagesComposeBar } from "./messages-compose-bar";
import { formatMessageTime } from "./messages-data";
import type { CallType, Conversation } from "./messages-types";
import {
  setActiveCall,
  setActiveConversation,
  useMessagesStore,
} from "./messages-live-store";
import { createCallSession } from "./messages-webrtc";

type StudentMessagesProps = {
  basePath?: string;
};

export function StudentMessages({ basePath = "/shared/messages" }: StudentMessagesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatParam = searchParams.get("chat");
  const { conversations, activeConversationId, activeCall, typingByConversation, messages: allMessages } =
    useMessagesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return allMessages
      .filter((message) => message.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [activeConversationId, allMessages]);

  useEffect(() => {
    if (chatParam) {
      setActiveConversation(chatParam);
    }
  }, [chatParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConversationId]);

  const openChat = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.replace(`${basePath}?chat=${conversationId}`, { scroll: false });
  };

  const closeChatMobile = () => {
    setActiveConversation(null);
    router.replace(basePath, { scroll: false });
  };

  const startCall = async (callType: CallType) => {
    if (!activeConversation) return;
    const participant = activeConversation.participants[0];
    if (!participant) return;

    try {
      const session = await createCallSession(activeConversation.id, callType);
      setActiveCall({
        callId: session.callId,
        conversationId: activeConversation.id,
        callType,
        isInitiator: session.isInitiator,
        remoteParticipant: participant,
        status: "connecting",
      });
    } catch {
      setActiveCall({
        callId: `demo-${Date.now()}`,
        conversationId: activeConversation.id,
        callType,
        isInitiator: true,
        remoteParticipant: participant,
        status: "connecting",
      });
    }
  };

  const showThreadOnMobile = Boolean(activeConversationId);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] overflow-hidden rounded-[24px] border border-border bg-card shadow-float">
      <aside
        className={cn(
          "flex w-full flex-col border-r border-border bg-sidebar md:w-[340px] lg:w-[380px]",
          showThreadOnMobile ? "hidden md:flex" : "flex",
        )}
      >
        <MessagesInboxHeader />
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeConversationId}
              onSelect={() => openChat(conversation.id)}
            />
          ))}
        </div>
      </aside>

      <section
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-[#efeae2]/40 dark:bg-background/60",
          !showThreadOnMobile ? "hidden md:flex" : "flex",
        )}
      >
        {activeConversation ? (
          <>
            <ThreadHeader
              conversation={activeConversation}
              onBack={closeChatMobile}
              onVoiceCall={() => void startCall("voice")}
              onVideoCall={() => void startCall("video")}
            />
            <div
              className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            >
              {messages.map((message, index) => {
                const prev = messages[index - 1];
                const showAvatar =
                  message.senderId !== prev?.senderId ||
                  new Date(message.createdAt).getTime() - new Date(prev?.createdAt ?? 0).getTime() >
                    5 * 60 * 1000;
                return <MessageBubble key={message.id} message={message} showAvatar={showAvatar} />;
              })}
              {(typingByConversation[activeConversation.id]?.length ?? 0) > 0 ? (
                <p className="text-xs text-muted-foreground">typing…</p>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
            <MessagesComposeBar conversationId={activeConversation.id} />
          </>
        ) : (
          <EmptyThreadState />
        )}
      </section>

      {activeCall ? <MessagesCallOverlay call={activeCall} /> : null}
    </div>
  );
}

function MessagesInboxHeader() {
  return (
    <div className="border-b border-sidebar-border px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-sidebar-foreground">Chats</h1>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Search chats">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      <label className="relative mt-3 block">
        <span className="sr-only">Search messages</span>
        <input
          type="search"
          placeholder="Search or start new chat"
          className="h-10 w-full rounded-full border border-sidebar-border bg-sidebar-accent px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </label>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const last = conversation.lastMessage;
  const preview =
    last?.kind === "image"
      ? "📷 Photo"
      : last?.kind === "document"
        ? "📎 Document"
        : last?.kind === "audio"
          ? "🎤 Voice message"
          : last?.kind === "call"
            ? last.callType === "video"
              ? "📹 Video call"
              : "📞 Voice call"
            : (last?.content ?? "No messages yet");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border/50 px-4 py-3.5 text-left transition-colors hover:bg-sidebar-accent/60",
        active && "bg-sidebar-accent/80",
      )}
    >
      <div
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
          conversation.accent,
        )}
      >
        {conversation.avatar}
        {conversation.participants[0]?.online ? (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar bg-green" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-sidebar-foreground">{conversation.title}</p>
          {conversation.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{preview}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {last ? (
          <span className="text-[11px] text-muted-foreground">{formatMessageTime(last.createdAt)}</span>
        ) : null}
        {conversation.unreadCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-semibold text-white">
            {conversation.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function ThreadHeader({
  conversation,
  onBack,
  onVoiceCall,
  onVideoCall,
}: {
  conversation: Conversation;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}) {
  const participant = conversation.participants[0];
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-3 sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full md:hidden"
        onClick={onBack}
        aria-label="Back to chats"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
          conversation.accent,
        )}
      >
        {conversation.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{conversation.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {participant?.online ? "online" : participant?.lastSeen ?? conversation.subtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onVoiceCall}
          aria-label="Voice call"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onVideoCall}
          aria-label="Video call"
        >
          <Video className="h-5 w-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="More">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function EmptyThreadState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue/10 text-3xl">
        💬
      </div>
      <h2 className="text-lg font-semibold">Schooli Messages</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Send messages, share documents, photos, and voice notes. Start voice or video calls with
        WebRTC — just like WhatsApp.
      </p>
    </div>
  );
}
