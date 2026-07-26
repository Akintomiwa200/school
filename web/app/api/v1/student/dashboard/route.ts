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
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true, phone: true } },
        class: {
          include: {
            subjects: true,
            timetables: {
              include: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const subjectIds = student.class.subjects.map((s) => s.id);
    const teacherIds = student.class.subjects.filter((s) => s.teacherId).map((s) => s.teacherId!);

    const [teachers, grades, attendanceRecords, events, pendingSubmissions, unreadCount, recentAnnouncements] =
      await Promise.all([
        teacherIds.length > 0
          ? prisma.staff.findMany({
              where: { id: { in: teacherIds }, isActive: true },
              include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
            })
          : [],
        prisma.grade.findMany({
          where: { studentId: student.id, ...(subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {}) },
          include: { subject: { select: { name: true, code: true } } },
        }),
        prisma.attendance.findMany({
          where: { studentId: student.id },
          orderBy: { date: "desc" },
          take: 90,
        }),
        prisma.event.findMany({
          where: { isPublic: true, startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 5,
        }),
        prisma.assignmentSubmission.findMany({
          where: { studentId: student.id, status: "PENDING" },
          include: {
            assignment: {
              include: { course: { select: { title: true } } },
            },
          },
          take: 10,
        }),
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
        prisma.announcement.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { author: { select: { firstName: true, lastName: true } } },
        }).then((all) =>
          all.filter((a) => {
            if (a.targetRoles === null) return true;
            try {
              const roles = Array.isArray(a.targetRoles) ? a.targetRoles : JSON.parse(String(a.targetRoles));
              return Array.isArray(roles) && roles.includes("STUDENT");
            } catch {
              return true;
            }
          }).slice(0, 3),
        ),
      ]);

    const totalClasses = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const absentDays = attendanceRecords.filter((r) => r.status === "ABSENT").length;
    const lateDays = attendanceRecords.filter((r) => r.status === "LATE").length;
    const attendanceRate = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 100;

    const subjectPerformance = student.class.subjects.map((subject) => {
      const subjectGrades = grades.filter((g) => g.subjectId === subject.id);
      const avgScore =
        subjectGrades.length > 0
          ? Math.round(
              subjectGrades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) /
                subjectGrades.length,
            )
          : 0;
      return { id: subject.id, name: subject.name, code: subject.code, score: avgScore };
    });

    const timetable = student.class.timetables.map((t) => ({
      id: t.id,
      subject: t.subject.name,
      subjectCode: t.subject.code,
      dayOfWeek: t.dayOfWeek,
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room,
    }));

    const linkedTeachers = teachers.map((t) => ({
      id: t.id,
      name: `${t.user.firstName} ${t.user.lastName}`,
      avatar: t.user.avatar,
      department: t.department,
      designation: t.designation,
      initials: `${t.user.firstName[0]}${t.user.lastName[0]}`.toUpperCase(),
    }));

    return NextResponse.json(
      createApiResponse(
        {
          student: {
            id: student.id,
            admissionNumber: student.admissionNumber,
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            email: student.user.email,
            avatar: student.user.avatar,
            phone: student.user.phone,
            className: student.class.name,
            classSection: student.class.section,
            bloodGroup: student.bloodGroup,
            dateOfAdmission: student.dateOfAdmission,
          },
          subjects: student.class.subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
          teachers: linkedTeachers,
          performance: subjectPerformance,
          attendance: { totalClasses, present: presentDays, absent: absentDays, late: lateDays, rate: attendanceRate },
          timetable,
          events: events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            startDate: e.startDate,
            endDate: e.endDate,
            location: e.location,
          })),
          pendingAssignments: pendingSubmissions.map((s) => ({
            id: s.id,
            assignmentTitle: s.assignment.title,
            courseTitle: s.assignment.course.title,
            dueDate: s.assignment.dueDate,
          })),
          unreadNotificationCount: unreadCount,
          recentAnnouncements: recentAnnouncements.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            author: `${a.author.firstName} ${a.author.lastName}`,
            createdAt: a.createdAt,
            isPinned: a.isPinned,
          })),
        },
        "Student dashboard loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("dashboard_error", error instanceof Error ? error.message : "Failed to load dashboard"),
      { status: 500 },
    );
  }
}
