import { UserRole } from "@/shared";
import { requireAuth, requireRole } from "@/lib/auth";

const HR_ROLES = [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN];

export async function getHrContext() {
  const user = await requireAuth();
  if (!HR_ROLES.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return { user };
}

export async function requireHrRole() {
  return requireRole(HR_ROLES);
}
