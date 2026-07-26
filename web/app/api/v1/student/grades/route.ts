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

    const grades = await prisma.grade.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: student.id },
      include: {
        assignment: {
          include: {
            course: {
              include: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = await prisma.course.findMany({
      where: { classId: student.classId, status: { not: "DRAFT" } },
      include: { subject: { select: { name: true, code: true } } },
    });

    const courseGrades = courses.map((course) => {
      const courseSubmissions = submissions.filter((s) => s.assignment.courseId === course.id);
      const graded = courseSubmissions.filter((s) => s.status === "GRADED" && s.score !== null);
      const subjectGrade = grades.find((g) => g.subjectId === course.subjectId);

      let percentage: number | null = null;
      if (subjectGrade) {
        percentage = Math.round((Number(subjectGrade.score) / Number(subjectGrade.maxScore)) * 100);
      } else if (graded.length > 0) {
        const totalMax = graded.reduce((sum, s) => sum + (s.assignment.maxScore || 100), 0);
        const totalScore = graded.reduce((sum, s) => sum + (s.score ?? 0), 0);
        percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
      }

      const letterGrade = percentage !== null
        ? percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F"
        : null;

      return {
        courseId: course.id,
        courseName: course.title,
        subject: course.subject.name,
        subjectCode: course.subject.code,
        letterGrade,
        percentage,
        totalSubmissions: courseSubmissions.length,
        gradedSubmissions: graded.length,
      };
    });

    const totalGraded = courseGrades.filter((g) => g.letterGrade).length;
    const avgPercentage =
      totalGraded > 0
        ? Math.round(
            courseGrades.filter((g) => g.percentage !== null).reduce((sum, g) => sum + (g.percentage ?? 0), 0) /
              totalGraded,
          )
        : 0;

    const gpa =
      totalGraded > 0
        ? Number(
            (
              courseGrades.filter((g) => g.percentage !== null).reduce((sum, g) => {
                const pct = g.percentage ?? 0;
                const points = pct >= 90 ? 4.0 : pct >= 80 ? 3.0 : pct >= 70 ? 2.0 : pct >= 60 ? 1.0 : 0;
                return sum + points;
              }, 0) / totalGraded
            ).toFixed(2),
          )
        : 0;

    const recentAssessments = submissions.slice(0, 10).map((s) => ({
      id: s.id,
      title: s.assignment.title,
      courseName: s.assignment.course.title,
      subject: s.assignment.course.subject.name,
      score: s.score,
      maxScore: s.assignment.maxScore,
      status: s.status?.toLowerCase() ?? "pending",
      feedback: s.feedback,
      submittedAt: s.submittedAt,
      gradedAt: s.gradedAt,
    }));

    return NextResponse.json(
      createApiResponse(
        {
          courseGrades,
          summary: {
            gpa,
            averageScore: avgPercentage,
            totalCourses: courses.length,
            gradedCourses: totalGraded,
          },
          recentAssessments,
        },
        "Student grades loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("grades_error", error instanceof Error ? error.message : "Failed to load grades"),
      { status: 500 },
    );
  }
}
