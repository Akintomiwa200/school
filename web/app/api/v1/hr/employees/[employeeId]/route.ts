import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getHrContext } from "@/lib/api/hr-helpers";
import { resolveEmployeeStatus, type HrEmployeeDetail, type HrLeaveRequest } from "@/lib/hr/map-hr-api";
import type { LeaveStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ employeeId: string }> };

function mapLeaveRow(row: {
  id: string;
  userId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  user: { firstName: string; lastName: string };
}): HrLeaveRequest {
  const days = Math.max(
    1,
    Math.ceil((row.endDate.getTime() - row.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
  );
  return {
    id: row.id,
    employee: `${row.user.firstName} ${row.user.lastName}`.trim(),
    employeeId: row.userId,
    staffId: null,
    type: row.type,
    from: row.startDate.toISOString().slice(0, 10),
    to: row.endDate.toISOString().slice(0, 10),
    days,
    status: row.status.toLowerCase() as HrLeaveRequest["status"],
    reason: row.reason,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await getHrContext();
    const { employeeId } = await context.params;

    const staff = await prisma.staff.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        payrolls: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 },
      },
    });

    if (!staff) {
      return NextResponse.json(createApiError("not_found", "Employee not found"), { status: 404 });
    }

    const leaveRows = await prisma.leaveRequest.findMany({
      where: { userId: staff.userId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const detail: HrEmployeeDetail = {
      id: staff.id,
      userId: staff.userId,
      name: `${staff.user.firstName} ${staff.user.lastName}`.trim(),
      employeeId: staff.employeeId,
      department: staff.department,
      contract: staff.designation,
      startDate: staff.joiningDate.toISOString().slice(0, 10),
      status: resolveEmployeeStatus(staff.userId, staff.isActive, leaveRows),
      email: staff.user.email,
      phone: staff.user.phone,
      salary: staff.salary != null ? Number(staff.salary) : null,
      leaveHistory: leaveRows.map(mapLeaveRow),
      payroll: staff.payrolls.map((row) => ({
        id: row.id,
        month: row.month,
        year: row.year,
        netSalary: Number(row.netSalary),
        status: row.status.toLowerCase(),
        paidAt: row.paidAt?.toISOString() ?? null,
      })),
      updatedAt: staff.updatedAt.toISOString(),
    };

    return NextResponse.json(createApiResponse(detail, "Employee loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load employee";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("employee_load_failed", message), { status });
  }
}
