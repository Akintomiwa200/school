import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);
    const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
    const resolvedClassIds = classId && classIds.includes(classId) ? [classId] : classIds;

    const materials = await prisma.courseMaterial.findMany({
      where: { course: { teacherId: staff.id, classId: { in: resolvedClassIds } } },
      include: { course: { select: { classId: true, class: { select: { name: true, section: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    const data = materials.map((m) => ({
      id: m.id,
      name: m.title,
      type: m.fileType,
      size: `${Math.round(m.fileSize / 1024)} KB`,
      classId: m.course.classId,
      sharedWith: m.course.class.section ? `${m.course.class.name} - ${m.course.class.section}` : m.course.class.name,
      uploaded: m.createdAt.toISOString().slice(0, 10),
      sharedClasses: [m.course.classId],
    }));

    return NextResponse.json(createApiResponse(data, "Materials loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load materials";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const body = await request.json();

    if (!body.name?.trim() || !body.classId) {
      return NextResponse.json(createApiError("validation_error", "name and classId are required"), { status: 400 });
    }

    const classIds = await getTeacherClassIds(staff.id);
    if (!classIds.includes(body.classId)) {
      return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
    }

    const course = await prisma.course.findFirst({ where: { teacherId: staff.id, classId: body.classId } });
    if (!course) {
      return NextResponse.json(createApiError("not_found", "No course found"), { status: 404 });
    }

    const material = await prisma.courseMaterial.create({
      data: { courseId: course.id, title: body.name.trim(), fileUrl: "#", fileType: body.type ?? "PDF", fileSize: 1024, uploadedBy: staff.id },
    });

    const cls = await prisma.class.findUnique({ where: { id: body.classId }, select: { name: true, section: true } });

    return NextResponse.json(
      createApiResponse(
        { id: material.id, name: material.title, type: material.fileType, size: `${Math.round(material.fileSize / 1024)} KB`, classId: body.classId, sharedWith: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown", uploaded: material.createdAt.toISOString().slice(0, 10), sharedClasses: [body.classId] },
        "Material uploaded",
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload material";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
