import { NextResponse } from "next/server";
import { createApiResponse, createApiError } from "@/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemIds, amount, method, cardLast4 } = body as {
      itemIds: string[];
      amount: number;
      method: string;
      cardLast4?: string;
    };

    if (!itemIds?.length || !amount) {
      return NextResponse.json(createApiError("invalid_input", "itemIds and amount required"), { status: 400 });
    }

    const checkoutSessionId = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json(
      createApiResponse({ checkoutSessionId }, "Gateway session initiated"),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("gateway_error", error instanceof Error ? error.message : "Gateway failed"),
      { status: 500 },
    );
  }
}
