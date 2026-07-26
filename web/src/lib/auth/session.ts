import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { verifyMobileAccessToken } from "./mobile-token";
import { UserRole, Permission } from "@/shared";
import { hasPermission } from "@/shared/permissions";

export async function getSession() {
  return getServerSession(authOptions);
}

async function getUserFromBearerToken() {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const payload = verifyMobileAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    onboardingCompleted: payload.onboardingCompleted,
    image: null as string | null,
  };
}

export async function getCurrentUser() {
  const bearerUser = await getUserFromBearerToken();
  if (bearerUser) return bearerUser;

  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}
