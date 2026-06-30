import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getPaymentById, updatePaymentStatus } from "@/lib/api/payment-entity-store";
import type { PaymentRecord } from "@/components/dashboard/fees/student-fees-data";

type RouteContext = { params: Promise<{ paymentId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;
  const payment = getPaymentById(paymentId);
  if (!payment) {
    return NextResponse.json(createApiError("not_found", "Payment not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(payment, "Payment loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;
  const body = (await request.json()) as { status: PaymentRecord["status"] };
  const updated = updatePaymentStatus(paymentId, body.status);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Payment not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Payment updated"));
}
