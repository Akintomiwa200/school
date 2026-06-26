import { jsonData } from "@/lib/api/route-handlers";
import { STAFF_HOSTEL_ROOMS } from "@/components/dashboard/staff/staff-data";

export async function GET() {
  return jsonData(STAFF_HOSTEL_ROOMS, "Hostel rooms loaded");
}
