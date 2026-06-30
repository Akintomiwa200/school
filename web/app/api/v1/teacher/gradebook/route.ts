import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherGradebook } from "@/lib/api/teacher-entity-store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "class-a";
  const gradebook = getTeacherGradebook(classId);

  if (!gradebook) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(gradebook, "Gradebook loaded"));
}
