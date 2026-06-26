import { UserRole } from "../types";
import { getRoleDashboardPath } from "./index";

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

/** Shared sidebar paths replaced by role-scoped routes. */
export const ROLE_SHARED_PATH_OVERRIDES: Partial<Record<UserRole, string[]>> = {
  [UserRole.STUDENT]: ["/shared/profile", "/shared/settings"],
  [UserRole.PARENT]: ["/shared/messages", "/shared/profile", "/shared/settings", "/shared/support"],
  [UserRole.ADMIN]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/messages",
    "/shared/calendar",
    "/shared/announcements",
    "/shared/events",
  ],
  [UserRole.SUPER_ADMIN]: [
    "/shared/profile",
    "/shared/settings",
    "/shared/messages",
    "/shared/calendar",
    "/shared/announcements",
    "/shared/events",
  ],
  [UserRole.ACCOUNTANT]: ["/shared/profile", "/shared/settings"],
  [UserRole.NON_TEACHING_STAFF]: ["/shared/leave"],
  [UserRole.RECEPTIONIST]: ["/shared/support"],
};

export function isSharedPathOverriddenForRole(role: UserRole, sharedPath: string): boolean {
  return ROLE_SHARED_PATH_OVERRIDES[role]?.includes(sharedPath) ?? false;
}
