import { jsonData } from "@/lib/api/route-handlers";
import { TEACHER_CLASSES, TEACHER_COURSES } from "@/components/dashboard/teacher/teacher-data";

export async function GET() {
  return jsonData({ classes: TEACHER_CLASSES, courses: TEACHER_COURSES }, "Courses loaded");
}
