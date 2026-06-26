import { NextRequest } from "next/server";
import { jsonList } from "@/lib/api/route-handlers";
import { ADMIN_REPORTS } from "@/components/dashboard/admin/admin-entities-data";

export async function GET(request: NextRequest) {
  return jsonList(ADMIN_REPORTS, "Reports loaded", request, ["name", "description"]);
}
