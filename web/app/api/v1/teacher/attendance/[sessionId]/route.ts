import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

type RouteContext = { params: Promise<{ sessionId: string }> };

function parseSessionId(sessionId: string) {
  const parts = sessionId.split("-");
  const datePart = parts[parts.length - 1];
  if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const classId = parts.slice(0, parts.length - 1).join("-");
    return { classId, date: datePart };
  }
  return { classId: sessionId, date: new Date().toISOString().slice(0, 10) };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { sessionId } = await context.params;
    const classIds = await getTeacherClassIds(staff.id);
    const { classId, date } = parseSessionId(sessionId);

    if (!classIds.includes(classId)) {
      return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
        attendances: { where: { date: new Date(date) }, select: { status: true } },
      },
    });

    const cls = await prisma.class.findUnique({ where: { id: classId }, select: { name: true, section: true } });
    const records = students.map((s) => {
      const att = s.attendances[0];
      let status: "present" | "absent" | "late" | "unmarked" = "unmarked";
      if (att) {
        if (att.status === "PRESENT") status = "present";
        else if (att.status === "ABSENT") status = "absent";
        else if (att.status === "LATE") status = "late";
      }
      return { studentId: s.id, studentName: `${s.user.firstName} ${s.user.lastName}`, status };
    });

    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;

    return NextResponse.json(
      createApiResponse(
        {
          id: sessionId,
          classId,
          className: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown",
          date,
          time: "09:00",
          marked: records.some((r) => r.status !== "unmarked"),
          present,
          absent,
          rosterSize: records.length,
          records,
        },
        "Attendance session loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load session";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { staff } = await getTeacherContext();
    const { sessionId } = await context.params;
    const classIds = await getTeacherClassIds(staff.id);
    const { classId, date } = parseSessionId(sessionId);

    if (!classIds.includes(classId)) {
      return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
    }

    const body = await request.json();

    if (Array.isArray(body.records)) {
      for (const record of body.records) {
        const statusMap: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {
          present: "PRESENT",
          absent: "ABSENT",
          late: "LATE",
        };
        const prismaStatus = statusMap[record.status];
        if (prismaStatus) {
          const existing = await prisma.attendance.findFirst({
            where: { studentId: record.studentId, date: new Date(date), classId },
          });
          if (existing) {
            await prisma.attendance.update({ where: { id: existing.id }, data: { status: prismaStatus, markedBy: staff.id } });
          } else {
            await prisma.attendance.create({
              data: { studentId: record.studentId, classId, date: new Date(date), status: prismaStatus, markedBy: staff.id },
            });
          }
        }
      }
    }

    return GET(request, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save attendance";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
