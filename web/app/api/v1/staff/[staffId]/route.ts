import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getStaffAssignedClasses, getStaffById, updateStaff } from "@/lib/api/staff-entity-store";
import type { ClassRecord, StaffRecord } from "@/components/dashboard/admin/admin-entities-data";

type RouteContext = { params: Promise<{ staffId: string }> };

export type StaffDetailResponse = StaffRecord & { assignedClasses: ClassRecord[] };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { staffId } = await context.params;
  const staff = getStaffById(staffId);
  if (!staff) {
    return NextResponse.json(createApiError("not_found", "Staff member not found"), { status: 404 });
  }

  const assignedClasses = getStaffAssignedClasses(staff);
  return NextResponse.json(
    createApiResponse({ ...staff, assignedClasses } satisfies StaffDetailResponse, "Staff member loaded"),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { staffId } = await context.params;
  const body = (await request.json()) as Partial<StaffRecord>;
  const updated = updateStaff(staffId, body);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Staff member not found"), { status: 404 });
  }

  const assignedClasses = getStaffAssignedClasses(updated);
  return NextResponse.json(
    createApiResponse({ ...updated, assignedClasses } satisfies StaffDetailResponse, "Staff member updated"),
  );
}
