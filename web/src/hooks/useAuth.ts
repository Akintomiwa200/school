"use client";

import { useSession } from "next-auth/react";
import { UserRole, Permission } from "@/shared";
import { hasPermission, hasAnyPermission } from "@/shared/permissions";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role as UserRole | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    can: (permission: Permission) => (role ? hasPermission(role, permission) : false),
    canAny: (permissions: Permission[]) => (role ? hasAnyPermission(role, permissions) : false),
  };
}
