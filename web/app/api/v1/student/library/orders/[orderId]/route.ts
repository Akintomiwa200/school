import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const { orderId } = await params;

    const order = await prisma.libraryOrder.findFirst({
      where: { id: orderId, studentId: student.id },
      include: { lines: true },
    });

    if (!order) {
      return NextResponse.json(createApiError("not_found", "Order not found"), { status: 404 });
    }

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

    return NextResponse.json(createApiResponse(result, "Order loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to load order"),
      { status: 500 },
    );
  }
}
