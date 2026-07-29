import type { QueryClient } from "@tanstack/react-query";

/** Invalidate every React Query key used by the super admin portal. */
export function invalidateSuperAdminLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["schools"] });
  queryClient.invalidateQueries({ queryKey: ["school"] });
  queryClient.invalidateQueries({ queryKey: ["users"] });
  queryClient.invalidateQueries({ queryKey: ["audit"] });
  queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
  queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
  queryClient.invalidateQueries({ queryKey: ["messages"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["events"] });
  queryClient.invalidateQueries({ queryKey: ["support"] });
  queryClient.invalidateQueries({ queryKey: ["admissions", "config"] });
  queryClient.invalidateQueries({ queryKey: ["admissions"] });
  queryClient.invalidateQueries({ queryKey: ["contact", "messages"] });
}
