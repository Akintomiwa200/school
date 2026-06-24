"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { onlineClassesHref } from "./online-classes-data";
import {
  getChatFromStore,
  getSessionFromStore,
  joinClassSessionApi,
  sendClassChatApi,
  useOnlineClassesStore,
} from "./online-classes-live-store";
import { ClassStatusBadge, OnlineClassesPanel } from "./online-classes-ui";

export function OnlineClassLiveRoom({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { sessions } = useOnlineClassesStore();
  const session = getSessionFromStore(sessionId) ?? sessions.find((item) => item.id === sessionId);
  const chat = getChatFromStore(sessionId);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!session || joined) return;
    void joinClassSessionApi(sessionId)
      .then(() => setJoined(true))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not join"));
  }, [joined, session, sessionId]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    void navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((media) => {
        stream = media;
        if (localVideoRef.current) localVideoRef.current.srcObject = media;
      })
      .catch(() => {
        toast.message("Camera/mic unavailable — you can still follow along in chat.");
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const stream = localVideoRef.current?.srcObject as MediaStream | null;
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, [muted]);

  useEffect(() => {
    const stream = localVideoRef.current?.srcObject as MediaStream | null;
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = videoOn;
    });
  }, [videoOn]);

  if (!session) {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">Class not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={onlineClassesHref()}>Back</Link>
        </Button>
      </OnlineClassesPanel>
    );
  }

  if (session.status === "ended") {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">This class has ended</h2>
        <Button asChild className="mt-4 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href={onlineClassesHref()}>Back to online classes</Link>
        </Button>
      </OnlineClassesPanel>
    );
  }

  async function handleSendChat(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    try {
      await sendClassChatApi(sessionId, trimmed);
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send message");
    }
  }

  function leaveClass() {
    router.push(onlineClassesHref());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClassStatusBadge status={session.status} />
            <span className="text-xs font-semibold text-muted-foreground">{session.meetingCode}</span>
          </div>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl">{session.title}</h1>
          <p className="text-sm text-muted-foreground">{session.teacherName}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {session.joinCount} in class
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[20px] bg-surface-indigo aspect-video">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/30 via-primary/20 to-brand-blue/30">
              <div className="text-center text-white">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                  {session.teacherAvatar}
                </div>
                <p className="mt-3 text-lg font-semibold">{session.teacherName}</p>
                <p className="text-sm text-white/80">Teacher stream</p>
              </div>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "absolute bottom-4 right-4 h-28 w-40 overflow-hidden rounded-xl border-2 border-white/40 bg-black object-cover shadow-lg",
                !videoOn && "opacity-40",
              )}
            />
          </div>

          <OnlineClassesPanel className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setVideoOn((value) => !value)}
            >
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn("rounded-full", handRaised && "border-brand-orange bg-brand-orange/10 text-brand-orange")}
              onClick={() => setHandRaised((value) => !value)}
            >
              <Hand className="mr-2 h-4 w-4" />
              {handRaised ? "Hand raised" : "Raise hand"}
            </Button>
            <Button type="button" variant="destructive" className="rounded-full" onClick={leaveClass}>
              <PhoneOff className="mr-2 h-4 w-4" />
              Leave
            </Button>
          </OnlineClassesPanel>
        </div>

        <OnlineClassesPanel className="flex h-[min(560px,70vh)] flex-col">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Class chat</h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto py-4">
            {chat.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
            ) : (
              chat.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {item.authorAvatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{item.authorName}</p>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-border pt-3">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message class…"
              className="rounded-full"
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </OnlineClassesPanel>
      </div>
    </div>
  );
}
