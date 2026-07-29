"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateAdmissionsLiveQueries } from "@/lib/admissions/admissions-query-sync";
import { connectAdmissionsLive, disconnectAdmissionsLive } from "./admissions-live-store";

/** Realtime hub for admission config — super admin settings, admin settings, and public apply flow. */
export function AdmissionsRealtimeBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    connectAdmissionsLive(() => invalidateAdmissionsLiveQueries(queryClient));
    return () => disconnectAdmissionsLive();
  }, [queryClient]);

  return null;
}
