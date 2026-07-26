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

    const timetable = await prisma.timetable.findMany({
      where: { classId: student.classId },
      include: {
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const result = timetable.map((t) => ({
      id: t.id,
      subject: t.subject.name,
      subjectCode: t.subject.code,
      dayOfWeek: t.dayOfWeek,
      dayName: dayNames[t.dayOfWeek] ?? "",
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room,
    }));

    return NextResponse.json(createApiResponse(result, "Student timetable loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("timetable_error", error instanceof Error ? error.message : "Failed to load timetable"),
      { status: 500 },
    );
  }
}
