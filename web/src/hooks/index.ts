"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/shared/constants";

export { useAuth } from "./useAuth";
export { usePermissions } from "./usePermissions";
export { useDebounce } from "./useDebounce";

export function useStudents() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.STUDENTS);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });
  const create = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch(API_ENDPOINTS.STUDENTS, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create student");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
  return { ...query, create };
}

export function useCourses() {
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.COURSES);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });
  return { ...query };
}

export function useFees() {
  const query = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.FEES);
      if (!res.ok) throw new Error("Failed to fetch fees");
      return res.json();
    },
  });
  return query;
}

export function usePayments() {
  const query = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.PAYMENTS);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });
  return query;
}

export function useAttendance() {
  const query = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.ATTENDANCE);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
  });
  return query;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_BY_ID(id), {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error("Failed to mark notification read");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return { ...query, markRead };
}
