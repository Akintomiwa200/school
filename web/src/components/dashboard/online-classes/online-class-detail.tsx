"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, FileText, PlayCircle, Users, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { canHostOnlineClasses } from "@/lib/online-classes/class-constants";
import {
  canJoinSession,
  classLiveHref,
  classRecordingHref,
  formatClassDuration,
  formatClassTimeRange,
  onlineClassesHref,
} from "./online-classes-data";
import {
  getSessionFromStore,
  joinClassSessionApi,
  startClassEarlyApi,
  useOnlineClassesStore,
} from "./online-classes-live-store";
import { ClassStatusBadge, OnlineClassesPanel } from "./online-classes-ui";

function DetailSkeleton() {
  return <div className="h-72 animate-pulse rounded-[20px] bg-muted" />;
}

export function OnlineClassDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const isLoading = usePageLoading();
  const { data: sessionAuth } = useSession();
  const role = (sessionAuth?.user?.role as UserRole) ?? UserRole.STUDENT;
  const canHost = canHostOnlineClasses(role);
  const { sessions } = useOnlineClassesStore();
  const session = getSessionFromStore(sessionId) ?? sessions.find((item) => item.id === sessionId);
  const [joining, setJoining] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (!session) {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">Class not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={onlineClassesHref()}>Back to online classes</Link>
        </Button>
      </OnlineClassesPanel>
    );
  }

  async function handleJoin() {
    setJoining(true);
    try {
      await joinClassSessionApi(sessionId);
      router.push(classLiveHref(sessionId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not join");
    } finally {
      setJoining(false);
    }
  }

  async function handleStartEarly() {
    try {
      await startClassEarlyApi(sessionId);
      toast.success("Class is now live");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start class");
    }
  }

  return (
    <div className="space-y-5">
      <Link href={onlineClassesHref()} className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Back to online classes
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <OnlineClassesPanel className="space-y-5">
          <div className={cn("overflow-hidden rounded-[20px] bg-gradient-to-br p-6", session.coverTone)}>
            <ClassStatusBadge status={session.status} />
            <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">{session.title}</h1>
            <p className="mt-2 text-sm font-medium text-foreground/80">{session.subject}</p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{session.description}</p>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Schedule</dt>
                <dd className="font-medium">{formatClassTimeRange(session.startAt, session.endAt)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Participants</dt>
                <dd className="font-medium">
                  {session.joinCount}/{session.maxParticipants} joined
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">{formatClassDuration(session.startAt, session.endAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Meeting code</dt>
              <dd className="font-medium">{session.meetingCode}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            {session.status === "live" ? (
              <Button
                className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
                disabled={joining}
                onClick={() => void handleJoin()}
              >
                <Video className="mr-2 h-4 w-4" />
                Join live class
              </Button>
            ) : session.hasRecording ? (
              <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                <Link href={classRecordingHref(session.id)}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch recording
                </Link>
              </Button>
            ) : canJoinSession(session) ? (
              <Button variant="outline" className="rounded-full" disabled>
                Opens at scheduled time
              </Button>
            ) : null}
            {canHost && session.status === "scheduled" ? (
              <Button variant="outline" className="rounded-full" onClick={() => void handleStartEarly()}>
                Start class now
              </Button>
            ) : null}
          </div>
        </OnlineClassesPanel>

        <div className="space-y-4">
          <OnlineClassesPanel>
            <h2 className="text-sm font-bold">Teacher</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-bold">
                {session.teacherAvatar}
              </div>
              <div>
                <p className="font-medium">{session.teacherName}</p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>
          </OnlineClassesPanel>

          {session.materials.length > 0 ? (
            <OnlineClassesPanel>
              <h2 className="text-sm font-bold">Materials</h2>
              <ul className="mt-3 space-y-2">
                {session.materials.map((material) => (
                  <li key={material.id}>
                    <Link
                      href={material.href}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {material.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </OnlineClassesPanel>
          ) : null}

          {session.tags.length > 0 ? (
            <OnlineClassesPanel>
              <h2 className="text-sm font-bold">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {session.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </OnlineClassesPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
