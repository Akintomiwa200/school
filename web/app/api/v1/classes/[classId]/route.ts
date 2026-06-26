import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  getClassById,
  getStudentsByClass,
  updateClass,
} from "@/lib/api/admin-entity-store";
import type { ClassRecord } from "@/components/dashboard/admin/admin-entities-data";

type RouteContext = { params: Promise<{ classId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { classId } = await context.params;
  const classRecord = getClassById(classId);
  if (!classRecord) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  const roster = getStudentsByClass(classRecord.grade, classRecord.section);
  const includeRoster = request.nextUrl.searchParams.get("roster") === "1";

  return NextResponse.json(
    createApiResponse(
      includeRoster ? { ...classRecord, roster } : classRecord,
      "Class loaded",
    ),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { classId } = await context.params;
  const body = (await request.json()) as Partial<ClassRecord>;
  const updated = updateClass(classId, body);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Class updated"));
}
