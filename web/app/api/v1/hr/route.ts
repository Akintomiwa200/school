import { jsonData } from "@/lib/api/route-handlers";
import { HR_EMPLOYEES, HR_LEAVE_REQUESTS, HR_RECRUITMENT, HR_DASHBOARD_STATS } from "@/components/dashboard/hr/hr-data";

export async function GET() {
  return jsonData(
    {
      stats: HR_DASHBOARD_STATS,
      employees: HR_EMPLOYEES,
      leaveRequests: HR_LEAVE_REQUESTS,
      recruitment: HR_RECRUITMENT,
    },
    "HR data loaded",
  );
}
