import { jsonData } from "@/lib/api/route-handlers";
import { STAFF_ROUTES } from "@/components/dashboard/staff/staff-data";

export async function GET() {
  return jsonData(STAFF_ROUTES, "Transport routes loaded");
}
