import { UserRole } from "../types";
import { getRoleDashboardPath } from "./index";

const SHARED_SEGMENT_ROOTS = [
  "/shared/announcements",
  "/shared/calendar",
  "/shared/events",
  "/shared/messages",
  "/shared/support",
  "/shared/profile",
  "/shared/settings",
  "/shared/notifications",
  "/shared/leave",
  "/shared/online-classes",
] as const;

/** Map legacy /shared/* URLs to the signed-in role's dashboard paths. */
export function resolveSharedPathForRole(path: string, role: UserRole): string {
  const [pathname, ...queryParts] = path.split("?");
  const query = queryParts.length > 0 ? `?${queryParts.join("?")}` : "";
  const base = getRoleDashboardPath(role);

  if (!pathname?.startsWith("/shared/")) {
    return path;
  }

  for (const root of SHARED_SEGMENT_ROOTS) {
    if (pathname === root || pathname.startsWith(`${root}/`)) {
      const suffix = pathname.slice("/shared".length);
      if (root === "/shared/leave" && role === UserRole.NON_TEACHING_STAFF) {
        return `/staff/leave${query}`;
      }
      if (root === "/shared/online-classes" && role === UserRole.STUDENT) {
        return `/student/online-classes${pathname.slice(root.length)}${query}`;
      }
      return `${base}${suffix}${query}`;
    }
  }

  return path;
}

export function getProfilePathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/profile`;
}

export function getSettingsPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/settings`;
}

export function getMessagesPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/messages`;
}

export function getCalendarPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/calendar`;
}

export function getAnnouncementsPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/announcements`;
}

export function getEventsPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/events`;
}

export function getSupportPathForRole(role: UserRole): string {
  return `${getRoleDashboardPath(role)}/support`;
}

export function getLeavePathForRole(role: UserRole): string {
  return role === UserRole.NON_TEACHING_STAFF
    ? "/staff/leave"
    : `${getRoleDashboardPath(role)}/leave`;
}

/** Shared sidebar paths replaced by role-scoped routes in ROLE_ROUTES. */
export const ROLE_SHARED_PATH_OVERRIDES: Partial<Record<UserRole, string[]>> = {
  [UserRole.STUDENT]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/events",
    "/shared/messages",
    "/shared/online-classes",
  ],
  [UserRole.PARENT]: [
    "/shared/messages",
    "/shared/profile",
    "/shared/settings",
    "/shared/support",
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/events",
  ],
  [UserRole.ADMIN]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/messages",
    "/shared/calendar",
    "/shared/announcements",
    "/shared/events",
    "/shared/notifications",
  ],
  [UserRole.SUPER_ADMIN]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/messages",
    "/shared/calendar",
    "/shared/announcements",
    "/shared/events",
    "/shared/notifications",
  ],
  [UserRole.ACCOUNTANT]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/messages",
    "/shared/support",
  ],
  [UserRole.TEACHER]: [
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/events",
    "/shared/messages",
    "/shared/support",
    "/shared/online-classes",
  ],
  [UserRole.HR]: [
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/messages",
    "/shared/support",
  ],
  [UserRole.LIBRARIAN]: [
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/messages",
    "/shared/support",
  ],
  [UserRole.NON_TEACHING_STAFF]: [
    "/shared/leave",
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/messages",
    "/shared/support",
  ],
  [UserRole.RECEPTIONIST]: [
    "/shared/support",
    "/shared/notifications",
    "/shared/announcements",
    "/shared/calendar",
    "/shared/events",
    "/shared/messages",
  ],
};

export function isSharedPathOverriddenForRole(role: UserRole, sharedPath: string): boolean {
  return ROLE_SHARED_PATH_OVERRIDES[role]?.includes(sharedPath) ?? false;
}
