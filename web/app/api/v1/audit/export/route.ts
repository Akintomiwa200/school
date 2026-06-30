import { NextRequest, NextResponse } from "next/server";
import { exportAuditEventsCsv } from "@/lib/api/audit-entity-store";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "finance";
  const csv = exportAuditEventsCsv(scope === "finance" ? "finance" : "platform");
  const filename = `finance-audit-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
