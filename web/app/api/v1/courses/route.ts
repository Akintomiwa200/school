import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export async function GET() {
  try {
    const { staff } = await getTeacherContext();
    const classIds = await getTeacherClassIds(staff.id);

    const classes = await Promise.all(
      classIds.map(async (classId) => {
        const cls = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, section: true } });
        const studentCount = await prisma.student.count({ where: { classId, isActive: true } });
        return { id: classId, name: cls ? (cls.section ? `${cls.name} - ${cls.section}` : cls.name) : "Unknown", students: studentCount, room: "—", schedule: "—" };
      }),
    );

    const courses = await prisma.course.findMany({
      where: { teacherId: staff.id },
      include: { class: { select: { name: true, section: true } } },
    });

    const courseData = await Promise.all(
      courses.map(async (c) => {
        const studentCount = await prisma.student.count({ where: { classId: c.classId, isActive: true } });
        return { id: c.id, title: c.title, classId: c.classId, className: c.class.section ? `${c.class.name} - ${c.class.section}` : c.class.name, lessons: 12, students: studentCount, progress: c.status === "PUBLISHED" ? 75 : 25 };
      }),
    );

    return NextResponse.json(createApiResponse({ classes, courses: courseData }, "Courses loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load courses";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}
