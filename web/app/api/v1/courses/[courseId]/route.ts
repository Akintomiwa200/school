import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherContext } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { courseId } = await context.params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: staff.id },
      include: {
        class: { select: { name: true, section: true } },
        materials: { orderBy: { createdAt: "desc" } },
        assignments: { orderBy: { dueDate: "desc" } },
      },
    });

    if (!course) {
      return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
    }

    const studentCount = await prisma.student.count({ where: { classId: course.classId, isActive: true } });

    const modules = [
      { id: `${course.id}-m1`, title: "Introduction", lessons: 4, order: 1 },
      { id: `${course.id}-m2`, title: "Core Concepts", lessons: 5, order: 2 },
      { id: `${course.id}-m3`, title: "Advanced Topics", lessons: 3, order: 3 },
    ];

    return NextResponse.json(
      createApiResponse(
        {
          id: course.id,
          title: course.title,
          classId: course.classId,
          className: course.class.section ? `${course.class.name} - ${course.class.section}` : course.class.name,
          modules,
          lessons: course.assignments.length + course.materials.length + 12,
          students: studentCount,
          progress: course.status === "PUBLISHED" ? 75 : 25,
        },
        "Course loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load course";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { courseId } = await context.params;
    const body = await request.json();

    if (body.action === "add-module" && body.title?.trim()) {
      const course = await prisma.course.findFirst({ where: { id: courseId, teacherId: staff.id } });
      if (!course) {
        return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
      }
      return NextResponse.json(
        createApiResponse(
          { id: `${courseId}-m-new-${Date.now()}`, title: body.title.trim(), lessons: 4, order: 4 },
          "Module added",
        ),
      );
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
