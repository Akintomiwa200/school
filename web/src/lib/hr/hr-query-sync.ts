import type { QueryClient } from "@tanstack/react-query";

/** Invalidate every React Query key used by the HR portal — called by SSE bridge and mutations. */
export function invalidateHrLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["hr"] });
  queryClient.invalidateQueries({ queryKey: ["messages"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["events"] });
  queryClient.invalidateQueries({ queryKey: ["support"] });
}
