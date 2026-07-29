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
        assignments: {
          orderBy: { dueDate: "desc" },
          include: { _count: { select: { submissions: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
    }

    const studentCount = await prisma.student.count({ where: { classId: course.classId, isActive: true } });

    const items = [
      ...course.materials.map((m) => ({
        id: m.id,
        title: m.title,
        type: "material" as const,
        fileType: m.fileType,
        fileSize: `${Math.round(m.fileSize / 1024)} KB`,
        createdAt: m.createdAt.toISOString(),
      })),
      ...course.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        type: "assignment" as const,
        dueDate: a.dueDate.toISOString().slice(0, 10),
        status: a.status.toLowerCase(),
        submitted: a._count.submissions,
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalContent = course.materials.length + course.assignments.length;

    return NextResponse.json(
      createApiResponse(
        {
          id: course.id,
          title: course.title,
          classId: course.classId,
          className: course.class.section ? `${course.class.name} - ${course.class.section}` : course.class.name,
          students: studentCount,
          progress: course.status === "PUBLISHED" ? Math.min(100, totalContent * 25) : 0,
          items,
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

    const course = await prisma.course.findFirst({ where: { id: courseId, teacherId: staff.id } });
    if (!course) {
      return NextResponse.json(createApiError("not_found", "Course not found"), { status: 404 });
    }

    if (body.action === "add-module" && body.title?.trim()) {
      const assignment = await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: body.title.trim(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxScore: 100,
          status: "DRAFT",
        },
      });

      return NextResponse.json(
        createApiResponse(
          { id: assignment.id, title: assignment.title, type: "assignment", dueDate: assignment.dueDate.toISOString().slice(0, 10) },
          "Assignment created",
        ),
        { status: 201 },
      );
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
