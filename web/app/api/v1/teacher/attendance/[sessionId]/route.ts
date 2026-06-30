import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  getTeacherAttendanceSession,
  markTeacherAttendance,
  markTeacherAttendanceRecords,
} from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = getTeacherAttendanceSession(sessionId);

  if (!session) {
    return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(session, "Attendance session loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const body = await request.json();

  if (Array.isArray(body.records)) {
    const updated = markTeacherAttendanceRecords(sessionId, body.records);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(updated, "Attendance saved"));
  }

  const present = Number(body.present ?? 0);
  const absent = Number(body.absent ?? 0);
  const updated = markTeacherAttendance(sessionId, present, absent);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(getTeacherAttendanceSession(sessionId), "Attendance marked"));
}
