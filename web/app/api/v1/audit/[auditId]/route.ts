import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getAuditEventById } from "@/lib/api/audit-entity-store";

type RouteContext = { params: Promise<{ auditId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { auditId } = await context.params;
  const event = getAuditEventById(auditId);

  if (!event) {
    return NextResponse.json(createApiError("not_found", "Audit event not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(event, "Audit event loaded"));
}
