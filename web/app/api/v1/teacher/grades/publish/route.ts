import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { publishTeacherGrades } from "@/lib/api/teacher-entity-store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const classId = body.classId as string | undefined;

  if (!classId) {
    return NextResponse.json(createApiError("validation_error", "classId is required"), { status: 400 });
  }

  const published = publishTeacherGrades(classId, body.term);
  if (!published) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(published, "Term grades published"));
}
