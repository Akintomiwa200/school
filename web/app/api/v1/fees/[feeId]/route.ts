import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getFeePlanById, updateFeePlan } from "@/lib/api/fee-entity-store";
import { logFeeUpdated } from "@/lib/api/finance-audit-helpers";
import type { FeePlan } from "@/components/dashboard/accountant/accountant-data";

type RouteContext = { params: Promise<{ feeId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { feeId } = await context.params;
  const plan = getFeePlanById(feeId);
  if (!plan) {
    return NextResponse.json(createApiError("not_found", "Fee plan not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(plan, "Fee plan loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { feeId } = await context.params;
  const body = (await request.json()) as Partial<FeePlan>;
  const result = updateFeePlan(feeId, body);
  if (!result) {
    return NextResponse.json(createApiError("not_found", "Fee plan not found"), { status: 404 });
  }
  if (result.changes.length > 0) {
    logFeeUpdated(result.updated, result.changes);
  }
  return NextResponse.json(createApiResponse(result.updated, "Fee plan updated"));
}
