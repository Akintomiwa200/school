import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { listTeacherStudents } from "@/lib/api/teacher-entity-store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
  return NextResponse.json(createApiResponse(listTeacherStudents(classId), "Students loaded"));
}
