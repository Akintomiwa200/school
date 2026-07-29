import type { JobStatus, LeaveStatus } from "@prisma/client";

export type HrSummary = {
  employees: number;
  onLeave: number;
  openRoles: number;
  pendingLeave: number;
};

export type HrEmployee = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  contract: string;
  startDate: string;
  status: "active" | "on_leave" | "inactive";
  email: string;
};

export type HrLeaveRequest = {
  id: string;
  employee: string;
  employeeId: string;
  staffId: string | null;
  type: string;
  from: string;
  to: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string;
};

export type HrJobPosting = {
  id: string;
  title: string;
  department: string;
  applicants: number;
  posted: string;
  status: "open" | "interviewing" | "closed";
  description?: string;
};

export type HrPortalPayload = {
  summary: HrSummary;
  employees: HrEmployee[];
  leaveRequests: HrLeaveRequest[];
  recruitment: HrJobPosting[];
  updatedAt: string;
};

export type HrEmployeeDetail = HrEmployee & {
  userId: string;
  phone: string | null;
  salary: number | null;
  leaveHistory: HrLeaveRequest[];
  payroll: { id: string; month: number; year: number; netSalary: number; status: string; paidAt: string | null }[];
  updatedAt: string;
};

export type HrJobApplicant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  appliedAt: string;
};

export type HrJobDetail = HrJobPosting & {
  applications: HrJobApplicant[];
  updatedAt: string;
};

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)) + 1);
}

export function isUserOnLeaveToday(
  userId: string,
  leaveRows: { userId: string; status: LeaveStatus; startDate: Date; endDate: Date }[],
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return leaveRows.some(
    (row) =>
      row.userId === userId &&
      row.status === "APPROVED" &&
      row.startDate <= tomorrow &&
      row.endDate >= today,
  );
}

export function resolveEmployeeStatus(
  userId: string,
  isActive: boolean,
  leaveRows: { userId: string; status: LeaveStatus; startDate: Date; endDate: Date }[],
): HrEmployee["status"] {
  if (!isActive) return "inactive";
  if (isUserOnLeaveToday(userId, leaveRows)) return "on_leave";
  return "active";
}

function mapLeaveStatus(status: LeaveStatus): HrLeaveRequest["status"] {
  return status.toLowerCase() as HrLeaveRequest["status"];
}

function mapJobStatus(status: JobStatus): HrJobPosting["status"] {
  return status.toLowerCase() as HrJobPosting["status"];
}

export function buildHrPortalPayload(input: {
  staffRows: {
    id: string;
    userId: string;
    employeeId: string;
    department: string;
    designation: string;
    joiningDate: Date;
    isActive: boolean;
    user: { firstName: string; lastName: string; email: string };
  }[];
  leaveRows: {
    id: string;
    userId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    user: { firstName: string; lastName: string };
  }[];
  jobRows: {
    id: string;
    title: string;
    department: string;
    description: string | null;
    status: JobStatus;
    postedAt: Date;
    _count: { applications: number };
  }[];
}): HrPortalPayload {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const onLeaveUserIds = new Set(
    input.leaveRows
      .filter(
        (row) =>
          row.status === "APPROVED" &&
          row.startDate <= tomorrow &&
          row.endDate >= today,
      )
      .map((row) => row.userId),
  );

  const employees: HrEmployee[] = input.staffRows.map((row) => ({
    id: row.id,
    name: `${row.user.firstName} ${row.user.lastName}`.trim(),
    employeeId: row.employeeId,
    department: row.department,
    contract: row.designation,
    startDate: row.joiningDate.toISOString().slice(0, 10),
    status: resolveEmployeeStatus(row.userId, row.isActive, input.leaveRows),
    email: row.user.email,
  }));

  const staffIdByUserId = new Map(input.staffRows.map((row) => [row.userId, row.id]));

  const leaveRequests: HrLeaveRequest[] = input.leaveRows.map((row) => ({
    id: row.id,
    employee: `${row.user.firstName} ${row.user.lastName}`.trim(),
    employeeId: row.userId,
    staffId: staffIdByUserId.get(row.userId) ?? null,
    type: row.type,
    from: row.startDate.toISOString().slice(0, 10),
    to: row.endDate.toISOString().slice(0, 10),
    days: daysBetween(row.startDate, row.endDate),
    status: mapLeaveStatus(row.status),
    reason: row.reason,
  }));

  const recruitment: HrJobPosting[] = input.jobRows.map((row) => ({
    id: row.id,
    title: row.title,
    department: row.department,
    applicants: row._count.applications,
    posted: row.postedAt.toISOString().slice(0, 10),
    status: mapJobStatus(row.status),
    description: row.description ?? undefined,
  }));

  const summary: HrSummary = {
    employees: employees.filter((e) => e.status !== "inactive").length,
    onLeave: onLeaveUserIds.size,
    openRoles: recruitment.filter((j) => j.status === "open" || j.status === "interviewing").length,
    pendingLeave: leaveRequests.filter((r) => r.status === "pending").length,
  };

  return {
    summary,
    employees,
    leaveRequests,
    recruitment,
    updatedAt: new Date().toISOString(),
  };
}
