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

    if (resolvedClassIds.length === 0) {
      return NextResponse.json(createApiResponse([], "No classes assigned"));
    }

    const students = await prisma.student.findMany({
      where: { classId: { in: resolvedClassIds }, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
        class: { select: { name: true, section: true } },
        submissions: {
          select: { score: true, status: true },
          where: { assignment: { status: "PUBLISHED" } },
        },
        grades: {
          select: { score: true, maxScore: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        attendances: {
          select: { status: true },
        },
      },
      orderBy: { user: { firstName: "asc" } },
    });

    const data = students.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const name = `${s.user.firstName} ${s.user.lastName}`;

      const totalAttended = s.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
      const totalAttendance = s.attendances.length;
      const attendanceRate = totalAttendance > 0 ? Math.round((totalAttended / totalAttendance) * 100) : 100;

      const submitted = s.submissions.filter((sub) => sub.status !== "PENDING").length;

      return {
        id: s.id,
        name,
        initials: `${s.user.firstName[0]}${s.user.lastName[0]}`,
        avatarTone: (avg >= 70 ? "green" : avg >= 45 ? "blue" : "orange") as "green" | "blue" | "orange",
        classId: s.classId,
        className: s.class.section ? `${s.class.name} - ${s.class.section}` : s.class.name,
        studentId: s.admissionNumber,
        averageScore: avg,
        workCompleted: submitted,
        workTotal: Math.max(submitted, s.submissions.length),
        attendanceRate,
      };
    });

    return NextResponse.json(createApiResponse(data, "Students loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load students";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
