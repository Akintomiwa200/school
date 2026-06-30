import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getPaymentById } from "@/lib/api/payment-entity-store";
import { buildReceiptFromPayment } from "@/lib/api/receipt-service";

const RECEIPT_STORE: Record<
  string,
  ReturnType<typeof buildReceiptFromPayment>
> = {};

export function registerServerReceipt(
  paymentId: string,
  data: ReturnType<typeof buildReceiptFromPayment>,
) {
  RECEIPT_STORE[paymentId] = data;
}

type RouteContext = { params: Promise<{ paymentId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;

  const stored = RECEIPT_STORE[paymentId];
  if (stored) {
    return NextResponse.json(createApiResponse(stored, "Receipt retrieved"));
  }

  const payment = getPaymentById(paymentId);
  if (!payment) {
    return NextResponse.json(createApiError("not_found", "Receipt not found"), { status: 404 });
  }

  const receipt = buildReceiptFromPayment(payment);
  return NextResponse.json(createApiResponse(receipt, "Receipt retrieved"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;
  const body = await request.json();

  const payment = getPaymentById(paymentId);
  const receipt = payment
    ? buildReceiptFromPayment(payment)
    : {
        receiptId: body.receiptId as string,
        paymentId,
        transactionRef: paymentId.toUpperCase().replace(/-/g, ""),
        studentName: (body.studentName as string) ?? "Student",
        studentId: (body.studentId as string) ?? "STU-0000",
        date: body.date as string,
        dateFormatted: body.date as string,
        amount: body.amount as number,
        amountFormatted: String(body.amount),
        method: body.method as "card",
        methodLabel: String(body.method),
        description: body.description as string,
        status: "completed",
        feeLines: (body.feeLines as Array<{ label: string; amount: number; amountFormatted?: string }>) ?? [],
        generatedAt: new Date().toISOString(),
      };

  const normalized = {
    ...receipt,
    feeLines: (receipt.feeLines ?? []).map((line) => ({
      label: line.label,
      amount: line.amount,
      amountFormatted: line.amountFormatted ?? String(line.amount),
    })),
  };

  RECEIPT_STORE[paymentId] = normalized;

  return NextResponse.json(createApiResponse(normalized, "Receipt generated"), { status: 201 });
}
