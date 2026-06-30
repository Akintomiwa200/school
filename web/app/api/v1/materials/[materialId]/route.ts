import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { deleteTeacherMaterial, getTeacherMaterial, shareTeacherMaterial } from "@/lib/api/teacher-entity-store";

type RouteContext = { params: Promise<{ materialId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { materialId } = await context.params;
  const material = getTeacherMaterial(materialId);

  if (!material) {
    return NextResponse.json(createApiError("not_found", "Material not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(material, "Material loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { materialId } = await context.params;
  const body = await request.json();

  if (body.action === "share" && Array.isArray(body.classIds)) {
    const updated = shareTeacherMaterial(materialId, body.classIds);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Material not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(updated, "Material shared"));
  }

  return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { materialId } = await context.params;
  const deleted = deleteTeacherMaterial(materialId);

  if (!deleted) {
    return NextResponse.json(createApiError("not_found", "Material not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(deleted, "Material deleted"));
}
