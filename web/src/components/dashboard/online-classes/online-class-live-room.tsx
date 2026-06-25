"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AppWindow,
  FileText,
  Hand,
  HelpCircle,
  Layout,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorUp,
  PhoneOff,
  Send,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useOnlineClassesBase } from "./online-classes-context";
import {
  classSessionHref,
  getMockParticipants,
  onlineClassesHref,
} from "./online-classes-data";
import {
  getChatFromStore,
  getSessionFromStore,
  joinClassSessionApi,
  sendClassChatApi,
  useOnlineClassesStore,
} from "./online-classes-live-store";
import { ClassStatusBadge, OnlineClassesPanel } from "./online-classes-ui";

type SidebarTab = "chat" | "people" | "materials" | "qa";
type PresentMode = "screen" | "window" | "tab";

const PRESENT_OPTIONS: { id: PresentMode; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "screen", label: "Your entire screen", description: "Everything on your screen is visible", icon: Monitor },
  { id: "window", label: "A window", description: "A specific app or window", icon: AppWindow },
  { id: "tab", label: "A tab", description: "A single browser tab", icon: Layout },
];

type ClassQuestion = {
  id: string;
  author: string;
  text: string;
  upvotes: number;
};

export function OnlineClassLiveRoom({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const basePath = useOnlineClassesBase();
  const { data: authSession } = useSession();
  const userName = authSession?.user?.name ?? "Alex Johnson";
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const { sessions } = useOnlineClassesStore();
  const session = getSessionFromStore(sessionId) ?? sessions.find((item) => item.id === sessionId);
  const chat = getChatFromStore(sessionId);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentMenuOpen, setPresentMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chat");
  const [questions, setQuestions] = useState<ClassQuestion[]>([
    { id: "q1", author: "Jordan Lee", text: "Can you explain anaphase again?", upvotes: 3 },
  ]);
  const [questionDraft, setQuestionDraft] = useState("");

  const participants = session
    ? getMockParticipants(session, { youName: userName, muted, videoOn, handRaised })
    : [];

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
        cameraStreamRef.current = media;
        if (localVideoRef.current) localVideoRef.current.srcObject = media;
      })
      .catch(() => {
        toast.message("Camera/mic unavailable — you can still follow along in chat.");
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && cameraStreamRef.current) {
      localVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isPresenting]);

  useEffect(() => {
    const stream = cameraStreamRef.current;
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, [muted]);

  useEffect(() => {
    const stream = cameraStreamRef.current;
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = videoOn;
    });
  }, [videoOn]);

  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isPresenting]);

  useEffect(() => {
    return () => {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!session) {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">Class not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={onlineClassesHref(undefined, basePath)}>Back</Link>
        </Button>
      </OnlineClassesPanel>
    );
  }

  if (session.status === "ended") {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">This class has ended</h2>
        <Button asChild className="mt-4 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href={onlineClassesHref(undefined, basePath)}>Back to online classes</Link>
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

  function handleAskQuestion(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = questionDraft.trim();
    if (!trimmed) return;
    setQuestions((prev) => [
      { id: `q-${Date.now()}`, author: userName, text: trimmed, upvotes: 0 },
      ...prev,
    ]);
    setQuestionDraft("");
    toast.success("Question posted for the teacher");
  }

  function leaveClass() {
    router.push(onlineClassesHref(undefined, basePath));
  }

  function stopPresenting() {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setIsPresenting(false);
    toast.message("You stopped presenting");
  }

  async function startPresenting(_mode: PresentMode) {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      track?.addEventListener("ended", () => stopPresenting());

      screenStreamRef.current = stream;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;

      setIsPresenting(true);
      setPresentMenuOpen(false);
      toast.message("You are presenting");
    } catch {
      // User cancelled the browser picker.
    }
  }

  const filmstripParticipants = participants.slice(0, 5);

  const sidebarTabs = [
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "people" as const, label: "People", icon: Users },
    { id: "materials" as const, label: "Materials", icon: FileText },
    { id: "qa" as const, label: "Q&A", icon: HelpCircle },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ClassStatusBadge status={session.status} />
            <span className="text-xs font-semibold text-muted-foreground">{session.meetingCode}</span>
            <Link
              href={classSessionHref(sessionId, basePath)}
              className="text-xs font-medium text-brand-purple hover:underline"
            >
              Class info
            </Link>
          </div>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl">{session.title}</h1>
          <p className="text-sm text-muted-foreground">{session.teacherName} · {session.subject}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {session.joinCount} in class
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <div className="min-w-0 space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#202124]">
            {isPresenting ? (
              <video
                ref={screenVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
                <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2">
                    <p className="truncate text-xs font-medium text-muted-foreground">{session.subject}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">Slide 3 of 12</p>
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple">Today&apos;s lesson</p>
                    <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{session.title}</h2>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{session.description}</p>
                  </div>
                </div>
              </div>
            )}

            {!isPresenting ? (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <MonitorUp className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{session.teacherName} is presenting</span>
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center gap-2 px-3 sm:bottom-16 sm:gap-3 sm:px-4">
              {filmstripParticipants.map((person) => (
                <div
                  key={person.id}
                  className={cn(
                    "relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-[#3c4043] shadow-lg sm:h-16 sm:w-28",
                    person.isYou ? "border-brand-blue" : "border-transparent",
                  )}
                >
                  {person.isYou && videoOn && isPresenting ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                        {person.avatar}
                      </div>
                      {!person.video ? <VideoOff className="h-3 w-3 text-white/70" /> : null}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                    <p className="truncate text-[10px] font-medium text-white">
                      {person.isYou ? "You" : person.name.split(" ")[0]}
                    </p>
                  </div>
                  {person.handRaised ? (
                    <Hand className="absolute right-1 top-1 h-3 w-3 text-brand-orange" />
                  ) : null}
                </div>
              ))}
            </div>

            {isPresenting ? (
              <div className="absolute bottom-3 right-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-[#3c4043]/95 px-4 py-2.5 text-white shadow-lg backdrop-blur-sm">
                <span className="text-sm font-medium">You are presenting</span>
                <button
                  type="button"
                  onClick={stopPresenting}
                  className="text-sm font-medium text-[#8ab4f8] hover:underline"
                >
                  Stop presenting
                </button>
              </div>
            ) : null}

            {!isPresenting ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                  "absolute bottom-4 right-4 z-10 h-24 w-36 overflow-hidden rounded-lg border-2 border-white/30 bg-black object-cover shadow-lg sm:h-28 sm:w-44",
                  !videoOn && "opacity-50",
                )}
              />
            ) : null}
          </div>

          <OnlineClassesPanel className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12"
              onClick={() => setMuted((value) => !value)}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12"
              onClick={() => setVideoOn((value) => !value)}
              title={videoOn ? "Stop video" : "Start video"}
            >
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Popover open={presentMenuOpen} onOpenChange={setPresentMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12",
                    isPresenting && "border-brand-blue bg-brand-blue/10 text-brand-blue",
                  )}
                  title="Present now"
                  disabled={isPresenting}
                >
                  <MonitorUp className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" side="top" className="w-[min(100vw-2rem,360px)] p-0">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Present now</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Choose what to share with the class
                  </p>
                </div>
                <ul className="p-2">
                  {PRESENT_OPTIONS.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => void startPresenting(option.id)}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <option.icon className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-11 shrink-0 gap-0 rounded-full px-0 sm:gap-2 sm:px-4",
                "w-11 sm:w-auto",
                handRaised && "border-brand-orange bg-brand-orange/10 text-brand-orange",
              )}
              onClick={() => setHandRaised((value) => !value)}
              title={handRaised ? "Lower hand" : "Raise hand"}
            >
              <Hand className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">
                {handRaised ? "Lower hand" : "Raise hand"}
              </span>
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 shrink-0 gap-0 rounded-full px-0 sm:gap-2 sm:px-4 w-11 sm:w-auto"
              onClick={leaveClass}
              title="Leave class"
            >
              <PhoneOff className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">Leave</span>
            </Button>
          </OnlineClassesPanel>
        </div>

        <OnlineClassesPanel className="flex min-h-[420px] flex-col p-0 lg:min-h-[min(620px,75vh)]">
          <div className="grid grid-cols-4 border-b border-border">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSidebarTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:text-xs",
                  sidebarTab === tab.id
                    ? "border-b-2 border-brand-purple text-brand-purple"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-hidden p-4">
            {sidebarTab === "chat" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto">
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
                <form onSubmit={handleSendChat} className="mt-3 flex gap-2 border-t border-border pt-3">
                  <Input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Message class…"
                    className="h-10 min-w-0 flex-1 rounded-full"
                  />
                  <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : null}

            {sidebarTab === "people" ? (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {participants.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {person.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {person.name}
                          {person.isYou ? " (You)" : ""}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">{person.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {person.handRaised ? <Hand className="h-3.5 w-3.5 text-brand-orange" /> : null}
                      {person.audio ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                      {person.video ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {sidebarTab === "materials" ? (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {session.materials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No materials attached to this class.</p>
                ) : (
                  session.materials.map((material) => (
                    <Link
                      key={material.id}
                      href={material.href}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm transition-colors hover:bg-muted/40"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      {material.label}
                    </Link>
                  ))
                )}
              </div>
            ) : null}

            {sidebarTab === "qa" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border px-3 py-2">
                      <p className="text-sm">{q.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {q.author} · {q.upvotes} upvotes
                      </p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAskQuestion} className="mt-3 flex gap-2 border-t border-border pt-3">
                  <Input
                    value={questionDraft}
                    onChange={(event) => setQuestionDraft(event.target.value)}
                    placeholder="Ask the teacher…"
                    className="h-10 min-w-0 flex-1 rounded-full"
                  />
                  <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : null}
          </div>
        </OnlineClassesPanel>
      </div>
    </div>
  );
}
