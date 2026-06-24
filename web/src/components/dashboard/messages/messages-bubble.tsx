"use client";

import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Phone,
  PhoneMissed,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./messages-types";
import {
  CURRENT_USER_ID,
  formatFileSize,
  formatMessageTime,
  getParticipantById,
  isAudioType,
  isImageType,
} from "./messages-data";

type MessageBubbleProps = {
  message: ChatMessage;
  showAvatar?: boolean;
};

export function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  const isMine = message.senderId === CURRENT_USER_ID;
  const sender = getParticipantById(message.senderId);

  if (message.kind === "call") {
    const missed = message.callStatus === "missed" || message.callStatus === "declined";
    const Icon = message.callType === "video" ? Video : missed ? PhoneMissed : Phone;
    return (
      <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "flex max-w-[85%] items-center gap-2 rounded-2xl px-4 py-2.5 text-sm",
            isMine ? "bg-brand-blue/15 text-brand-blue" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>
            {message.callType === "video" ? "Video call" : "Voice call"}
            {message.callDurationSec
              ? ` · ${Math.floor(message.callDurationSec / 60)}:${String(message.callDurationSec % 60).padStart(2, "0")}`
              : missed
                ? " · Missed"
                : ""}
          </span>
          <span className="text-xs opacity-70">{formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && showAvatar ? (
        <div
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
            sender?.accent ?? "from-muted-foreground to-muted",
          )}
        >
          {sender?.avatar ?? "?"}
        </div>
      ) : !isMine ? (
        <div className="w-8 shrink-0" />
      ) : null}

      <div className={cn("max-w-[min(85%,420px)]", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl px-3.5 py-2.5 shadow-sm",
            isMine
              ? "rounded-br-md bg-brand-blue text-white"
              : "rounded-bl-md bg-card border border-border text-foreground",
          )}
        >
          {message.attachments?.map((attachment) => {
            if (isImageType(attachment.fileType)) {
              return (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="mb-2 max-h-64 w-full rounded-xl object-cover"
                  />
                </a>
              );
            }

            if (isAudioType(attachment.fileType)) {
              return (
                <audio
                  key={attachment.id}
                  controls
                  src={attachment.url === "#" ? undefined : attachment.url}
                  className="mb-2 w-full max-w-xs"
                />
              );
            }

            return (
              <a
                key={attachment.id}
                href={attachment.url === "#" ? undefined : attachment.url}
                download={attachment.fileName}
                className={cn(
                  "mb-2 flex items-center gap-3 rounded-xl p-3 transition-colors",
                  isMine ? "bg-white/15 hover:bg-white/20" : "bg-muted/60 hover:bg-muted",
                )}
              >
                <FileText className="h-8 w-8 shrink-0 opacity-80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 opacity-70" />
              </a>
            );
          })}

          {message.content && message.kind !== "audio" ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1 px-1 text-[11px] text-muted-foreground",
            isMine && "justify-end",
          )}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isMine ? (
            message.status === "read" ? (
              <CheckCheck className="h-3.5 w-3.5 text-brand-blue" />
            ) : message.status === "delivered" ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : message.status === "sent" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="opacity-60">…</span>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
