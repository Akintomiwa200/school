import { NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { getAuditStats } from "@/lib/api/audit-entity-store";

export async function GET() {
  return NextResponse.json(createApiResponse(getAuditStats(), "Audit stats loaded"));
}
