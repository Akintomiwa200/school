"use client";

import { useAuth } from "./useAuth";
import type { Permission } from "@/shared";

export function usePermissions() {
  const { can, canAny, role } = useAuth();
  return { can, canAny, role };
}
