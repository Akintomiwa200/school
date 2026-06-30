import { NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherClassDetail, normalizeClassId } from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ classId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { classId } = await context.params;
  const detail = getTeacherClassDetail(normalizeClassId(classId));

  if (!detail) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(detail, "Class loaded"));
}
