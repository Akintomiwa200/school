import { UserRole } from "@/shared";
import { requireRole } from "@/lib/auth";

const SUPER_ADMIN_ROLES = [UserRole.SUPER_ADMIN];

export async function getSuperAdminContext() {
  return requireRole(SUPER_ADMIN_ROLES);
}
