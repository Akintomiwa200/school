import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { addStaff, getMutableStaff } from "@/lib/api/staff-entity-store";
import type { StaffRecord, StaffRole } from "@/components/dashboard/admin/admin-entities-data";

export async function GET(request: NextRequest) {
  return jsonList(getMutableStaff(), "Staff loaded", request, [
    "name",
    "employeeId",
    "department",
    "role",
    "email",
    "designation",
  ]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<StaffRecord>;
  if (!body.name || !body.role || !body.department || !body.email || !body.designation) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }

  const staff = addStaff({
    name: body.name,
    role: body.role as StaffRole,
    designation: body.designation,
    department: body.department,
    email: body.email,
    phone: body.phone ?? "",
    joiningDate: body.joiningDate ?? new Date().toISOString().slice(0, 10),
    status: body.status ?? "active",
    employeeId: body.employeeId,
  });

  return jsonData(staff, "Staff member created", 201);
}
