import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { addTeacherMaterial, listTeacherMaterials } from "@/lib/api/teacher-entity-store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
  return NextResponse.json(createApiResponse(listTeacherMaterials(classId), "Materials loaded"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name?.trim() || !body.classId) {
    return NextResponse.json(
      createApiError("validation_error", "name and classId are required"),
      { status: 400 },
    );
  }

  const created = addTeacherMaterial({
    name: body.name,
    type: body.type ?? "PDF",
    size: body.size ?? "1.0 MB",
    classId: body.classId,
  });

  if (!created) {
    return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(created, "Material uploaded"), { status: 201 });
}
