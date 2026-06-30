import { NextRequest } from "next/server";
import { jsonList } from "@/lib/api/route-handlers";
import { getMutableAuditEvents } from "@/lib/api/audit-entity-store";
import { PLATFORM_AUDIT } from "@/components/dashboard/super-admin/super-admin-entities-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "platform";

  if (scope === "finance") {
    return jsonList(getMutableAuditEvents(), "Audit log loaded", request, [
      "actor",
      "reference",
      "details",
      "action",
    ]);
  }

  return jsonList(PLATFORM_AUDIT, "Audit log loaded", request, ["actor", "target", "action", "school"]);
}
