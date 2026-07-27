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

    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const achievements = await prisma.readingAchievement.findMany({
      where: { studentId: student.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const result = achievements.map((a) => ({
      id: a.id,
      title: a.title,
      avatarUrl: a.avatarUrl,
      progress: a.progress,
      daysLeft: a.daysLeft,
      goal: a.goal,
    }));

    return NextResponse.json(createApiResponse(result, "Achievements loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to load achievements"),
      { status: 500 },
    );
  }
}
