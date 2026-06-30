import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherDashboard, listTeacherClasses } from "@/lib/api/teacher-entity-store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "class-a";
  const dashboard = getTeacherDashboard(classId);

  if (!dashboard) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(
    createApiResponse(
      {
        ...dashboard,
        classes: listTeacherClasses(),
      },
      "Teacher dashboard loaded",
    ),
  );
}
