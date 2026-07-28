import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ classId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { classId } = await context.params;
    const classIds = await getTeacherClassIds(staff.id);
    const resolvedClassId = classIds.includes(classId) ? classId : classIds[0];

    if (!resolvedClassId) {
      return NextResponse.json(createApiError("not_found", "No classes assigned"), { status: 404 });
    }

    const [cls, students, assignments, materials] = await Promise.all([
      prisma.class.findUnique({ where: { id: resolvedClassId }, select: { id: true, name: true, section: true } }),
      prisma.student.findMany({
        where: { classId: resolvedClassId, isActive: true },
        include: {
          user: { select: { firstName: true, lastName: true } },
          submissions: { select: { score: true, status: true } },
        },
      }),
      prisma.assignment.findMany({
        where: { course: { teacherId: staff.id, classId: resolvedClassId } },
        select: { id: true, title: true, dueDate: true, status: true, _count: { select: { submissions: true } } },
        orderBy: { dueDate: "desc" },
      }),
      prisma.courseMaterial.findMany({
        where: { course: { classId: resolvedClassId } },
        include: { course: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const className = cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown";
    const tierFromScore = (score: number): "mastered" | "working" | "attention" =>
      score >= 70 ? "mastered" : score >= 45 ? "working" : "attention";

    const roster = students.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const rowTone = tierFromScore(avg);
      return {
        id: s.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        initials: `${s.user.firstName[0]}${s.user.lastName[0]}`,
        avatarTone: (rowTone === "mastered" ? "green" : rowTone === "working" ? "blue" : "orange") as "green" | "blue" | "orange",
        rowTone,
        studentId: s.admissionNumber,
        workCompleted: s.submissions.filter((sub) => sub.status !== "PENDING").length,
        workTotal: Math.max(1, assignments.length),
        averageScore: avg,
        needingAttention: rowTone === "attention" ? 15 : 0,
        workingTowards: rowTone === "working" ? 20 : 0,
        mastered: rowTone === "mastered" ? 25 : 0,
      };
    });

    return NextResponse.json(
      createApiResponse(
        {
          id: resolvedClassId,
          name: className,
          label: className,
          students: students.length,
          room: "—",
          schedule: "—",
          roster,
          assignments: assignments.map((a) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate.toISOString().slice(0, 10),
            status: a.status.toLowerCase(),
            submitted: a._count.submissions,
            total: students.length,
          })),
          materials: materials.map((m) => ({
            id: m.id,
            name: m.title,
            type: m.fileType,
            size: `${Math.round(m.fileSize / 1024)} KB`,
            sharedWith: className,
            uploaded: m.createdAt.toISOString().slice(0, 10),
          })),
        },
        "Class loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load class";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
