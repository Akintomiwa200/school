"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarClock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useOnlineClassesBase } from "./online-classes-context";
import {
  classLiveHref,
  classSessionHref,
  formatClassTimeRange,
  onlineClassesHref,
} from "./online-classes-data";
import { getSessionFromStore, useOnlineClassesStore } from "./online-classes-live-store";
import { ClassStatusBadge, OnlineClassesPanel } from "./online-classes-ui";

export function OnlineClassWaiting({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const basePath = useOnlineClassesBase();
  const isLoading = usePageLoading();
  const { sessions } = useOnlineClassesStore();
  const session = getSessionFromStore(sessionId) ?? sessions.find((item) => item.id === sessionId);

  useEffect(() => {
    if (session?.status === "live") {
      router.replace(classLiveHref(sessionId, basePath));
    }
  }, [basePath, router, session, sessionId]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

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

  return (
    <div className="min-w-0 space-y-5">
      <Link
        href={classSessionHref(sessionId, basePath)}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Class details
      </Link>

      <OnlineClassesPanel className="text-center">
        <div className={cn("mx-auto max-w-lg overflow-hidden rounded-[20px] bg-gradient-to-br p-6 sm:p-8", session.coverTone)}>
          <ClassStatusBadge status={session.status} />
          <h1 className="mt-4 text-2xl font-bold">{session.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{session.teacherName}</p>
        </div>

        <div className="mx-auto mt-6 max-w-md space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            {formatClassTimeRange(session.startAt, session.endAt)}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You&apos;re in the waiting room. The teacher will let you in when the class goes live.
            This page will automatically open the live room when the session starts.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Meeting code: {session.meetingCode}
          </p>

          {session.status === "live" ? (
            <Button asChild className="h-11 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href={classLiveHref(sessionId, basePath)}>
                <Video className="mr-2 h-4 w-4" />
                Join live now
              </Link>
            </Button>
          ) : (
            <Button disabled className="h-11 w-full rounded-full">
              Waiting for host…
            </Button>
          )}
        </div>
      </OnlineClassesPanel>
    </div>
  );
}
