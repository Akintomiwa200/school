import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function POST(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const body = await request.json();
    const classId = body.classId as string | undefined;
    const term = body.term as string | undefined;

    if (!classId) {
      return NextResponse.json(createApiError("validation_error", "classId is required"), { status: 400 });
    }

    const classIds = await getTeacherClassIds(staff.id);
    if (!classIds.includes(classId)) {
      return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const courses = await prisma.course.findMany({
      where: { teacherId: staff.id, classId },
      include: { subject: { select: { id: true } } },
    });

    const termName = term?.trim() || `Term ${new Date().toISOString().slice(0, 4)}`;
    const now = new Date();

    for (const student of students) {
      for (const course of courses) {
        const assignments = await prisma.assignment.findMany({
          where: { courseId: course.id },
          include: { submissions: { where: { studentId: student.id }, select: { score: true } } },
        });

        const allScores = assignments.flatMap((a) => a.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!));
        if (allScores.length > 0) {
          const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
          await prisma.grade.upsert({
            where: { studentId_subjectId_term: { studentId: student.id, subjectId: course.subject.id, term: termName } },
            create: { studentId: student.id, subjectId: course.subject.id, term: termName, score: avg, maxScore: 100 },
            update: { score: avg },
          });
        }
      }
    }

    return NextResponse.json(
      createApiResponse(
        { classId, term: termName, publishedAt: now.toISOString() },
        "Term grades published",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish grades";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
