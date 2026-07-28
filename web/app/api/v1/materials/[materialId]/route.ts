import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherContext } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ materialId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { materialId } = await context.params;

    const material = await prisma.courseMaterial.findFirst({
      where: { id: materialId, course: { teacherId: staff.id } },
      include: { course: { select: { classId: true, class: { select: { name: true, section: true } } } } },
    });

    if (!material) {
      return NextResponse.json(createApiError("not_found", "Material not found"), { status: 404 });
    }

    return NextResponse.json(
      createApiResponse(
        { id: material.id, name: material.title, type: material.fileType, size: `${Math.round(material.fileSize / 1024)} KB`, classId: material.course.classId, sharedWith: material.course.class.section ? `${material.course.class.name} - ${material.course.class.section}` : material.course.class.name, uploaded: material.createdAt.toISOString().slice(0, 10), sharedClasses: [material.course.classId] },
        "Material loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load material";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { materialId } = await context.params;

    const material = await prisma.courseMaterial.findFirst({ where: { id: materialId, course: { teacherId: staff.id } } });
    if (!material) {
      return NextResponse.json(createApiError("not_found", "Material not found"), { status: 404 });
    }

    await prisma.courseMaterial.delete({ where: { id: materialId } });
    return NextResponse.json(createApiResponse({ id: materialId }, "Material deleted"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete material";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
