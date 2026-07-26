import { useQuery } from "@tanstack/react-query";
import { courseService, attendanceService, feeService } from "@/services";

export { useThemeColors } from "./use-theme-colors";
export { useTheme } from "@/providers/theme-context";

export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: () => courseService.getAll() });
}

export function useAttendance() {
  return useQuery({ queryKey: ["attendance"], queryFn: () => attendanceService.getAll() });
}

export function useFees() {
  return useQuery({ queryKey: ["fees"], queryFn: () => feeService.getAll() });
}
