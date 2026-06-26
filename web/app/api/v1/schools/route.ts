import { NextRequest } from "next/server";
import { jsonList } from "@/lib/api/route-handlers";
import { PLATFORM_SCHOOLS } from "@/components/dashboard/super-admin/super-admin-entities-data";

export async function GET(request: NextRequest) {
  return jsonList(PLATFORM_SCHOOLS, "Schools loaded", request, ["name", "location"]);
}
