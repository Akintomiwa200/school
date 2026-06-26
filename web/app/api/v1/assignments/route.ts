import { jsonData } from "@/lib/api/route-handlers";
import { TEACHER_ASSIGNMENTS } from "@/components/dashboard/teacher/teacher-data";

export async function GET() {
  return jsonData(TEACHER_ASSIGNMENTS, "Assignments loaded");
}
