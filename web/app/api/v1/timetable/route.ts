import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET() {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    const timetables = await prisma.timetable.findMany({
      where: { teacherId: staff.id, classId: { in: classIds } },
      include: { subject: { select: { name: true } }, class: { select: { name: true, section: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const dayMap = new Map<string, { time: string; subject: string; room: string; classId: string }[]>();
    for (const t of timetables) {
      const dayName = DAY_NAMES[t.dayOfWeek] ?? `Day ${t.dayOfWeek}`;
      if (!dayMap.has(dayName)) dayMap.set(dayName, []);
      dayMap.get(dayName)!.push({ time: `${t.startTime}-${t.endTime}`, subject: t.subject.name, room: t.room ?? "—", classId: t.classId });
    }

    const data = DAY_NAMES.filter((d) => dayMap.has(d)).map((day) => ({ day, periods: dayMap.get(day)! }));

    return NextResponse.json(createApiResponse(data, "Timetable loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load timetable";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
