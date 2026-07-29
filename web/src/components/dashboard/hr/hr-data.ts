import type { HrPortalPayload } from "@/lib/hr/map-hr-api";

export const HR_EMPTY: HrPortalPayload = {
  summary: { employees: 0, onLeave: 0, openRoles: 0, pendingLeave: 0 },
  employees: [],
  leaveRequests: [],
  recruitment: [],
  updatedAt: new Date().toISOString(),
};
