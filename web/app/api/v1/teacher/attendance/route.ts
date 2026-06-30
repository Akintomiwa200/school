import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { createTeacherAttendanceSession } from "@/lib/api/teacher-entity-store";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.classId || !body.date || !body.time) {
    return NextResponse.json(
      createApiError("validation_error", "classId, date, and time are required"),
      { status: 400 },
    );
  }

  const created = createTeacherAttendanceSession({
    classId: body.classId,
    date: body.date,
    time: body.time,
  });

  if (!created) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(created, "Attendance session created"), { status: 201 });
}
