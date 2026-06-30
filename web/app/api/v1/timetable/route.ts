import { jsonData } from "@/lib/api/route-handlers";
import { listTeacherTimetable } from "@/lib/api/teacher-entity-store";

export async function GET() {
  return jsonData(listTeacherTimetable(), "Timetable loaded");
}
