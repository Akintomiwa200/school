import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { createTeacherCourseModule, getTeacherCourse } from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { courseId } = await context.params;
  const course = getTeacherCourse(courseId);

  if (!course) {
    return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(course, "Course loaded"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { courseId } = await context.params;
  const body = await request.json();

  if (body.action === "add-module" && body.title?.trim()) {
    const updated = createTeacherCourseModule(courseId, body.title);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(updated, "Module added"));
  }

  return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
}
