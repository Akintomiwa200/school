import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getPaymentById } from "@/lib/api/payment-entity-store";
import { buildReceiptFromPayment } from "@/lib/api/receipt-service";
import { receiptPrintHtml } from "@/components/dashboard/fees/fees-receipt";

type RouteContext = { params: Promise<{ paymentId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { paymentId } = await context.params;
  const payment = getPaymentById(paymentId);

  if (!payment) {
    return NextResponse.json(createApiError("not_found", "Payment not found"), { status: 404 });
  }

  const receipt = buildReceiptFromPayment(payment);
  const format = request.nextUrl.searchParams.get("format");

  if (format === "html" || format === "download") {
    const html = receiptPrintHtml(receipt);
    const filename = `receipt-${receipt.receiptId}.html`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...(format === "download"
          ? { "Content-Disposition": `attachment; filename="${filename}"` }
          : {}),
      },
    });
  }

  return NextResponse.json(createApiResponse(receipt, "Receipt loaded"));
}
