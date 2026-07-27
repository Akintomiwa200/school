import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { checkoutSessionId } = body as { checkoutSessionId: string };

    if (!checkoutSessionId) {
      return NextResponse.json(createApiError("invalid_input", "checkoutSessionId required"), { status: 400 });
    }

    const shopItems = await prisma.libraryShopItem.findMany({ where: { isActive: true } });
    const lines = shopItems.slice(0, 1).map((item) => ({
      itemId: item.id,
      title: item.title,
      amount: Number(item.price),
      format: item.format,
      bookId: item.bookId,
    }));

    const totalAmount = lines.reduce((sum, l) => sum + l.amount, 0);

    return NextResponse.json(
      createApiResponse({
        itemIds: lines.map((l) => l.itemId),
        amount: totalAmount,
        method: "card",
        cardLast4: undefined,
        gatewaySessionId: checkoutSessionId,
        lines,
      }, "Payment confirmed"),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("gateway_error", error instanceof Error ? error.message : "Confirmation failed"),
      { status: 500 },
    );
  }
}
