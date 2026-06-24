"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActiveCall } from "./messages-types";
import { WebRTCCallSession } from "./messages-webrtc";
import {
  sendCallLog,
  setActiveCall,
} from "./messages-live-store";

type MessagesCallOverlayProps = {
  call: ActiveCall;
};

export function MessagesCallOverlay({ call }: MessagesCallOverlayProps) {
  const sessionRef = useRef<WebRTCCallSession | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(call.callType === "video");
  const [connectionState, setConnectionState] = useState<string>("connecting");
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const session = new WebRTCCallSession(call.callId, call.isInitiator, call.callType, {
      onRemoteStream: (stream) => {
        if (call.callType === "video" && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
          setActiveCall({ ...call, status: "active", startedAt: startTimeRef.current });
        }
        setConnectionState("connected");
      },
      onStateChange: (state) => {
        if (state === "connected") setConnectionState("connected");
        if (state === "connecting") setConnectionState("connecting");
      },
      onError: () => setConnectionState("failed"),
    });

    sessionRef.current = session;

    void (async () => {
      try {
        await session.start();
        if (cancelled) return;
        const local = session.getLocalStream();
        if (local && localVideoRef.current) {
          localVideoRef.current.srcObject = local;
        }
        if (!call.isInitiator) {
          setConnectionState("ringing");
        }
      } catch {
        setConnectionState("failed");
      }
    })();

    const timer = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      void session.hangup(false);
      sessionRef.current = null;
    };
  }, [call.callId, call.callType, call.isInitiator]);

  const endCall = async () => {
    const duration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : undefined;
    await sessionRef.current?.hangup();
    sendCallLog(
      call.conversationId,
      call.callType,
      duration ? "ended" : "declined",
      duration,
    );
    setActiveCall(null);
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0d3a]/95 text-white backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-lg font-semibold">{call.remoteParticipant.name}</p>
          <p className="text-sm text-white/70">
            {connectionState === "connected"
              ? formatElapsed(elapsed)
              : connectionState === "ringing"
                ? "Ringing…"
                : "Connecting via WebRTC…"}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold",
            call.remoteParticipant.accent,
          )}
        >
          {call.remoteParticipant.avatar}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        {call.callType === "video" ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full max-h-[70vh] w-full max-w-3xl rounded-3xl bg-black/40 object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-6 right-6 h-36 w-28 rounded-2xl border-2 border-white/20 bg-black/60 object-cover shadow-2xl sm:h-44 sm:w-32"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold shadow-2xl",
                call.remoteParticipant.accent,
              )}
            >
              {call.remoteParticipant.avatar}
            </div>
            <p className="text-sm text-white/70">End-to-end WebRTC voice call</p>
            <audio ref={remoteAudioRef} autoPlay playsInline className="sr-only" />
          </div>
        )}

        {connectionState === "failed" ? (
          <p className="absolute bottom-24 text-sm text-red-300">
            Could not connect. Check camera/mic permissions and try again.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-4 px-6 pb-10 pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-white/20 bg-white/10 p-0 text-white hover:bg-white/20"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            sessionRef.current?.toggleMute(next);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {call.callType === "video" ? (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-white/20 bg-white/10 p-0 text-white hover:bg-white/20"
            onClick={() => {
              const next = !videoOn;
              setVideoOn(next);
              sessionRef.current?.toggleVideo(next);
            }}
            aria-label={videoOn ? "Turn off camera" : "Turn on camera"}
          >
            {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-white/20 bg-white/10 p-0 text-white hover:bg-white/20"
            aria-label="Voice call"
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}

        <Button
          type="button"
          className="h-14 w-14 rounded-full bg-destructive p-0 text-white hover:bg-destructive/90"
          onClick={() => void endCall()}
          aria-label="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
