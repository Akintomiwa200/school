import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const [feePayments, payments] = await Promise.all([
      prisma.feePayment.findMany({
        where: { studentId: student.id },
        include: {
          feeStructure: {
            select: { name: true, description: true, amount: true, dueDate: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalFees = feePayments.reduce((sum, fp) => sum + Number(fp.amount), 0);
    const totalPaid = feePayments.reduce((sum, fp) => sum + Number(fp.paidAmount), 0);
    const totalOutstanding = totalFees - totalPaid;

    const feeItems = feePayments.map((fp) => ({
      id: fp.id,
      name: fp.feeStructure.name,
      description: fp.feeStructure.description,
      amount: Number(fp.amount),
      paidAmount: Number(fp.paidAmount),
      status: fp.status.toLowerCase(),
      dueDate: fp.dueDate,
    }));

    const paymentHistory = payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status.toLowerCase(),
      receiptNumber: p.receiptNumber,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(
      createApiResponse(
        {
          summary: { totalFees, totalPaid, totalOutstanding },
          feeItems,
          paymentHistory,
        },
        "Student fees loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("fees_error", error instanceof Error ? error.message : "Failed to load fees"),
      { status: 500 },
    );
  }
}
