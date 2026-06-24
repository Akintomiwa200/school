import { UserRole } from "@/shared";

export const DEMO_CLASS_USER = {
  id: "demo-user-student",
  name: "Alex Johnson",
  role: UserRole.STUDENT,
};

export function canHostOnlineClasses(role: UserRole) {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER].includes(role);
}
