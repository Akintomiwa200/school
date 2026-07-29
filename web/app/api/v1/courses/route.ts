import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

function mapCourseStatus(status: string): "draft" | "in_progress" | "published" {
  if (status === "PUBLISHED") return "published";
  if (status === "ARCHIVED") return "draft";
  return "draft";
}

function computeProgress(materialCount: number, assignmentCount: number, status: string): number {
  const total = materialCount + assignmentCount;
  if (status === "PUBLISHED" && total === 0) return 100;
  if (total === 0) return 0;
  return Math.min(100, Math.round((total / Math.max(total, 4)) * 100));
}

export async function GET() {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    if (classIds.length === 0) {
      const mockClasses = [{ id: "mock-class", name: "Grade 10 - A", students: 5, room: "Room 101", schedule: "Mon-Fri 09:00" }];
      const mockCourses = [
        { id: "mock-math", title: "Grade 10 Mathematics", classId: "mock-class", className: "Grade 10 - A", modules: 4, lessons: 12, students: 5, progress: 75, status: "published" as const, lastUpdated: new Date().toISOString() },
        { id: "mock-sci", title: "Grade 10 General Science", classId: "mock-class", className: "Grade 10 - A", modules: 3, lessons: 8, students: 5, progress: 50, status: "published" as const, lastUpdated: new Date().toISOString() },
        { id: "mock-eng", title: "Grade 10 English Literature", classId: "mock-class", className: "Grade 10 - A", modules: 1, lessons: 4, students: 5, progress: 25, status: "draft" as const, lastUpdated: new Date().toISOString() },
      ];
      const mockSubjects = [
        { id: "mock-subj-math", name: "Mathematics", code: "MATH10", classId: "mock-class" },
        { id: "mock-subj-sci", name: "Science", code: "SCI10", classId: "mock-class" },
        { id: "mock-subj-eng", name: "English", code: "ENG10", classId: "mock-class" },
      ];
      return NextResponse.json(createApiResponse({ classes: mockClasses, courses: mockCourses, subjects: mockSubjects }, "Courses loaded (mock)"));
    }

    const classes = await Promise.all(
      classIds.map(async (classId) => {
        const cls = await prisma.class.findUnique({
          where: { id: classId },
          select: { id: true, name: true, section: true },
        });
        const studentCount = await prisma.student.count({ where: { classId, isActive: true } });
        const timetableEntry = await prisma.timetable.findFirst({
          where: { teacherId: staff.id, classId },
          orderBy: { dayOfWeek: "asc" },
          select: { room: true, startTime: true, endTime: true, dayOfWeek: true },
        });
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const schedule = timetableEntry
          ? `${dayNames[timetableEntry.dayOfWeek] ?? ""} ${timetableEntry.startTime}–${timetableEntry.endTime}`
          : "—";
        return {
          id: classId,
          name: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown",
          students: studentCount,
          room: timetableEntry?.room ?? "—",
          schedule,
        };
      }),
    );

    const subjects = await prisma.subject.findMany({
      where: { classId: { in: classIds } },
      select: { id: true, name: true, code: true, classId: true },
      orderBy: { name: "asc" },
    });

    const courses = await prisma.course.findMany({
      where: { teacherId: staff.id },
      include: { class: { select: { name: true, section: true } } },
      orderBy: { updatedAt: "desc" },
    });

    const courseData = await Promise.all(
      courses.map(async (c) => {
        const [studentCount, materialCount, assignmentCount] = await Promise.all([
          prisma.student.count({ where: { classId: c.classId, isActive: true } }),
          prisma.courseMaterial.count({ where: { courseId: c.id } }),
          prisma.assignment.count({ where: { courseId: c.id } }),
        ]);
        const totalContent = materialCount + assignmentCount;
        const progress = computeProgress(materialCount, assignmentCount, c.status);
        const status = mapCourseStatus(c.status);
        return {
          id: c.id,
          title: c.title,
          classId: c.classId,
          className: c.class.section ? `${c.class.name} - ${c.class.section}` : c.class.name,
          modules: materialCount,
          lessons: assignmentCount,
          students: studentCount,
          progress,
          status: totalContent > 0 && status === "draft" ? "in_progress" : status,
          lastUpdated: c.updatedAt.toISOString(),
        };
      }),
    );

    return NextResponse.json(createApiResponse({ classes, courses: courseData, subjects }, "Courses loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load courses";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await getTeacherContext();
    const body = await request.json();

    if (!body.title?.trim() || !body.classId) {
      return NextResponse.json(createApiError("validation_error", "title and classId are required"), { status: 400 });
    }

    const classIds = await getTeacherClassIds(staff.id);
    if (!classIds.includes(body.classId)) {
      return NextResponse.json(createApiError("not_found", "Class not found"), { status: 404 });
    }

    let subjectId = body.subjectId as string | undefined;
    if (!subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { classId: body.classId },
        orderBy: { name: "asc" },
      });
      if (!subject) {
        return NextResponse.json(createApiError("not_found", "No subject found for this class"), { status: 404 });
      }
      subjectId = subject.id;
    }

    const existing = await prisma.course.findFirst({
      where: { teacherId: staff.id, classId: body.classId, subjectId },
    });
    if (existing) {
      return NextResponse.json(createApiError("conflict", "A course already exists for this class and subject"), { status: 409 });
    }

    const course = await prisma.course.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim(),
        subjectId,
        classId: body.classId,
        teacherId: staff.id,
        status: "DRAFT",
      },
      include: { class: { select: { name: true, section: true } } },
    });

    const studentCount = await prisma.student.count({ where: { classId: body.classId, isActive: true } });

    return NextResponse.json(
      createApiResponse(
        {
          id: course.id,
          title: course.title,
          classId: course.classId,
          className: course.class.section ? `${course.class.name} - ${course.class.section}` : course.class.name,
          modules: 0,
          lessons: 0,
          students: studentCount,
          progress: 0,
          status: "draft",
          lastUpdated: course.updatedAt.toISOString(),
        },
        "Course created",
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create course";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
