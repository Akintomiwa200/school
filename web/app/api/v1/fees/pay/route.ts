import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";

const PAYABLE_FEES: Record<string, { amount: number; paidAmount: number }> = {
  "fee-tuition-spring": { amount: 3200, paidAmount: 2000 },
  "fee-lab": { amount: 450, paidAmount: 0 },
  "fee-library": { amount: 180, paidAmount: 180 },
  "fee-activities": { amount: 220, paidAmount: 0 },
  "fee-transport": { amount: 600, paidAmount: 600 },
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { feeIds, amount, method } = body as {
    feeIds?: string[];
    amount?: number;
    method?: string;
  };

  if (!feeIds?.length || amount == null || !method) {
    return NextResponse.json(
      createApiError("validation_error", "feeIds, amount, and method are required"),
      { status: 400 },
    );
  }

  if (!["card", "bank", "cash"].includes(method)) {
    return NextResponse.json(createApiError("validation_error", "Invalid payment method"), {
      status: 400,
    });
  }

  let expectedTotal = 0;
  for (const feeId of feeIds) {
    const fee = PAYABLE_FEES[feeId];
    if (!fee) {
      return NextResponse.json(createApiError("not_found", `Fee ${feeId} not found`), { status: 404 });
    }
    const balance = Math.max(0, fee.amount - fee.paidAmount);
    if (balance <= 0) {
      return NextResponse.json(createApiError("validation_error", `${feeId} is already paid`), {
        status: 400,
      });
    }
    expectedTotal += balance;
  }

  if (amount !== expectedTotal) {
    return NextResponse.json(
      createApiError("validation_error", `Amount must be ${expectedTotal} for selected fees`),
      { status: 400 },
    );
  }

  return NextResponse.json(
    createApiResponse(
      {
        feeIds,
        amount,
        method,
        status: "completed",
      },
      "Payment processed successfully",
    ),
    { status: 201 },
  );
}
