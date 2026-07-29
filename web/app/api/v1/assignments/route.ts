import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
    const classIds = await getTeacherClassIds(staff.id);
    const resolvedClassIds = classId && classIds.includes(classId) ? [classId] : classIds;

    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: staff.id, classId: { in: resolvedClassIds } } },
      include: {
        course: { select: { classId: true, class: { select: { name: true, section: true } } } },
        _count: { select: { submissions: true } },
        submissions: { select: { score: true, status: true } },
      },
      orderBy: { dueDate: "desc" },
    });

    const studentsByClass = new Map<string, number>();
    for (const cid of resolvedClassIds) {
      studentsByClass.set(cid, await prisma.student.count({ where: { classId: cid, isActive: true } }));
    }

    const data = assignments.map((a) => {
      const submittedCount = a.submissions.filter((s) => s.status !== "PENDING").length;
      const gradedCount = a.submissions.filter((s) => s.score != null).length;
      const total = studentsByClass.get(a.course.classId) ?? 0;

      let status: "active" | "grading" | "closed" = "active";
      if (a.status === "CLOSED") status = "closed";
      else if (submittedCount > 0 && gradedCount < submittedCount) status = "grading";
      else if (submittedCount > 0 && gradedCount === submittedCount && submittedCount === total) status = "closed";

      return {
        id: a.id,
        title: a.title,
        classId: a.course.classId,
        className: a.course.class.section ? `${a.course.class.name} - ${a.course.class.section}` : a.course.class.name,
        dueDate: a.dueDate.toISOString().slice(0, 10),
        total,
        submitted: submittedCount,
        status,
        maxScore: a.maxScore,
        description: a.description ?? undefined,
        createdAt: a.createdAt.toISOString(),
      };
    });

    return NextResponse.json(createApiResponse(data, "Assignments loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load assignments";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const body = await request.json();

    if (!body.title?.trim() || !body.classId || !body.dueDate) {
      return NextResponse.json(createApiError("validation_error", "title, classId, and dueDate are required"), { status: 400 });
    }

    const classIds = await getTeacherClassIds(staff.id);
    if (!classIds.includes(body.classId)) {
      return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
    }

    const course = await prisma.course.findFirst({ where: { teacherId: staff.id, classId: body.classId } });
    if (!course) {
      return NextResponse.json(createApiError("not_found", "No course found for this class"), { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: body.title.trim(),
        description: body.description?.trim(),
        dueDate: new Date(body.dueDate),
        maxScore: body.maxScore ?? 100,
        status: "PUBLISHED",
      },
    });

    const cls = await prisma.class.findUnique({ where: { id: body.classId }, select: { name: true, section: true } });
    const studentsInClass = await prisma.student.count({ where: { classId: body.classId, isActive: true } });

    return NextResponse.json(
      createApiResponse(
        {
          id: assignment.id,
          title: assignment.title,
          classId: body.classId,
          className: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown",
          dueDate: assignment.dueDate.toISOString().slice(0, 10),
          total: studentsInClass,
          submitted: 0,
          status: "active",
          maxScore: assignment.maxScore,
          description: assignment.description ?? undefined,
          createdAt: assignment.createdAt.toISOString(),
        },
        "Assignment created",
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create assignment";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
