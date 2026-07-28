import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ assignmentId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { assignmentId } = await context.params;
    const classIds = await getTeacherClassIds(staff.id);

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, course: { teacherId: staff.id } },
      include: {
        course: { select: { classId: true, class: { select: { name: true, section: true } } } },
        submissions: {
          include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
    }

    const className = assignment.course.class.section
      ? `${assignment.course.class.name} - ${assignment.course.class.section}`
      : assignment.course.class.name;

    const allStudents = await prisma.student.findMany({
      where: { classId: assignment.course.classId, isActive: true },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const submissions = allStudents.map((s) => {
      const sub = assignment.submissions.find((x) => x.studentId === s.id);
      return {
        studentId: s.id,
        studentName: `${s.user.firstName} ${s.user.lastName}`,
        submitted: sub != null && sub.status !== "PENDING",
        score: sub?.score ?? null,
        submittedAt: sub?.submittedAt?.toISOString() ?? null,
      };
    });

    const submittedCount = submissions.filter((s) => s.submitted).length;
    const allGraded = submissions.filter((s) => s.submitted).every((s) => s.score != null);
    let status: "active" | "grading" | "closed" = "active";
    if (allGraded && submittedCount === allStudents.length) status = "closed";
    else if (submittedCount > 0) status = "grading";

    return NextResponse.json(
      createApiResponse(
        {
          id: assignment.id,
          title: assignment.title,
          classId: assignment.course.classId,
          className,
          dueDate: assignment.dueDate.toISOString().slice(0, 10),
          total: allStudents.length,
          submitted: submittedCount,
          status,
          maxScore: assignment.maxScore,
          description: assignment.description ?? undefined,
          submissions,
          createdAt: assignment.createdAt.toISOString(),
        },
        "Assignment loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load assignment";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { assignmentId } = await context.params;
    const body = await request.json();

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, course: { teacherId: staff.id } },
    });

    if (!assignment) {
      return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
    }

    const statusMap: Record<string, "DRAFT" | "PUBLISHED" | "CLOSED"> = {
      active: "PUBLISHED",
      grading: "PUBLISHED",
      closed: "CLOSED",
    };

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        ...(body.status && { status: statusMap[body.status] ?? assignment.status }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json(createApiResponse({ ...updated, status: updated.status.toLowerCase() }, "Assignment updated"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update assignment";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { assignmentId } = await context.params;
    const body = await request.json();

    if (body.action === "grade" && body.studentId != null && body.score != null) {
      const assignment = await prisma.assignment.findFirst({
        where: { id: assignmentId, course: { teacherId: staff.id } },
      });
      if (!assignment) {
        return NextResponse.json(createApiError("not_found", "Assignment not found"), { status: 404 });
      }

      const score = Math.min(assignment.maxScore, Math.max(0, Number(body.score)));

      const submission = await prisma.assignmentSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId, studentId: body.studentId } },
        create: { assignmentId, studentId: body.studentId, score, status: "GRADED", gradedAt: new Date() },
        update: { score, status: "GRADED", gradedAt: new Date() },
      });

      return NextResponse.json(createApiResponse(submission, "Submission graded"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to grade submission";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
