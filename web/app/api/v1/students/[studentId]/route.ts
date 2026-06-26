import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getStudentById, updateStudent } from "@/lib/api/admin-entity-store";
import type { StudentRecord } from "@/components/dashboard/admin/admin-entities-data";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { studentId } = await context.params;
  const student = getStudentById(studentId);
  if (!student) {
    return NextResponse.json(createApiError("not_found", "Student not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(student, "Student loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { studentId } = await context.params;
  const body = (await request.json()) as Partial<StudentRecord>;
  const updated = updateStudent(studentId, body);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Student not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Student updated"));
}
