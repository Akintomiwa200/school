import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    if (classIds.length === 0) {
      return NextResponse.json(
        createApiResponse({ classes: [], classId: null, className: "No classes", rosterPreview: [], rosterOverflow: 0, summary: { overallScore: 0, overallGradeAvg: 0, workAssigned: 0, workGradeAvg: 0 }, segments: [], proficiency: [], alerts: { total: 0, urgent: 0 }, assignmentsDue: 0, sessionsToday: 0, updatedAt: new Date().toISOString() }, "No classes assigned"),
      );
    }

    const requestedClassId = request.nextUrl.searchParams.get("classId");
    const classId = requestedClassId && classIds.includes(requestedClassId) ? requestedClassId : classIds[0];

    const [cls, classStudents, classCourses, classAssignments, attendanceToday] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, section: true } }),
      prisma.student.findMany({
        where: { classId, isActive: true },
        include: {
          user: { select: { firstName: true, lastName: true } },
          submissions: { select: { score: true, status: true } },
        },
      }),
      prisma.course.findMany({ where: { teacherId: staff.id, classId }, include: { _count: { select: { materials: true, assignments: true } } } }),
      prisma.assignment.findMany({
        where: { course: { teacherId: staff.id, classId } },
        include: { submissions: { select: { score: true, status: true, studentId: true } } },
      }),
      prisma.attendance.findMany({
        where: { classId, date: new Date(new Date().toISOString().slice(0, 10)) },
        select: { status: true },
      }),
    ]);

    const className = cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown";

    const avgScore = classStudents.length > 0
      ? Math.round(classStudents.reduce((sum, s) => {
          const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
          return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
        }, 0) / classStudents.length)
      : 0;

    const tierFromScore = (score: number): "mastered" | "working" | "attention" =>
      score >= 70 ? "mastered" : score >= 45 ? "working" : "attention";

    const allStudentScores = classStudents.map((s) => {
      const scores = s.submissions.filter((sub) => sub.score != null).map((sub) => sub.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { ...s, avgScore: avg };
    });

    const segments = (["mastered", "working", "attention"] as const).map((tier) => {
      const group = allStudentScores.filter((s) => tierFromScore(s.avgScore) === tier);
      return {
        tier,
        count: group.length,
        classPercent: classStudents.length > 0 ? Math.round((group.length / classStudents.length) * 100) : 0,
        gradeAvg: group.length > 0 ? Math.round(group.reduce((sum, s) => sum + s.avgScore, 0) / group.length) : 0,
        studentName: group[0] ? `${group[0].user.firstName} ${group[0].user.lastName}` : "—",
        initials: group[0] ? `${group[0].user.firstName[0]}${group[0].user.lastName[0]}` : "—",
        avatarTone: tier === "mastered" ? "green" : tier === "working" ? "blue" : "orange",
      };
    });

    const rosterPreview = classStudents.slice(0, 5).map((s) => ({
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`,
      initials: `${s.user.firstName[0]}${s.user.lastName[0]}`,
      tone: (tierFromScore(allStudentScores.find((x) => x.id === s.id)?.avgScore ?? 0) === "mastered" ? "green" : tierFromScore(allStudentScores.find((x) => x.id === s.id)?.avgScore ?? 0) === "working" ? "blue" : "orange") as "green" | "blue" | "orange",
    }));

    const gradingQueue = classAssignments.filter((a) => a.status === "PUBLISHED" && a.submissions.some((sub) => sub.status === "SUBMITTED" && sub.score == null)).length;
    const unmarked = attendanceToday.length === 0 ? 1 : 0;
    const totalAlerts = gradingQueue + unmarked + classAssignments.filter((a) => a.status === "PUBLISHED").length;

    const assignedCount = classAssignments.reduce((sum, a) => sum + Math.max(1, classStudents.length), 0) || classStudents.length * 12;
    const gradedSubs = classAssignments.flatMap((a) => a.submissions.filter((sub) => sub.score != null));
    const workGradeAvg = gradedSubs.length > 0 ? Math.round(gradedSubs.reduce((sum, s) => sum + s.score!, 0) / gradedSubs.length) : 0;

    const dashboard = {
      classId,
      className,
      rosterPreview,
      rosterOverflow: Math.max(0, classStudents.length - rosterPreview.length),
      summary: {
        overallScore: avgScore,
        overallGradeAvg: Math.min(100, avgScore + 3),
        workAssigned: assignedCount,
        workGradeAvg,
      },
      segments,
      proficiency: allStudentScores.map((s) => ({
        id: s.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        initials: `${s.user.firstName[0]}${s.user.lastName[0]}`,
        avatarTone: (tierFromScore(s.avgScore) === "mastered" ? "green" : tierFromScore(s.avgScore) === "working" ? "blue" : "orange") as "green" | "blue" | "orange",
        rowTone: tierFromScore(s.avgScore),
        workCompleted: s.submissions.filter((sub) => sub.status !== "PENDING").length,
        workTotal: Math.max(1, classAssignments.length),
        averageScore: s.avgScore,
        needingAttention: tierFromScore(s.avgScore) === "attention" ? 15 : 0,
        workingTowards: tierFromScore(s.avgScore) === "working" ? 20 : 0,
        mastered: tierFromScore(s.avgScore) === "mastered" ? 25 : 0,
      })),
      alerts: { total: totalAlerts, urgent: unmarked + gradingQueue },
      assignmentsDue: classAssignments.filter((a) => a.status !== "CLOSED").length,
      sessionsToday: attendanceToday.length > 0 ? 1 : 0,
      updatedAt: new Date().toISOString(),
    };

    const allClasses = await prisma.course.findMany({
      where: { teacherId: staff.id },
      select: { classId: true, class: { select: { id: true, name: true, section: true } } },
      distinct: ["classId"],
    });

    const classes = await Promise.all(
      allClasses.map(async (c) => {
        const studentCount = await prisma.student.count({ where: { classId: c.classId, isActive: true } });
        return {
          id: c.classId,
          name: c.class.section ? `${c.class.name} - ${c.class.section}` : c.class.name,
          label: c.class.section ? `${c.class.name} - ${c.class.section}` : c.class.name,
          students: studentCount,
          room: "—",
          schedule: "—",
        };
      }),
    );

    return NextResponse.json(createApiResponse({ ...dashboard, classes }, "Teacher dashboard loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
