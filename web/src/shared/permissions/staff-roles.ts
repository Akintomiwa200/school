import { Permission, UserRole } from "../types";
import { getRoleDashboardPath } from "./index";

/** Roles that use the staff portal at /staff/login */
export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.ACCOUNTANT,
  UserRole.TEACHER,
  UserRole.NON_TEACHING_STAFF,
  UserRole.LIBRARIAN,
  UserRole.HR,
  UserRole.RECEPTIONIST,
];

export const CONSUMER_ROLES: UserRole[] = [UserRole.STUDENT, UserRole.PARENT];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isConsumerRole(role: UserRole): boolean {
  return CONSUMER_ROLES.includes(role);
}

/** Dashboard URL prefixes each role may access (plus permitted /shared routes). */
export const ROLE_DASHBOARD_PREFIXES: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ["/super-admin"],
  [UserRole.ADMIN]: ["/admin"],
  [UserRole.ACCOUNTANT]: ["/accountant"],
  [UserRole.TEACHER]: ["/teacher"],
  [UserRole.NON_TEACHING_STAFF]: ["/staff"],
  [UserRole.LIBRARIAN]: ["/librarian"],
  [UserRole.HR]: ["/hr"],
  [UserRole.RECEPTIONIST]: ["/receptionist"],
  [UserRole.STUDENT]: ["/student"],
  [UserRole.PARENT]: ["/parent"],
};

export function getLoginPathForRole(role: UserRole): string {
  return isStaffRole(role) ? "/staff/login" : "/login";
}

export function getNotificationsPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/notifications`;
}

export function getLoginPathForProtectedRoute(pathname: string): string {
  if (
    pathname === "/student" ||
    pathname.startsWith("/student/") ||
    pathname === "/parent" ||
    pathname.startsWith("/parent/")
  ) {
    return "/login";
  }
  return "/staff/login";
}

export function getUnauthorizedRedirect(role: UserRole): string {
  return getRoleDashboardPath(role);
}

/** Shared nav items gated by permission (profile & settings have no entry — always allowed). */
export const SHARED_ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/shared/announcements": Permission.ANNOUNCEMENTS_VIEW,
  "/shared/calendar": Permission.CALENDAR_VIEW,
  "/shared/events": Permission.EVENTS_VIEW,
  "/shared/messages": Permission.MESSAGES_VIEW,
  "/shared/support": Permission.SUPPORT_VIEW,
  "/shared/online-classes": Permission.ONLINE_CLASSES_VIEW,
  "/shared/leave": Permission.LEAVE_VIEW,
};
