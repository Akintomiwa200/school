import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";
import { getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const startDate = request.nextUrl.searchParams.get("start");
    const endDate = request.nextUrl.searchParams.get("end");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    let timetableWhere: Record<string, unknown> = {};
    let classIds: string[] = [];

    if (user.role === UserRole.TEACHER) {
      const staff = await prisma.staff.findUnique({ where: { userId: user.id } });
      if (staff) {
        classIds = await getTeacherClassIds(staff.id);
        timetableWhere = { teacherId: staff.id, classId: { in: classIds } };
      }
    } else if (user.role === UserRole.STUDENT) {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student?.classId) {
        classIds = [student.classId];
        timetableWhere = { classId: student.classId };
      }
    }

    const [events, timetable, announcements] = await Promise.all([
      prisma.event.findMany({
        where: {
          isPublic: true,
          ...(hasDateFilter ? { startDate: dateFilter } : {}),
        },
        orderBy: { startDate: "asc" },
        take: 100,
      }),
      Object.keys(timetableWhere).length > 0
        ? prisma.timetable.findMany({
            where: timetableWhere,
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            take: 100,
            include: { subject: { select: { name: true } }, class: { select: { id: true } } },
          })
        : Promise.resolve([]),
      prisma.announcement.findMany({
        where: hasDateFilter ? { publishedAt: dateFilter } : undefined,
        orderBy: { publishedAt: "desc" },
        take: 20,
        include: { author: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const entries = [
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? "",
        type: "event" as const,
        date: e.startDate.toISOString().split("T")[0],
        startTime: e.startDate.toTimeString().slice(0, 5),
        endTime: e.endDate.toTimeString().slice(0, 5),
        location: e.location ?? "",
      })),
      ...timetable.map((t) => ({
        id: t.id,
        title: t.subject.name,
        description: `Room ${t.room ?? "TBD"}`,
        type: "class" as const,
        date: "",
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.room ?? "",
        dayOfWeek: t.dayOfWeek,
        classId: t.classId,
      })),
      ...announcements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.content.slice(0, 100),
        type: "announcement" as const,
        date: a.publishedAt.toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        location: "",
      })),
    ];

    const stats = {
      totalEvents: events.length,
      upcomingEvents: events.filter((e) => e.startDate > new Date()).length,
      totalClasses: timetable.length,
      recentAnnouncements: announcements.length,
    };

    return NextResponse.json(createApiResponse({ entries, stats }, "Calendar loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load calendar";
    return NextResponse.json(createApiError("error", message), { status: 500 });
  }
}
