import {
  SCHOOL_INVOICES,
  type InvoiceStatus,
  type SchoolInvoice,
} from "@/components/dashboard/accountant/accountant-data";

let invoices: SchoolInvoice[] = [...SCHOOL_INVOICES];

function computeInvoiceStatus(invoice: SchoolInvoice): InvoiceStatus {
  const balance = invoice.amount - invoice.paidAmount;
  if (balance <= 0) return "paid";
  if (invoice.paidAmount > 0) return "partial";
  const today = new Date().toISOString().slice(0, 10);
  if (invoice.dueDate < today && invoice.status !== "draft") return "overdue";
  return invoice.status === "draft" ? "draft" : "sent";
}

export function getMutableInvoices() {
  return invoices;
}

export function getInvoiceById(id: string) {
  return invoices.find((invoice) => invoice.id === id);
}

export function applyPaymentToInvoice(invoiceId: string, amount: number, _paymentId: string) {
  const invoice = invoices.find((entry) => entry.id === invoiceId);
  if (!invoice) return null;

  const paidAmount = Math.min(invoice.amount, invoice.paidAmount + amount);
  const updated: SchoolInvoice = {
    ...invoice,
    paidAmount,
    status: computeInvoiceStatus({ ...invoice, paidAmount }),
  };

  invoices = invoices.map((entry) => (entry.id === invoiceId ? updated : entry));
  return updated;
}

export function addInvoice(input: Omit<SchoolInvoice, "id" | "invoiceNumber" | "status" | "paidAmount">) {
  const seq = invoices.length + 200;
  const invoice: SchoolInvoice = {
    ...input,
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-${String(seq).padStart(4, "0")}`,
    paidAmount: 0,
    status: "sent",
  };

  invoices = [invoice, ...invoices];
  return invoice;
}

export function bulkIssueInvoices(
  items: Array<{
    studentName: string;
    studentId: string;
    label: string;
    amount: number;
    term: string;
    dueDate: string;
  }>,
) {
  const today = new Date().toISOString().slice(0, 10);
  return items.map((item) =>
    addInvoice({
      studentName: item.studentName,
      studentId: item.studentId,
      label: item.label,
      amount: item.amount,
      issuedDate: today,
      dueDate: item.dueDate,
      term: item.term,
    }),
  );
}
