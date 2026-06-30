import type { LedgerPayment } from "@/components/dashboard/accountant/accountant-data";
import type { PaymentRecord } from "@/components/dashboard/fees/student-fees-data";
import { formatDisplayDate } from "@/components/dashboard/fees/student-fees-data";
import { formatCurrency } from "@/components/dashboard/fees/fee-ui";
import type { ReceiptData } from "@/components/dashboard/fees/fees-receipt";

const METHOD_LABELS: Record<PaymentRecord["method"], string> = {
  card: "Debit / Credit Card",
  bank: "Bank Transfer",
  cash: "Cash",
  scholarship: "Scholarship Credit",
};

export type ApiReceiptPayload = {
  receiptId: string;
  paymentId: string;
  transactionRef: string;
  studentName: string;
  studentId: string;
  date: string;
  dateFormatted: string;
  amount: number;
  amountFormatted: string;
  method: PaymentRecord["method"];
  methodLabel: string;
  description: string;
  status: string;
  feeLines: Array<{ label: string; amount: number; amountFormatted: string }>;
  generatedAt: string;
};

export function buildReceiptFromPayment(payment: LedgerPayment): ApiReceiptPayload {
  const generatedAt = new Date().toISOString();
  const feeLine = { label: payment.description, amount: payment.amount };

  return {
    receiptId: payment.receiptId,
    paymentId: payment.id,
    transactionRef: payment.id.toUpperCase().replace(/-/g, ""),
    studentName: payment.studentName,
    studentId: payment.studentId,
    date: payment.date,
    dateFormatted: formatDisplayDate(payment.date),
    amount: payment.amount,
    amountFormatted: formatCurrency(payment.amount),
    method: payment.method,
    methodLabel: METHOD_LABELS[payment.method],
    description: payment.description,
    status: payment.status,
    feeLines: [
      {
        ...feeLine,
        amountFormatted: formatCurrency(feeLine.amount),
      },
    ],
    generatedAt,
  };
}

export function toReceiptData(payload: ApiReceiptPayload): ReceiptData {
  return payload;
}
