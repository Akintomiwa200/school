import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  assignTeacher,
  getSubjectDetailById,
  removeTeacher,
  updateSubject,
} from "@/lib/api/subject-entity-store";
import type { SubjectRecord } from "@/components/dashboard/admin/admin-entities-data";

type RouteContext = { params: Promise<{ subjectId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { subjectId } = await context.params;
  const subject = getSubjectDetailById(subjectId);
  if (!subject) {
    return NextResponse.json(createApiError("not_found", "Subject not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(subject, "Subject loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { subjectId } = await context.params;
  const body = (await request.json()) as Partial<SubjectRecord> & {
    action?: "assign_teacher" | "remove_teacher";
    staffId?: string;
  };

  if (body.action === "assign_teacher" && body.staffId) {
    const updated = assignTeacher(subjectId, body.staffId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Subject or teacher not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(getSubjectDetailById(subjectId), "Teacher assigned"));
  }

  if (body.action === "remove_teacher" && body.staffId) {
    const updated = removeTeacher(subjectId, body.staffId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Subject or teacher not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(getSubjectDetailById(subjectId), "Teacher removed"));
  }

  const { action: _action, staffId: _staffId, ...patch } = body;
  const updated = updateSubject(subjectId, patch);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Subject not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(getSubjectDetailById(subjectId), "Subject updated"));
}
