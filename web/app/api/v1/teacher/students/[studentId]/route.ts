import { NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherStudent } from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const student = getTeacherStudent(studentId);

  if (!student) {
    return NextResponse.json(createApiError("not_found", "Student not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(student, "Student loaded"));
}
