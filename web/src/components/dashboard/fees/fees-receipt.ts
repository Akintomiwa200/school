import type { PaymentRecord } from "./student-fees-data";
import { formatDisplayDate } from "./student-fees-data";
import { formatCurrency } from "./fee-ui";

export type ReceiptData = {
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

export function buildReceiptData(input: {
  payment: PaymentRecord;
  studentName: string;
  studentId: string;
  feeLines: Array<{ label: string; amount: number }>;
}): ReceiptData {
  const generatedAt = new Date().toISOString();
  const methodLabels: Record<PaymentRecord["method"], string> = {
    card: "Debit / Credit Card",
    bank: "Bank Transfer",
    cash: "Cash",
    scholarship: "Scholarship Credit",
  };

  return {
    receiptId: input.payment.receiptId,
    paymentId: input.payment.id,
    transactionRef: input.payment.id.toUpperCase().replace(/-/g, ""),
    studentName: input.studentName,
    studentId: input.studentId,
    date: input.payment.date,
    dateFormatted: formatDisplayDate(input.payment.date),
    amount: input.payment.amount,
    amountFormatted: formatCurrency(input.payment.amount),
    method: input.payment.method,
    methodLabel: methodLabels[input.payment.method],
    description: input.payment.description,
    status: input.payment.status,
    feeLines: input.feeLines.map((line) => ({
      ...line,
      amountFormatted: formatCurrency(line.amount),
    })),
    generatedAt,
  };
}

export function receiptPrintHtml(receipt: ReceiptData) {
  const feeRows = receipt.feeLines
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${line.label}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600">${line.amountFormatted}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${receipt.receiptId}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #111; margin: 40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
    .brand { font-size:24px; font-weight:700; color:#5d21d0; }
    .meta { text-align:right; font-size:13px; color:#555; }
    h1 { font-size:20px; margin:0 0 8px; }
    table { width:100%; border-collapse:collapse; margin-top:16px; }
    .total { font-size:22px; font-weight:700; color:#5d21d0; margin-top:24px; }
    .footer { margin-top:40px; font-size:12px; color:#666; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Schooli</div>
      <p style="margin:8px 0 0;color:#555">Official payment receipt</p>
    </div>
    <div class="meta">
      <div><strong>${receipt.receiptId}</strong></div>
      <div>${receipt.dateFormatted}</div>
    </div>
  </div>
  <h1>Payment Receipt</h1>
  <p><strong>Student:</strong> ${receipt.studentName} (${receipt.studentId})</p>
  <p><strong>Transaction:</strong> ${receipt.transactionRef}</p>
  <p><strong>Method:</strong> ${receipt.methodLabel}</p>
  <p><strong>Description:</strong> ${receipt.description}</p>
  <table>
    <thead><tr><th style="text-align:left;padding-bottom:8px">Fee item</th><th style="text-align:right;padding-bottom:8px">Amount</th></tr></thead>
    <tbody>${feeRows}</tbody>
  </table>
  <div class="total">Total paid: ${receipt.amountFormatted}</div>
  <div class="footer">
    Generated ${new Date(receipt.generatedAt).toLocaleString("en-US")} · Status: ${receipt.status}
  </div>
</body>
</html>`;
}

export function downloadReceiptPdf(receipt: ReceiptData) {
  const html = receiptPrintHtml(receipt);
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
