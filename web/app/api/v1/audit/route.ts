import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { AUDIT_EVENTS } from "@/components/dashboard/accountant/accountant-data";
import { PLATFORM_AUDIT } from "@/components/dashboard/super-admin/super-admin-entities-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "platform";
  const data = scope === "finance" ? AUDIT_EVENTS : PLATFORM_AUDIT;
  return jsonData(data, "Audit log loaded");
}
