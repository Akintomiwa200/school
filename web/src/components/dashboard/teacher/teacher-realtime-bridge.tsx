"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/shared";
import { invalidateTeacherLiveQueries } from "@/lib/teacher/teacher-query-sync";
import { connectTeacherLive, disconnectTeacherLive } from "./teacher-live-store";

/**
 * Single realtime hub for the entire teacher portal.
 * Mounted once in the dashboard shell — individual pages do not manage polling.
 */
export function TeacherRealtimeBridge() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isTeacher = session?.user?.role === UserRole.TEACHER;

  useEffect(() => {
    if (!isTeacher) {
      disconnectTeacherLive();
      return;
    }

    connectTeacherLive(() => invalidateTeacherLiveQueries(queryClient));
    return () => disconnectTeacherLive();
  }, [isTeacher, queryClient]);

  return null;
}
