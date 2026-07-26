import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true, classId: true },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const courses = await prisma.course.findMany({
      where: { classId: student.classId, status: { not: "DRAFT" } },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        materials: { select: { id: true, title: true, fileType: true, fileSize: true } },
        assignments: {
          include: {
            submissions: { where: { studentId: student.id }, select: { id: true, status: true, score: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = courses.map((course) => {
      const totalAssignments = course.assignments.length;
      const gradedSubmissions = course.assignments.flatMap((a) =>
        a.submissions.filter((s) => s.status === "GRADED"),
      );
      const avgScore =
        gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, s) => sum + ((s.score ?? 0) / 100) * 100, 0) /
                gradedSubmissions.length,
            )
          : null;

      const materialCount = course.materials.length;
      const assignmentCount = totalAssignments;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        mode: course.mode,
        status: course.status,
        subject: course.subject.name,
        subjectCode: course.subject.code,
        teacher: `${course.teacher.user.firstName} ${course.teacher.user.lastName}`,
        thumbnail: course.thumbnail,
        materialCount,
        assignmentCount,
        averageScore: avgScore,
        startDate: course.startDate,
        endDate: course.endDate,
      };
    });

    return NextResponse.json(createApiResponse(result, "Student courses loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("courses_error", error instanceof Error ? error.message : "Failed to load courses"),
      { status: 500 },
    );
  }
}
