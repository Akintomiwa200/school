"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateContactLiveQueries } from "@/lib/contact/contact-query-sync";
import { connectContactLive, disconnectContactLive } from "./contact-live-store";

export function ContactRealtimeBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    connectContactLive(() => invalidateContactLiveQueries(queryClient));
    return () => disconnectContactLive();
  }, [queryClient]);

  return null;
}
