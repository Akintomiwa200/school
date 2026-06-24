"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import { DEMO_REALTIME_USER } from "@/lib/notifications/realtime-constants";
import { connectRealtime, disconnectRealtime, useNotificationsStore } from "./notifications-live-store";

export function RealtimeNotificationsBridge() {
  const { data: session } = useSession();
  const { notifications, connection } = useNotificationsStore();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const userId = session?.user?.id ?? DEMO_REALTIME_USER.id;
  const role = (session?.user?.role as UserRole) ?? DEMO_REALTIME_USER.role;
  const userKey = `${userId}:${role}`;

  useEffect(() => {
    connectRealtime(userKey);
    initializedRef.current = false;
    seenIdsRef.current = new Set();
    return () => disconnectRealtime();
  }, [userKey]);

  useEffect(() => {
    if (connection !== "connected") return;

    if (!initializedRef.current) {
      notifications.forEach((item) => seenIdsRef.current.add(item.id));
      initializedRef.current = true;
      return;
    }

    for (const item of notifications) {
      if (item.isRead || seenIdsRef.current.has(item.id)) continue;
      seenIdsRef.current.add(item.id);
      toast.info(item.title, { description: item.message });
    }
  }, [notifications, connection]);

  return null;
}
