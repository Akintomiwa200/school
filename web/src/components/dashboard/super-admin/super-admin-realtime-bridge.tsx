"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/shared";
import { invalidateSuperAdminLiveQueries } from "@/lib/super-admin/super-admin-query-sync";
import { connectSuperAdminLive, disconnectSuperAdminLive } from "./super-admin-live-store";

/** Single realtime hub for the entire super admin portal. */
export function SuperAdminRealtimeBridge() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (!isSuperAdmin) {
      disconnectSuperAdminLive();
      return;
    }

    connectSuperAdminLive(() => invalidateSuperAdminLiveQueries(queryClient));
    return () => disconnectSuperAdminLive();
  }, [isSuperAdmin, queryClient]);

  return null;
}
