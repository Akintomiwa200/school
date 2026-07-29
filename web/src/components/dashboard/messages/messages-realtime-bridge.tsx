"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMessages } from "@/hooks/use-dashboard-data";
import { hydrateMessagesFromApi, registerMessagesRefresh } from "./messages-live-store";

/** Keeps the messages UI store in sync with the shared messages API + teacher SSE invalidation. */
export function MessagesRealtimeBridge() {
  const { data: session, status } = useSession();
  const enabled = status === "authenticated" && Boolean(session?.user?.id);
  const { data, refetch, isSuccess } = useMessages(enabled);

  useEffect(() => {
    if (!enabled) return;
    registerMessagesRefresh(() => {
      void refetch();
    });
    return () => registerMessagesRefresh(null);
  }, [enabled, refetch]);

  useEffect(() => {
    if (!enabled || !isSuccess || !data) return;
    hydrateMessagesFromApi(data);
  }, [enabled, isSuccess, data]);

  return null;
}
