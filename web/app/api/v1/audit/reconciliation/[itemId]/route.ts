import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  flagReconciliationItem,
  getReconciliationItemById,
  matchReconciliationItem,
  unmatchReconciliationItem,
} from "@/lib/api/audit-entity-store";

type RouteContext = { params: Promise<{ itemId: string }> };

type PatchBody =
  | { action: "match"; paymentId: string; actor?: string }
  | { action: "unmatch"; actor?: string }
  | { action: "flag"; reason: string; actor?: string };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const body = (await request.json()) as PatchBody;

  if (!getReconciliationItemById(itemId)) {
    return NextResponse.json(createApiError("not_found", "Reconciliation item not found"), { status: 404 });
  }

  let updated = null;

  if (body.action === "match") {
    if (!body.paymentId) {
      return NextResponse.json(createApiError("validation", "paymentId is required"), { status: 400 });
    }
    updated = matchReconciliationItem(itemId, body.paymentId, body.actor);
  } else if (body.action === "unmatch") {
    updated = unmatchReconciliationItem(itemId, body.actor);
  } else if (body.action === "flag") {
    if (!body.reason?.trim()) {
      return NextResponse.json(createApiError("validation", "reason is required"), { status: 400 });
    }
    updated = flagReconciliationItem(itemId, body.reason.trim(), body.actor);
  } else {
    return NextResponse.json(createApiError("validation", "Invalid action"), { status: 400 });
  }

  if (!updated) {
    return NextResponse.json(createApiError("validation", "Unable to update reconciliation item"), { status: 400 });
  }

  return NextResponse.json(createApiResponse(updated, "Reconciliation item updated"));
}
