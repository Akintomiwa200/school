import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse } from "@/shared";

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get("start");
  const endDate = request.nextUrl.searchParams.get("end");

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const hasDateFilter = Object.keys(dateFilter).length > 0;

  const [events, timetable, announcements] = await Promise.all([
    prisma.event.findMany({
      where: hasDateFilter ? { startDate: dateFilter } : undefined,
      orderBy: { startDate: "asc" },
      take: 100,
    }),
    prisma.timetable.findMany({
      orderBy: { dayOfWeek: "asc" },
      take: 100,
      include: { subject: { select: { name: true } } },
    }),
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
    })),
    ...announcements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.content.slice(0, 100),
      type: "event" as const,
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
}
