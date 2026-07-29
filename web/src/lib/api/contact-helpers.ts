import { UserRole } from "@/shared";
import { requireRole } from "@/lib/auth";

const CONTACT_STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST];

export async function getContactStaffContext() {
  return requireRole(CONTACT_STAFF_ROLES);
}
