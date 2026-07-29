import type { QueryClient } from "@tanstack/react-query";

/** Invalidate React Query keys used by admission config and pipeline pages. */
export function invalidateAdmissionsLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["admissions", "config"] });
  queryClient.invalidateQueries({ queryKey: ["admissions"] });
}
