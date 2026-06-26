import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { PARENT_ATTENDANCE_ALERTS, PARENT_ATTENDANCE_RECORDS } from "@/components/dashboard/parent/parent-data";
import { STAFF_ATTENDANCE } from "@/components/dashboard/staff/staff-data";
import { TEACHER_ATTENDANCE_SESSIONS } from "@/components/dashboard/teacher/teacher-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "teacher";

  if (scope === "parent") {
    return jsonData(
      { records: PARENT_ATTENDANCE_RECORDS, alerts: PARENT_ATTENDANCE_ALERTS },
      "Parent attendance loaded",
    );
  }

  if (scope === "staff") {
    return jsonData(STAFF_ATTENDANCE, "Staff attendance loaded");
  }

  return jsonData(TEACHER_ATTENDANCE_SESSIONS, "Teacher attendance loaded");
}
