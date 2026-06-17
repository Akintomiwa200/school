"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useStudents() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/v1/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });
  const create = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/v1/students", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create student");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
  return { ...query, create };
}

export function useCourses() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/v1/courses");
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
      const res = await fetch("/api/v1/fees");
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
      const res = await fetch("/api/v1/payments");
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
      const res = await fetch("/api/v1/attendance");
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
  });
  return query;
}

export function useNotifications() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });
  return query;
}
