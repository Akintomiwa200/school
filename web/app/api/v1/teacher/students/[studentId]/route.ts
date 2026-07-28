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
          include: {
            assignment: {
              select: { id: true, title: true, dueDate: true, maxScore: true, courseId: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        grades: {
          include: { subject: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        attendances: {
          select: { status: true, date: true },
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student not found"), { status: 404 });
    }

    const className = student.class.section ? `${student.class.name} - ${student.class.section}` : student.class.name;
    const scores = student.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const totalAttended = student.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const totalAttendance = student.attendances.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((totalAttended / totalAttendance) * 100) : 100;

    const recentGrades = student.grades.map((g) => ({
      subject: g.subject.name,
      score: Number(g.score),
      maxScore: Number(g.maxScore),
      term: g.term,
      grade: g.grade,
      remarks: g.remarks,
    }));

    const subjectAverages = recentGrades.reduce(
      (acc, g) => {
        if (!acc[g.subject]) acc[g.subject] = { total: 0, count: 0 };
        acc[g.subject]!.total += g.score;
        acc[g.subject]!.count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const subjectBreakdown = Object.entries(subjectAverages).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count),
    }));

    const submitted = student.submissions.filter((sub) => sub.status !== "PENDING").length;
    const graded = student.submissions.filter((sub) => sub.status === "GRADED" && sub.score != null).length;
    const pendingGrade = student.submissions.filter((sub) => sub.status === "SUBMITTED" || sub.status === "LATE").length;

    const recentAttendance = student.attendances.slice(0, 7).map((a) => ({
      status: a.status,
      date: a.date.toISOString().slice(0, 10),
    }));

    return NextResponse.json(
      createApiResponse(
        {
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          initials: `${student.user.firstName[0]}${student.user.lastName[0]}`,
          avatarTone: (avg >= 70 ? "green" : avg >= 45 ? "blue" : "orange") as "green" | "blue" | "orange",
          classId: student.classId,
          className,
          studentId: student.admissionNumber,
          email: student.user.email,
          phone: student.user.phone,
          averageScore: avg,
          workCompleted: submitted,
          workTotal: Math.max(submitted, student.submissions.length),
          attendanceRate,
          graded,
          pendingGrade,
          subjectBreakdown,
          recentAttendance,
          assignments: student.submissions.map((sub) => ({
            id: sub.assignment.id,
            title: sub.assignment.title,
            dueDate: sub.assignment.dueDate.toISOString().slice(0, 10),
            score: sub.score,
            maxScore: sub.assignment.maxScore,
            submitted: sub.status !== "PENDING",
            status: sub.status,
          })),
          recentGrades: recentGrades.slice(0, 10),
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
