import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);
    const requestedClassId = request.nextUrl.searchParams.get("classId");
    const classId = requestedClassId && classIds.includes(requestedClassId) ? requestedClassId : classIds[0];

    if (!classId) {
      return NextResponse.json(createApiError("not_found", "No classes assigned"), { status: 404 });
    }

    const [cls, students, assignments] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId }, select: { name: true, section: true } }),
      prisma.student.findMany({
        where: { classId, isActive: true },
        include: {
          user: { select: { firstName: true, lastName: true } },
          submissions: { select: { assignmentId: true, score: true, status: true } },
        },
      }),
      prisma.assignment.findMany({
        where: { course: { teacherId: staff.id, classId } },
        select: { id: true, title: true, dueDate: true, status: true, maxScore: true },
        orderBy: { dueDate: "desc" },
      }),
    ]);

    const className = cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown";

    const studentsData = students.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const grades = assignments.map((a) => {
        const sub = s.submissions.find((x) => x.assignmentId === a.id);
        return {
          assignmentId: a.id,
          title: a.title,
          score: sub?.score ?? null,
          submitted: sub != null && sub.status !== "PENDING",
        };
      });
      return { id: s.id, name: `${s.user.firstName} ${s.user.lastName}`, studentId: s.admissionNumber, averageScore: avg, grades };
    });

    return NextResponse.json(
      createApiResponse(
        {
          classId,
          className,
          published: false,
          publishedAt: undefined,
          term: undefined,
          students: studentsData,
          assignments: assignments.map((a) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate.toISOString().slice(0, 10),
            status: a.status.toLowerCase(),
            maxScore: a.maxScore,
          })),
        },
        "Gradebook loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load gradebook";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
