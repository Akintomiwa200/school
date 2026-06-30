import {
  getSeedLedgerPayments,
  type LedgerPayment,
} from "@/components/dashboard/accountant/accountant-data";
import type { PaymentRecord } from "@/components/dashboard/fees/student-fees-data";
import { applyPaymentToInvoice } from "@/lib/api/invoice-entity-store";

let payments: LedgerPayment[] = getSeedLedgerPayments();

function nextReceiptId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `RCP-${stamp}-${String(payments.length + 1).padStart(3, "0")}`;
}

export function getMutableLedgerPayments() {
  return payments;
}

export function getPaymentById(id: string) {
  return payments.find((payment) => payment.id === id);
}

export function addPayment(input: {
  studentName: string;
  studentId: string;
  description: string;
  amount: number;
  method: PaymentRecord["method"];
  recordedBy?: string;
  status?: PaymentRecord["status"];
  invoiceId?: string;
  feeIds?: string[];
}): LedgerPayment {
  const payment: LedgerPayment = {
    id: `pay-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    description: input.description,
    amount: input.amount,
    method: input.method,
    receiptId: nextReceiptId(),
    status: input.status ?? "completed",
    feeIds: input.feeIds ?? [],
    studentName: input.studentName,
    studentId: input.studentId,
    recordedBy: input.recordedBy ?? "Finance desk",
  };

  payments = [payment, ...payments];

  if (input.invoiceId) {
    applyPaymentToInvoice(input.invoiceId, payment.amount, payment.id);
  }

  return payment;
}

export function updatePaymentStatus(id: string, status: PaymentRecord["status"]) {
  const payment = payments.find((entry) => entry.id === id);
  if (!payment) return null;

  payments = payments.map((entry) => (entry.id === id ? { ...entry, status } : entry));
  return payments.find((entry) => entry.id === id) ?? null;
}

export function exportPaymentsCsv() {
  const header = "id,receipt_id,date,student,amount,method,status,description\n";
  const rows = payments.map((payment) =>
    [
      payment.id,
      payment.receiptId,
      payment.date,
      `"${payment.studentName}"`,
      payment.amount,
      payment.method,
      payment.status,
      `"${payment.description.replace(/"/g, '""')}"`,
    ].join(","),
  );
  return header + rows.join("\n");
}
