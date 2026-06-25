"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, ChevronRight, Hash, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { OnlineClassesProvider } from "./online-classes-context";
import { StudentOnlineClassesShell } from "./student-online-classes-shell";
import { OnlineClassesSessionList, OnlineClassesStats } from "./shared-online-classes";
import {
  STUDENT_ONLINE_CLASSES_BASE,
  classLiveHref,
  classSessionHref,
  classWaitingHref,
  findSessionByMeetingCode,
  studentOnlineClassesHref,
} from "./online-classes-data";
import { useOnlineClassesStore } from "./online-classes-live-store";
import { OnlineClassesPanel, ClassActionLink } from "./online-classes-ui";

type StudentView = "overview" | "live" | "upcoming" | "recordings";

function JoinByCodePanel({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const { sessions } = useOnlineClassesStore();
  const [code, setCode] = useState("");

  function handleJoin(event: React.FormEvent) {
    event.preventDefault();
    const session = findSessionByMeetingCode(sessions, code);
    if (!session) {
      toast.error("No class found with that meeting code.");
      return;
    }
    if (session.status === "live") {
      router.push(classLiveHref(session.id, STUDENT_ONLINE_CLASSES_BASE));
      return;
    }
    if (session.status === "scheduled") {
      router.push(classWaitingHref(session.id, STUDENT_ONLINE_CLASSES_BASE));
      return;
    }
    router.push(classSessionHref(session.id, STUDENT_ONLINE_CLASSES_BASE));
  }

  return (
    <OnlineClassesPanel id="join-code" className={large ? "mx-auto max-w-xl scroll-mt-6 space-y-5" : "scroll-mt-6 space-y-4"}>
      <div className="space-y-1">
        <h2 className="text-base font-bold">Join with meeting code</h2>
        <p className="text-sm text-muted-foreground">
          Enter the code from your teacher — like Google Meet or Zoom.
        </p>
      </div>
      <form onSubmit={handleJoin} className="space-y-3">
        <div className="relative">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="e.g. BIO-4821"
            className="h-11 w-full rounded-full pl-9 uppercase"
          />
        </div>
        <Button type="submit" className="h-11 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          Join class
        </Button>
      </form>
    </OnlineClassesPanel>
  );
}

function StudentOnlineClassesOverview() {
  const isLoading = usePageLoading();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <div className="space-y-5">
      <OnlineClassesStats />
      <JoinByCodePanel />
      <OnlineClassesSessionList fixedTab="live" hideTabBar title="Happening now" />
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
        <OnlineClassesPanel className="flex h-full flex-col">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold">Upcoming this week</h2>
            <p className="mt-1 text-sm text-muted-foreground">Scheduled sessions from your teachers.</p>
          </div>
          <ClassActionLink href={studentOnlineClassesHref("upcoming")} variant="outline" className="mt-4">
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>View upcoming</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </ClassActionLink>
        </OnlineClassesPanel>
        <OnlineClassesPanel className="flex h-full flex-col">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold">Past recordings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Replay classes you missed.</p>
          </div>
          <ClassActionLink href={studentOnlineClassesHref("recordings")} variant="outline" className="mt-4">
            <PlayCircle className="h-4 w-4 shrink-0" />
            <span>Browse recordings</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </ClassActionLink>
        </OnlineClassesPanel>
      </div>
    </div>
  );
}

export function StudentOnlineClasses({ view = "overview" }: { view?: StudentView }) {
  return (
    <OnlineClassesProvider basePath={STUDENT_ONLINE_CLASSES_BASE}>
      <StudentOnlineClassesShell activeSegment={view}>
        {view === "overview" ? <StudentOnlineClassesOverview /> : null}
        {view === "live" ? <OnlineClassesSessionList fixedTab="live" hideTabBar title="Live now" /> : null}
        {view === "upcoming" ? <OnlineClassesSessionList fixedTab="upcoming" hideTabBar title="Upcoming" /> : null}
        {view === "recordings" ? <OnlineClassesSessionList fixedTab="recordings" hideTabBar title="Recordings" /> : null}
      </StudentOnlineClassesShell>
    </OnlineClassesProvider>
  );
}

export function StudentOnlineClassesLayout({
  children,
  standalone = false,
}: {
  children: React.ReactNode;
  standalone?: boolean;
}) {
  return (
    <OnlineClassesProvider basePath={STUDENT_ONLINE_CLASSES_BASE}>
      <StudentOnlineClassesShell standalone={standalone}>{children}</StudentOnlineClassesShell>
    </OnlineClassesProvider>
  );
}
