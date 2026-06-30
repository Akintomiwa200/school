import { NextRequest, NextResponse } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { addPayment, exportPaymentsCsv, getMutableLedgerPayments } from "@/lib/api/payment-entity-store";
import { logPaymentRecorded } from "@/lib/api/finance-audit-helpers";
import type { PaymentRecord } from "@/components/dashboard/fees/student-fees-data";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");
  if (format === "csv") {
    const csv = exportPaymentsCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  return jsonData(getMutableLedgerPayments(), "Payments loaded");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    studentName: string;
    studentId: string;
    description: string;
    amount: number;
    method: PaymentRecord["method"];
    invoiceId?: string;
    recordedBy?: string;
  };

  if (!body.studentName || !body.studentId || !body.description || !body.amount || !body.method) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }

  const payment = addPayment(body);
  logPaymentRecorded(payment);

  return jsonData(payment, "Payment recorded", 201);
}
