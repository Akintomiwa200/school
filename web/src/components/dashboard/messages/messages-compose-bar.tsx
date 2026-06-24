"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Mic, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadMessageFile } from "./messages-webrtc";
import { sendAttachmentMessage, sendTextMessage } from "./messages-live-store";

type MessagesComposeBarProps = {
  conversationId: string;
  disabled?: boolean;
};

export function MessagesComposeBar({ conversationId, disabled }: MessagesComposeBarProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const send = () => {
    if (!text.trim() || disabled) return;
    sendTextMessage(conversationId, text);
    setText("");
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    const file = files[0];
    if (file.type.startsWith("image/")) {
      setPreview({ file, url: URL.createObjectURL(file) });
      return;
    }
    await uploadAndSend(file);
  };

  const uploadAndSend = async (file: File, caption = "") => {
    setUploading(true);
    try {
      const attachment = await uploadMessageFile(file);
      sendAttachmentMessage(conversationId, attachment, caption || file.name);
      setPreview(null);
    } catch {
      const localUrl = URL.createObjectURL(file);
      sendAttachmentMessage(
        conversationId,
        {
          id: `local-${Date.now()}`,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          url: localUrl,
        },
        caption || file.name,
      );
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    if (disabled || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
        await uploadAndSend(file, "Voice message");
        setRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  return (
    <div className="border-t border-border bg-card px-3 py-3 sm:px-4">
      {preview ? (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.url} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a caption…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-brand-blue hover:bg-brand-blue/90"
            disabled={uploading}
            onClick={() => void uploadAndSend(preview.file, text)}
          >
            Send
          </Button>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.click();
            }
          }}
          disabled={disabled || uploading}
          aria-label="Attach image"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type a message"
            disabled={disabled || uploading}
            className="max-h-32 min-h-[44px] w-full resize-none rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        {text.trim() ? (
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full bg-brand-blue hover:bg-brand-blue/90"
            onClick={send}
            disabled={disabled || uploading}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className={cn(
              "shrink-0 rounded-full",
              recording ? "bg-destructive hover:bg-destructive/90" : "bg-brand-blue hover:bg-brand-blue/90",
            )}
            onMouseDown={() => void startRecording()}
            onMouseUp={stopRecording}
            onTouchStart={() => void startRecording()}
            onTouchEnd={stopRecording}
            disabled={disabled || uploading}
            aria-label={recording ? "Recording voice note" : "Hold to record voice note"}
          >
            {recording ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
          </Button>
        )}
      </div>

      <p className="mt-2 hidden text-[11px] text-muted-foreground sm:block">
        Share images, PDFs, Office docs, videos, and voice notes. Hold mic to record.
      </p>
    </div>
  );
}
