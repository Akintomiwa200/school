import { jsonData } from "@/lib/api/route-handlers";
import { getTeacherClassesOverview } from "@/lib/api/teacher-entity-store";

export async function GET() {
  return jsonData(getTeacherClassesOverview(), "Classes overview loaded");
}
