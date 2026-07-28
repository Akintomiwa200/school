import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function getTeacherContext() {
  const user = await requireAuth();
  const staff = await prisma.staff.findUnique({ where: { userId: user.id } });
  if (!staff) throw new Error("No staff record found for this user");
  return { user, staff };
}

export async function getTeacherClassIds(staffId: string) {
  const courses = await prisma.course.findMany({
    where: { teacherId: staffId },
    select: { classId: true },
    distinct: ["classId"],
  });
  return courses.map((c) => c.classId);
}

export async function getTeacherSubjects(staffId: string) {
  const courses = await prisma.course.findMany({
    where: { teacherId: staffId },
    select: { subjectId: true, classId: true },
    distinct: ["subjectId"],
  });
  return courses;
}
