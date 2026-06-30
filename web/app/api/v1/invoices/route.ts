import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { bulkIssueInvoices, getMutableInvoices } from "@/lib/api/invoice-entity-store";
import { logInvoiceIssued } from "@/lib/api/finance-audit-helpers";
import { SCHOOL_INVOICES } from "@/components/dashboard/accountant/accountant-data";

export async function GET() {
  return jsonData(getMutableInvoices(), "Invoices loaded");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { action?: string; term?: string };

  if (body.action === "bulk_billing") {
    const term = body.term ?? "Spring 2026";
    const dueDate = "2026-04-01";
    const template = SCHOOL_INVOICES[0];
    const items = [
      { studentName: "Jordan Smith", studentId: "STU-2023-201", label: "Spring Term Tuition", amount: 3200, term, dueDate },
      { studentName: "Priya Patel", studentId: "STU-2024-089", label: "Spring Term Tuition", amount: template.amount, term, dueDate },
    ];
    const created = bulkIssueInvoices(items);
    created.forEach((invoice) => logInvoiceIssued(invoice, `Bulk invoice issued for ${invoice.studentName}`));
    return jsonData(created, "Bulk invoices issued", 201);
  }

  return jsonData({ error: "Invalid action" }, "Validation failed", 400);
}
