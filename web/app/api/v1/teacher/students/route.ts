import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);
    const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
    const resolvedClassIds = classId && classIds.includes(classId) ? [classId] : classIds;

    const students = await prisma.student.findMany({
      where: { classId: { in: resolvedClassIds }, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
        class: { select: { name: true, section: true } },
        submissions: { select: { score: true } },
      },
    });

    const data = students.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const name = `${s.user.firstName} ${s.user.lastName}`;
      return {
        id: s.id,
        name,
        initials: `${s.user.firstName[0]}${s.user.lastName[0]}`,
        avatarTone: (avg >= 70 ? "green" : avg >= 45 ? "blue" : "orange") as "green" | "blue" | "orange",
        classId: s.classId,
        className: s.class.section ? `${s.class.name} - ${s.class.section}` : s.class.name,
        studentId: s.admissionNumber,
        averageScore: avg,
        workCompleted: s.submissions.length,
        workTotal: Math.max(1, s.submissions.length + 5),
      };
    });

    return NextResponse.json(createApiResponse(data, "Students loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load students";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
