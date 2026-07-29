"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/shared";
import { invalidateHrLiveQueries } from "@/lib/hr/hr-query-sync";
import { connectHrLive, disconnectHrLive } from "./hr-live-store";

/** Single realtime hub for the entire HR portal — mounted once in the dashboard shell. */
export function HrRealtimeBridge() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isHr = session?.user?.role === UserRole.HR;

  useEffect(() => {
    if (!isHr) {
      disconnectHrLive();
      return;
    }

    connectHrLive(() => invalidateHrLiveQueries(queryClient));
    return () => disconnectHrLive();
  }, [isHr, queryClient]);

  return null;
}
