import type { QueryClient } from "@tanstack/react-query";

/** Invalidate every React Query key used by the teacher portal — called by SSE bridge and mutations. */
export function invalidateTeacherLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["teacher"] });
  queryClient.invalidateQueries({ queryKey: ["assignments"] });
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
  queryClient.invalidateQueries({ queryKey: ["courses"] });
  queryClient.invalidateQueries({ queryKey: ["materials"] });
  queryClient.invalidateQueries({ queryKey: ["timetable"] });
  queryClient.invalidateQueries({ queryKey: ["messages"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["events"] });
  queryClient.invalidateQueries({ queryKey: ["support"] });
}
