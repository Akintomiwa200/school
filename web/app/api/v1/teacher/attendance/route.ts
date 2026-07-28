import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET() {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    const sessions = await prisma.attendance.findMany({
      where: { AND: [{ classId: { in: classIds } }, { classId: { not: null } }, { staffId: null }, { studentId: null }] },
      include: { class: { select: { name: true, section: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const grouped = new Map<string, { classId: string; className: string; date: string; records: typeof sessions }>();
    for (const s of sessions) {
      const key = `${s.classId!}-${s.date.toISOString().slice(0, 10)}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          classId: s.classId!,
          className: s.class ? (s.class.section ? `${s.class.name} - ${s.class.section}` : s.class.name) : "Unknown",
          date: s.date.toISOString().slice(0, 10),
          records: [],
        });
      }
      grouped.get(key)!.records.push(s);
    }

    const data = Array.from(grouped.values()).map((g) => {
      const present = g.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
      const absent = g.records.filter((r) => r.status === "ABSENT").length;
      return {
        id: `${g.classId}-${g.date}`,
        classId: g.classId,
        className: g.className,
        date: g.date,
        time: g.records[0]?.checkIn ? g.records[0].checkIn.toTimeString().slice(0, 5) : "09:00",
        marked: g.records.length > 0,
        present,
        absent,
        rosterSize: g.records.length || 30,
      };
    });

    return NextResponse.json(createApiResponse(data, "Attendance sessions loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load attendance";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const body = await request.json();

    if (!body.classId || !body.date || !body.time) {
      return NextResponse.json(createApiError("validation_error", "classId, date, and time are required"), { status: 400 });
    }

    const classIds = await getTeacherClassIds(staff.id);
    if (!classIds.includes(body.classId)) {
      return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
    }

    const students = await prisma.student.findMany({ where: { classId: body.classId, isActive: true }, select: { id: true } });

    const attendanceRecords = students.map((s) => ({
      studentId: s.id,
      classId: body.classId,
      date: new Date(body.date),
      status: "ABSENT" as const,
      markedBy: staff.id,
    }));

    await prisma.attendance.createMany({ data: attendanceRecords });

    const cls = await prisma.class.findUnique({ where: { id: body.classId }, select: { name: true, section: true } });

    return NextResponse.json(
      createApiResponse(
        {
          id: `${body.classId}-${body.date}`,
          classId: body.classId,
          className: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown",
          date: body.date,
          time: body.time,
          marked: false,
          present: 0,
          absent: 0,
          rosterSize: students.length,
        },
        "Attendance session created",
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
