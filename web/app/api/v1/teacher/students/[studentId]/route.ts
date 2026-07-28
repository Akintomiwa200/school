import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { studentId } = await context.params;
    const classIds = await getTeacherClassIds(staff.id);

    const student = await prisma.student.findFirst({
      where: { id: studentId, classId: { in: classIds } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        class: { select: { name: true, section: true } },
        submissions: {
          include: { assignment: { select: { id: true, title: true, dueDate: true, maxScore: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student not found"), { status: 404 });
    }

    const className = student.class.section ? `${student.class.name} - ${student.class.section}` : student.class.name;
    const scores = student.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const rowTone = avg >= 70 ? "mastered" : avg >= 45 ? "working" : "attention";

    return NextResponse.json(
      createApiResponse(
        {
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          initials: `${student.user.firstName[0]}${student.user.lastName[0]}`,
          avatarTone: (rowTone === "mastered" ? "green" : rowTone === "working" ? "blue" : "orange") as "green" | "blue" | "orange",
          rowTone,
          classId: student.classId,
          className,
          studentId: student.admissionNumber,
          averageScore: avg,
          workCompleted: student.submissions.filter((sub) => sub.status !== "PENDING").length,
          workTotal: Math.max(1, student.submissions.length + 5),
          needingAttention: rowTone === "attention" ? 15 : 0,
          workingTowards: rowTone === "working" ? 20 : 0,
          mastered: rowTone === "mastered" ? 25 : 0,
          assignments: student.submissions.map((sub) => ({
            id: sub.assignment.id,
            title: sub.assignment.title,
            dueDate: sub.assignment.dueDate.toISOString().slice(0, 10),
            score: sub.score,
            submitted: sub.status !== "PENDING",
          })),
        },
        "Student loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load student";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
