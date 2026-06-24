import { NextRequest, NextResponse } from "next/server";
import { confirmLibraryCheckoutSession } from "@/lib/library/checkout-sessions";
import { createApiError, createApiResponse } from "@/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutSessionId } = body as { checkoutSessionId?: string };

    if (!checkoutSessionId) {
      return NextResponse.json(
        createApiError("validation_error", "checkoutSessionId is required"),
        { status: 400 },
      );
    }

    const payment = confirmLibraryCheckoutSession(checkoutSessionId);

    return NextResponse.json(createApiResponse(payment, "Library payment confirmed"), {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      createApiError("payment_error", error instanceof Error ? error.message : "Payment failed"),
      { status: 400 },
    );
  }
}
