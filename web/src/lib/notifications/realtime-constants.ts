import { UserRole } from "@/shared";

export const DEMO_REALTIME_USER = {
  id: "demo-user-student",
  name: "Alex Johnson",
  role: UserRole.STUDENT,
  email: "alex@school.demo",
};

export function canPublishAnnouncements(role: UserRole) {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.ACCOUNTANT,
    UserRole.HR,
    UserRole.RECEPTIONIST,
    UserRole.LIBRARIAN,
  ].includes(role);
}
