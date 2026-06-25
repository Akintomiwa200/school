"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Hash, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnlineClassesPanel, OnlineClassesSubNav } from "./online-classes-ui";

type StudentOnlineClassesShellProps = {
  children: React.ReactNode;
  standalone?: boolean;
  activeSegment?: string;
};

const DEFAULT_STUDENT = {
  name: "Alex Johnson",
  studentId: "STU-2024-118",
};

export function StudentOnlineClassesShell({
  children,
  standalone = false,
  activeSegment = "overview",
}: StudentOnlineClassesShellProps) {
  const pathname = usePathname();
  const basePath = "/student/online-classes";
  const { data: session } = useSession();
  const studentName = session?.user?.name ?? DEFAULT_STUDENT.name;

  const isLiveRoom = /\/online-classes\/[^/]+\/live$/.test(pathname);
  const isRecording = /\/online-classes\/[^/]+\/recording$/.test(pathname);
  const isWaiting = /\/online-classes\/[^/]+\/waiting$/.test(pathname);
  const isDetail =
    /\/online-classes\/[^/]+$/.test(pathname) &&
    !isLiveRoom &&
    !isRecording &&
    !isWaiting &&
    pathname !== basePath &&
    !pathname.endsWith("/live") &&
    !pathname.endsWith("/upcoming") &&
    !pathname.endsWith("/recordings");

  const isStandalone = standalone || isLiveRoom || isRecording || isWaiting || isDetail;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      {!isLiveRoom ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isRecording
                ? "Class recording"
                : isWaiting
                  ? "Waiting room"
                  : isDetail
                    ? "Class details"
                    : "Online classes"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {isRecording
                ? "Replay past sessions and review materials."
                : isWaiting
                  ? "Wait here until your teacher starts the class."
                  : isDetail
                    ? "Schedule, materials, and join options."
                    : "Join live video classes, chat with your teacher, and access recordings."}
            </p>
          </div>
          {!isStandalone ? (
            <Button
              asChild
              className="h-10 shrink-0 rounded-full bg-brand-purple px-5 text-sm font-semibold text-white hover:bg-brand-purple/90"
            >
              <Link href={`${basePath}#join-code`} className="inline-flex items-center gap-2">
                <Video className="h-4 w-4 shrink-0" />
                Join with code
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isStandalone && !isLiveRoom ? (
        <OnlineClassesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Student</p>
            <h2 className="mt-1 text-lg font-bold">{studentName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">ID: {DEFAULT_STUDENT.studentId}</p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4 shrink-0" />
            Meeting codes are shared by your teacher
          </p>
        </OnlineClassesPanel>
      ) : null}

      {!isStandalone ? <OnlineClassesSubNav activeSegment={activeSegment} /> : null}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
