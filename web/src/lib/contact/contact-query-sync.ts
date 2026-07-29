import type { QueryClient } from "@tanstack/react-query";

export function invalidateContactLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["contact", "messages"] });
  queryClient.invalidateQueries({ queryKey: ["contact", "message"] });
}
