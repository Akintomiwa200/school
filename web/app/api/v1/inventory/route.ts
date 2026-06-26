import { jsonData } from "@/lib/api/route-handlers";
import { STAFF_INVENTORY } from "@/components/dashboard/staff/staff-data";

export async function GET() {
  return jsonData(STAFF_INVENTORY, "Inventory loaded");
}
