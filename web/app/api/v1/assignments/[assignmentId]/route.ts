import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  getTeacherAssignment,
  gradeTeacherSubmission,
  updateTeacherAssignment,
} from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ assignmentId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { assignmentId } = await context.params;
  const assignment = getTeacherAssignment(assignmentId);

  if (!assignment) {
    return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(assignment, "Assignment loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { assignmentId } = await context.params;
  const body = await request.json();

  const updated = updateTeacherAssignment(assignmentId, {
    title: body.title,
    dueDate: body.dueDate,
    status: body.status,
    description: body.description,
  });

  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(updated, "Assignment updated"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { assignmentId } = await context.params;
  const body = await request.json();

  if (body.action === "grade" && body.studentId != null && body.score != null) {
    const updated = gradeTeacherSubmission(assignmentId, body.studentId, Number(body.score));
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(updated, "Submission graded"));
  }

  return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
}
