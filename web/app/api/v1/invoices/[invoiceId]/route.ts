import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getInvoiceById } from "@/lib/api/invoice-entity-store";
import { addPayment } from "@/lib/api/payment-entity-store";
import { logPaymentRecorded } from "@/lib/api/finance-audit-helpers";
import type { PaymentRecord } from "@/components/dashboard/fees/student-fees-data";

type RouteContext = { params: Promise<{ invoiceId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { invoiceId } = await context.params;
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) {
    return NextResponse.json(createApiError("not_found", "Invoice not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(invoice, "Invoice loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { invoiceId } = await context.params;
  const body = (await request.json()) as {
    action: "record_payment";
    amount?: number;
    method?: PaymentRecord["method"];
  };

  const invoice = getInvoiceById(invoiceId);
  if (!invoice) {
    return NextResponse.json(createApiError("not_found", "Invoice not found"), { status: 404 });
  }

  if (body.action === "record_payment") {
    const balance = invoice.amount - invoice.paidAmount;
    const amount = body.amount ?? balance;
    if (amount <= 0) {
      return NextResponse.json(createApiError("validation", "Invoice has no balance due"), { status: 400 });
    }

    const payment = addPayment({
      studentName: invoice.studentName,
      studentId: invoice.studentId,
      description: `Payment for ${invoice.label}`,
      amount,
      method: body.method ?? "cash",
      invoiceId,
      recordedBy: "Finance desk",
    });
    logPaymentRecorded(payment);

    const updatedInvoice = getInvoiceById(invoiceId);
    return NextResponse.json(
      createApiResponse({ invoice: updatedInvoice, payment }, "Payment recorded against invoice"),
    );
  }

  return NextResponse.json(createApiError("validation", "Invalid action"), { status: 400 });
}
