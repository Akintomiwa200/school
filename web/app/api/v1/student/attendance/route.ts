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

    const records = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: "desc" },
      include: {
        class: { select: { name: true } },
      },
    });

    const totalClasses = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;
    const halfDay = records.filter((r) => r.status === "HALF_DAY").length;
    const attendanceRate = totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 100;

    const monthlyData: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    for (const record of records) {
      const monthKey = record.date.toISOString().slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      monthlyData[monthKey].total++;
      if (record.status === "PRESENT") monthlyData[monthKey].present++;
      else if (record.status === "ABSENT") monthlyData[monthKey].absent++;
      else if (record.status === "LATE") monthlyData[monthKey].late++;
    }

    const formattedRecords = records.map((r) => ({
      id: r.id,
      date: r.date.toISOString().slice(0, 10),
      status: r.status.toLowerCase(),
      className: r.class?.name ?? "",
      checkIn: r.checkIn?.toISOString() ?? null,
      checkOut: r.checkOut?.toISOString() ?? null,
      remarks: r.remarks,
    }));

    return NextResponse.json(
      createApiResponse(
        {
          records: formattedRecords,
          stats: { totalClasses, present, absent, late, excused, halfDay, attendanceRate },
          monthlyData,
        },
        "Student attendance loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("attendance_error", error instanceof Error ? error.message : "Failed to load attendance"),
      { status: 500 },
    );
  }
}
