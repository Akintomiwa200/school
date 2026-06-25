"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineClassesBase } from "./online-classes-context";
import {
  formatClassDuration,
  formatClassTimeRange,
  onlineClassesHref,
  classSessionHref,
} from "./online-classes-data";
import { getSessionFromStore, useOnlineClassesStore } from "./online-classes-live-store";
import { OnlineClassesPanel } from "./online-classes-ui";

export function OnlineClassRecording({ sessionId }: { sessionId: string }) {
  const basePath = useOnlineClassesBase();
  const { sessions } = useOnlineClassesStore();
  const session = getSessionFromStore(sessionId) ?? sessions.find((item) => item.id === sessionId);

  if (!session) {
    return (
      <OnlineClassesPanel className="text-center">
        <h2 className="text-lg font-bold">Recording not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={onlineClassesHref(undefined, basePath)}>Back</Link>
        </Button>
      </OnlineClassesPanel>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <Link
        href={onlineClassesHref(undefined, basePath)}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to online classes
      </Link>

      <OnlineClassesPanel className="space-y-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recording</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{session.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.teacherName} · {formatClassTimeRange(session.startAt, session.endAt)} ·{" "}
            {formatClassDuration(session.startAt, session.endAt)}
          </p>
        </div>

        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-200 via-violet-100 to-purple-100">
          <div className="text-center">
            <PlayCircle className="mx-auto h-16 w-16 text-brand-purple" />
            <p className="mt-3 text-sm font-medium text-foreground">Class recording available</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo playback — connect your video provider for full streaming.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{session.description}</p>

        <Button asChild className="h-10 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90 sm:w-auto">
          <Link href={classSessionHref(session.id, basePath)}>View class details</Link>
        </Button>
      </OnlineClassesPanel>
    </div>
  );
}
