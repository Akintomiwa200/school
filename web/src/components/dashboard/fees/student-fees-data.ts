import {
  getLiveFeePayments,
  getLivePaymentById,
  livePaymentToRecord,
  mergeFeeItem,
} from "./fees-live-store";

export type FeeStatus = "paid" | "pending" | "overdue" | "partial";

export type FeeCategory = "tuition" | "lab" | "library" | "activities" | "transport";

export type FeeItem = {
  id: string;
  label: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  category: FeeCategory;
  term: string;
  description?: string;
};

export type PaymentRecord = {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: "card" | "bank" | "cash" | "scholarship";
  receiptId: string;
  status: "completed" | "pending" | "failed";
  feeIds?: string[];
};

export type Invoice = {
  id: string;
  feeId: string;
  invoiceNumber: string;
  label: string;
  amount: number;
  paidAmount: number;
  issuedDate: string;
  dueDate: string;
  status: FeeStatus;
  term: string;
};

export type FeeBreakdownItem = {
  category: FeeCategory;
  label: string;
  amount: number;
  color: "purple" | "orange" | "green" | "blue";
};

export const FEE_CATEGORY_COLORS: Record<
  FeeBreakdownItem["color"],
  { fill: string; bg: string; text: string }
> = {
  purple: { fill: "text-brand-purple", bg: "bg-brand-purple", text: "text-brand-purple" },
  orange: { fill: "text-brand-orange", bg: "bg-brand-orange", text: "text-brand-orange" },
  green: { fill: "text-green", bg: "bg-green", text: "text-green" },
  blue: { fill: "text-brand-blue", bg: "bg-brand-blue", text: "text-brand-blue" },
};

const BASE_FEE_ITEMS: FeeItem[] = [
  {
    id: "fee-tuition-spring",
    label: "Spring Term Tuition",
    amount: 3200,
    paidAmount: 2000,
    dueDate: "2026-03-15",
    status: "partial",
    category: "tuition",
    term: "Spring 2026",
    description: "Core tuition for Spring 2026 semester including academic instruction and campus facilities.",
  },
  {
    id: "fee-lab",
    label: "Computer Science Lab Fee",
    amount: 450,
    paidAmount: 0,
    dueDate: "2026-03-15",
    status: "pending",
    category: "lab",
    term: "Spring 2026",
    description: "Lab equipment, software licenses, and practical session materials for CS courses.",
  },
  {
    id: "fee-library",
    label: "Library & Resources",
    amount: 180,
    paidAmount: 180,
    dueDate: "2026-02-01",
    status: "paid",
    category: "library",
    term: "Spring 2026",
    description: "Digital library access, research databases, and borrowing privileges.",
  },
  {
    id: "fee-activities",
    label: "Student Activities",
    amount: 220,
    paidAmount: 0,
    dueDate: "2026-04-01",
    status: "pending",
    category: "activities",
    term: "Spring 2026",
    description: "Clubs, sports, cultural events, and student organization funding.",
  },
  {
    id: "fee-transport",
    label: "School Transport",
    amount: 600,
    paidAmount: 600,
    dueDate: "2026-01-10",
    status: "paid",
    category: "transport",
    term: "Spring 2026",
    description: "Bus service for the full Spring term on assigned routes.",
  },
];

const BASE_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-001",
    date: "2026-02-10",
    description: "Tuition installment — Spring 2026",
    amount: 1200,
    method: "card",
    receiptId: "RCP-2026-0210",
    status: "completed",
    feeIds: ["fee-tuition-spring"],
  },
  {
    id: "pay-002",
    date: "2026-01-28",
    description: "Library & Resources fee",
    amount: 180,
    method: "bank",
    receiptId: "RCP-2026-0128",
    status: "completed",
    feeIds: ["fee-library"],
  },
  {
    id: "pay-003",
    date: "2026-01-10",
    description: "School transport — Spring term",
    amount: 600,
    method: "card",
    receiptId: "RCP-2026-0110",
    status: "completed",
    feeIds: ["fee-transport"],
  },
  {
    id: "pay-004",
    date: "2026-01-05",
    description: "Merit scholarship credit",
    amount: 800,
    method: "scholarship",
    receiptId: "SCH-2026-0004",
    status: "completed",
    feeIds: ["fee-tuition-spring"],
  },
  {
    id: "pay-005",
    date: "2025-12-15",
    description: "Fall term final installment",
    amount: 1500,
    method: "bank",
    receiptId: "RCP-2025-1215",
    status: "completed",
  },
  {
    id: "pay-006",
    date: "2025-11-20",
    description: "Lab equipment fee",
    amount: 350,
    method: "card",
    receiptId: "RCP-2025-1120",
    status: "completed",
  },
];

function buildInvoicesFromFees(fees: FeeItem[]): Invoice[] {
  return fees.map((fee) => ({
    id: `inv-${fee.id}`,
    feeId: fee.id,
    invoiceNumber: `INV-${fee.id.replace("fee-", "").toUpperCase()}`,
    label: fee.label,
    amount: fee.amount,
    paidAmount: fee.paidAmount,
    issuedDate: fee.dueDate.replace(/-(\d{2})$/, (_, d) =>
      `-${String(Math.max(1, Number(d) - 14)).padStart(2, "0")}`,
    ),
    dueDate: fee.dueDate,
    status: fee.status,
    term: fee.term,
  }));
}

export function getFeeItems(): FeeItem[] {
  return BASE_FEE_ITEMS.map(mergeFeeItem);
}

export function getPayableFees(): FeeItem[] {
  return getFeeItems().filter((item) => item.status !== "paid");
}

export function getFeeItemById(feeId: string): FeeItem | undefined {
  return getFeeItems().find((item) => item.id === feeId);
}

export function getFeeBalance(item: FeeItem) {
  return Math.max(0, item.amount - item.paidAmount);
}

export function getPaymentHistory(): PaymentRecord[] {
  const liveIds = new Set(getLiveFeePayments().map((p) => p.id));
  const live = getLiveFeePayments().map(livePaymentToRecord);
  const base = BASE_PAYMENTS.filter((p) => !liveIds.has(p.id));
  return [...live, ...base].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPaymentById(paymentId: string): PaymentRecord | undefined {
  const live = getLivePaymentById(paymentId);
  if (live) return livePaymentToRecord(live);
  return getPaymentHistory().find((payment) => payment.id === paymentId);
}

export function getInvoices(): Invoice[] {
  return buildInvoicesFromFees(getFeeItems()).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
}

export function getInvoiceById(invoiceId: string): Invoice | undefined {
  return getInvoices().find((invoice) => invoice.id === invoiceId);
}

export function getFeeStats() {
  const items = getFeeItems();
  const payments = getPaymentHistory();

  const totalBilled = items.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = items.reduce((sum, item) => sum + item.paidAmount, 0);
  const amountDue = items.reduce((sum, item) => sum + getFeeBalance(item), 0);
  const scholarshipApplied = payments
    .filter((p) => p.method === "scholarship" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const nextDue = items
    .filter((item) => item.status !== "paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return {
    totalBilled,
    totalPaid,
    amountDue,
    scholarshipApplied,
    nextDueDate: nextDue?.dueDate ?? null,
    nextDueLabel: nextDue?.label ?? null,
    paidPercent: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
  };
}

export function getFeeBreakdown(): FeeBreakdownItem[] {
  const items = getFeeItems();
  const byCategory = items.reduce<Record<FeeCategory, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    },
    {} as Record<FeeCategory, number>,
  );

  const breakdown = [
    { category: "tuition", label: "Tuition", amount: byCategory.tuition, color: "purple" },
    { category: "lab", label: "Lab", amount: byCategory.lab, color: "orange" },
    { category: "library", label: "Library", amount: byCategory.library, color: "green" },
    { category: "activities", label: "Activities", amount: byCategory.activities, color: "blue" },
    { category: "transport", label: "Transport", amount: byCategory.transport, color: "purple" },
  ] satisfies FeeBreakdownItem[];

  return breakdown.filter((item) => item.amount > 0);
}

export function getUpcomingFees() {
  return getFeeItems()
    .filter((item) => item.status !== "paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getFeesByMonth() {
  const items = getUpcomingFees();
  const groups = new Map<string, FeeItem[]>();

  for (const item of items) {
    const monthKey = item.dueDate.slice(0, 7);
    const list = groups.get(monthKey) ?? [];
    list.push(item);
    groups.set(monthKey, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, fees]) => ({
      monthKey,
      label: new Date(`${monthKey}-01T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      fees,
      totalDue: fees.reduce((sum, fee) => sum + getFeeBalance(fee), 0),
    }));
}

export function formatDisplayDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function feeItemHref(feeId: string) {
  return `/student/fees/items/${feeId}`;
}

export function payHref(feeId?: string) {
  const base = "/student/fees/pay";
  return feeId ? `${base}?fee=${feeId}` : base;
}

export function paymentHref(paymentId: string) {
  return `/student/fees/payments/${paymentId}`;
}

export function invoiceHref(invoiceId: string) {
  return `/student/fees/invoices/${invoiceId}`;
}

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  partial: "Partial",
};

export const FEE_STATUS_STYLES: Record<FeeStatus, string> = {
  paid: "bg-green/15 text-green",
  pending: "bg-brand-orange/15 text-brand-orange",
  overdue: "bg-destructive/15 text-destructive",
  partial: "bg-brand-blue/15 text-brand-blue",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentRecord["method"], string> = {
  card: "Card",
  bank: "Bank transfer",
  cash: "Cash",
  scholarship: "Scholarship",
};

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
  tuition: "Tuition",
  lab: "Lab",
  library: "Library",
  activities: "Activities",
  transport: "Transport",
};
