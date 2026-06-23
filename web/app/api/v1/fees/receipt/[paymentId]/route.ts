import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";

const RECEIPT_STORE: Record<
  string,
  {
    receiptId: string;
    paymentId: string;
    studentName: string;
    studentId: string;
    date: string;
    amount: number;
    method: string;
    description: string;
    status: string;
    feeLines: Array<{ label: string; amount: number }>;
    generatedAt: string;
  }
> = {};

export function registerServerReceipt(
  paymentId: string,
  data: (typeof RECEIPT_STORE)[string],
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

  const demoReceipts: Record<string, (typeof RECEIPT_STORE)[string]> = {
    "pay-001": {
      receiptId: "RCP-2026-0210",
      paymentId: "pay-001",
      studentName: "Alex Johnson",
      studentId: "STU-2024-118",
      date: "2026-02-10",
      amount: 1200,
      method: "card",
      description: "Tuition installment — Spring 2026",
      status: "completed",
      feeLines: [{ label: "Spring Term Tuition", amount: 1200 }],
      generatedAt: new Date().toISOString(),
    },
  };

  const receipt = demoReceipts[paymentId];
  if (!receipt) {
    return NextResponse.json(createApiError("not_found", "Receipt not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(receipt, "Receipt retrieved"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;
  const body = await request.json();

  const receipt = {
    receiptId: body.receiptId as string,
    paymentId,
    studentName: (body.studentName as string) ?? "Alex Johnson",
    studentId: (body.studentId as string) ?? "STU-2024-118",
    date: body.date as string,
    amount: body.amount as number,
    method: body.method as string,
    description: body.description as string,
    status: "completed",
    feeLines: (body.feeLines as Array<{ label: string; amount: number }>) ?? [],
    generatedAt: new Date().toISOString(),
  };

  RECEIPT_STORE[paymentId] = receipt;

  return NextResponse.json(createApiResponse(receipt, "Receipt generated"), { status: 201 });
}
