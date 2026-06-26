import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import {
  PARENT_ATTENDANCE_ALERTS,
  PARENT_ATTENDANCE_RECORDS,
  PARENT_CHILDREN,
  PARENT_DASHBOARD_STATS,
  PARENT_FEE_ITEMS,
  getParentFeeSummary,
} from "@/components/dashboard/parent/parent-data";

export async function GET() {
  return jsonData(
    {
      children: PARENT_CHILDREN,
      feeItems: PARENT_FEE_ITEMS,
      attendanceRecords: PARENT_ATTENDANCE_RECORDS,
      alerts: PARENT_ATTENDANCE_ALERTS,
      stats: PARENT_DASHBOARD_STATS,
      feeSummary: getParentFeeSummary(),
    },
    "Parent dashboard loaded",
  );
}
