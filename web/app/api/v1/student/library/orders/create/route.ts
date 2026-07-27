import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

function buildReceiptId(date: Date, seq: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `LIB-RCP-${y}${m}${d}-${String(seq).padStart(3, "0")}`;
}

function buildOrderId(date: Date, seq: number) {
  const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `ord-${key.slice(2)}-${String(seq).padStart(3, "0")}`;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const body = await request.json();
    const { itemIds, amount, method, cardLast4, gatewaySessionId } = body as {
      itemIds: string[];
      amount: number;
      method: string;
      cardLast4?: string;
      gatewaySessionId?: string;
    };

    if (!itemIds?.length || !amount) {
      return NextResponse.json(createApiError("invalid_input", "itemIds and amount are required"), { status: 400 });
    }

    const shopItems = await prisma.libraryShopItem.findMany({
      where: { id: { in: itemIds } },
    });

    const now = new Date();
    const orderCount = await prisma.libraryOrder.count();
    const seq = orderCount + 1;
    const orderId = buildOrderId(now, seq);
    const receiptId = buildReceiptId(now, seq);

    const order = await prisma.libraryOrder.create({
      data: {
        id: orderId,
        studentId: student.id,
        amount,
        method: method ?? "card",
        status: "COMPLETED",
        receiptId,
        cardLast4: cardLast4 ?? null,
        gatewaySessionId: gatewaySessionId ?? null,
        date: now,
        lines: {
          create: shopItems.map((item) => ({
            shopItemId: item.id,
            title: item.title,
            amount: item.price,
            format: item.format,
            bookId: item.bookId,
          })),
        },
      },
      include: { lines: true },
    });

    const result = {
      id: order.id,
      amount: Number(order.amount),
      method: order.method,
      status: order.status,
      date: order.date.toISOString().split("T")[0],
      receiptId: order.receiptId,
      cardLast4: order.cardLast4,
      gatewaySessionId: order.gatewaySessionId,
      lines: order.lines.map((line) => ({
        itemId: line.shopItemId ?? line.id,
        title: line.title,
        amount: Number(line.amount),
        format: line.format,
        bookId: line.bookId,
      })),
    };

    return NextResponse.json(createApiResponse(result, "Order created"));
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to create order"),
      { status: 500 },
    );
  }
}
