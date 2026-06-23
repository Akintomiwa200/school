import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/fees/checkout-sessions";
import { createApiError, createApiResponse } from "@/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feeIds, amount, method, cardLast4 } = body as {
      feeIds?: string[];
      amount?: number;
      method?: string;
      cardLast4?: string;
    };

    if (!feeIds?.length || amount == null || !method) {
      return NextResponse.json(
        createApiError("validation_error", "feeIds, amount, and method are required"),
        { status: 400 },
      );
    }

    const session = createCheckoutSession({ feeIds, amount, method, cardLast4 });

    return NextResponse.json(
      createApiResponse(session, "Checkout session created"),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("checkout_error", error instanceof Error ? error.message : "Checkout failed"),
      { status: 400 },
    );
  }
}
