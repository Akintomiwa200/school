import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { createTeacherAssignment, listTeacherAssignments } from "@/lib/api/teacher-entity-store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
  return NextResponse.json(createApiResponse(listTeacherAssignments(classId), "Assignments loaded"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title?.trim() || !body.classId || !body.dueDate) {
    return NextResponse.json(
      createApiError("validation_error", "title, classId, and dueDate are required"),
      { status: 400 },
    );
  }

  const created = createTeacherAssignment({
    title: body.title,
    classId: body.classId,
    dueDate: body.dueDate,
    description: body.description,
    maxScore: body.maxScore,
  });

  if (!created) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(created, "Assignment created"), { status: 201 });
}
