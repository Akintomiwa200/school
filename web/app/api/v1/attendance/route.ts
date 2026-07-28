import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get("scope") ?? "teacher";
    if (scope === "parent" || scope === "staff") {
      return NextResponse.json(createApiResponse([], "Attendance loaded"));
    }

    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    const sessions = await prisma.attendance.findMany({
      where: { AND: [{ classId: { in: classIds } }, { classId: { not: null } }, { studentId: { not: null } }] },
      include: { class: { select: { name: true, section: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const grouped = new Map<string, { classId: string; className: string; date: string; records: typeof sessions }>();
    for (const s of sessions) {
      const key = `${s.classId!}-${s.date.toISOString().slice(0, 10)}`;
      if (!grouped.has(key)) {
        grouped.set(key, { classId: s.classId!, className: s.class ? (s.class.section ? `${s.class.name} - ${s.class.section}` : s.class.name) : "Unknown", date: s.date.toISOString().slice(0, 10), records: [] });
      }
      grouped.get(key)!.records.push(s);
    }

    const data = Array.from(grouped.values()).map((g) => ({
      id: `${g.classId}-${g.date}`,
      classId: g.classId,
      className: g.className,
      date: g.date,
      time: "09:00",
      marked: g.records.length > 0,
      present: g.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      absent: g.records.filter((r) => r.status === "ABSENT").length,
      rosterSize: g.records.length,
    }));

    return NextResponse.json(createApiResponse(data, "Teacher attendance loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load attendance";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
