import { jsonData } from "@/lib/api/route-handlers";
import { TEACHER_TIMETABLE } from "@/components/dashboard/teacher/teacher-data";

export async function GET() {
  return jsonData(TEACHER_TIMETABLE, "Timetable loaded");
}
