import { NextRequest, NextResponse } from "next/server";
import { createLibraryCheckoutSession } from "@/lib/library/checkout-sessions";
import { createApiError, createApiResponse } from "@/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemIds, amount, method, cardLast4 } = body as {
      itemIds?: string[];
      amount?: number;
      method?: string;
      cardLast4?: string;
    };

    if (!itemIds?.length || amount == null || !method) {
      return NextResponse.json(
        createApiError("validation_error", "itemIds, amount, and method are required"),
        { status: 400 },
      );
    }

    const session = createLibraryCheckoutSession({ itemIds, amount, method, cardLast4 });

    return NextResponse.json(createApiResponse(session, "Library checkout session created"), {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      createApiError("checkout_error", error instanceof Error ? error.message : "Checkout failed"),
      { status: 400 },
    );
  }
}
