import { jsonData } from "@/lib/api/route-handlers";
import { listTeacherCourses } from "@/lib/api/teacher-entity-store";

export async function GET() {
  return jsonData(listTeacherCourses(), "Courses loaded");
}
