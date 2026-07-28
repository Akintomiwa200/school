import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET() {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    const courses = await prisma.course.findMany({
      where: { teacherId: staff.id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        subject: { select: { name: true } },
        assignments: { orderBy: { dueDate: "asc" } },
        _count: { select: { materials: true, assignments: true } },
      },
    });

    const courseCards = await Promise.all(
      courses.map(async (course, index) => {
        const studentCount = await prisma.student.count({ where: { classId: course.classId, isActive: true } });
        const tones = ["purple", "green", "pink", "orange"] as const;
        return {
          id: course.id,
          classId: course.classId,
          title: `${course.title} — ${course.subject.name}`,
          students: studentCount,
          modules: 1,
          lessons: course._count.assignments + course._count.materials,
          materials: course._count.materials,
          assignments: course._count.assignments,
          progress: course.status === "PUBLISHED" ? 75 : course.status === "ARCHIVED" ? 100 : 25,
          tone: tones[index % tones.length],
        };
      }),
    );

    const allStudents = await prisma.student.findMany({
      where: { classId: { in: classIds }, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
        submissions: { select: { score: true } },
      },
    });

    const studentsWithAvg = allStudents.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      return { ...s, avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0 };
    });

    const rankBadges = ["gold", "silver", "bronze", "rose"] as const;
    const bestPerformers = studentsWithAvg
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 4)
      .map((student, index) => ({
        rank: index + 1,
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        initials: `${student.user.firstName[0]}${student.user.lastName[0]}`,
        avatarTone: (student.avgScore >= 70 ? "green" : student.avgScore >= 45 ? "blue" : "orange") as "green" | "blue" | "orange",
        classId: student.classId,
        courses: courses.filter((c) => c.classId === student.classId).length,
        assignments: student.submissions.length,
        hours: Math.round(student.submissions.length * 3.6 + 120),
        quiz: Math.min(100, Math.round(student.avgScore * 0.35)),
        points: student.avgScore,
        trend: index === 0 || index === 2 ? ("up" as const) : ("down" as const),
        badge: rankBadges[index] ?? "default",
      }));

    const now = Date.now();
    const assignmentFeed = courses.flatMap((course) =>
      course.assignments.map((a) => ({ ...a, className: course.class.section ? `${course.class.name} - ${course.class.section}` : course.class.name })),
    )
      .filter((a) => a.status !== "CLOSED")
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 4)
      .map((assignment, index) => {
        const feedTones = ["pink", "blue", "green", "yellow"] as const;
        const hoursLeft = Math.max(1, Math.round((assignment.dueDate.getTime() - now) / 3_600_000));
        return {
          id: assignment.id,
          title: assignment.title,
          className: assignment.className,
          status: hoursLeft <= 48 ? `Pending (${hoursLeft} Hours Remaining)` : `Due ${assignment.dueDate.toISOString().slice(0, 10)}`,
          tone: feedTones[index % feedTones.length],
        };
      });

    return NextResponse.json(
      createApiResponse({
        courseCards,
        bestPerformers,
        assignments: assignmentFeed,
        classCount: new Set(classIds).size,
        studentCount: allStudents.length,
      }, "Classes overview loaded"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load overview";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
