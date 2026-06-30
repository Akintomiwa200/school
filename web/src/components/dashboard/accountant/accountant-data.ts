import { getLiveFeePayments, livePaymentToRecord } from "../fees/fees-live-store";
import type { PaymentRecord } from "../fees/student-fees-data";
import { formatDisplayDate as formatFeeDate } from "../fees/student-fees-data";

export type FeePlanStatus = "active" | "draft" | "archived";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "partial";
export type PayrollStatus = "draft" | "processing" | "completed" | "cancelled";
export type AuditAction =
  | "payment_recorded"
  | "invoice_issued"
  | "expense_approved"
  | "payroll_run"
  | "reconciliation"
  | "fee_updated";

export type AuditEntityType =
  | "payment"
  | "invoice"
  | "expense"
  | "payroll"
  | "fee_plan"
  | "reconciliation"
  | "other";

export type AuditChange = {
  field: string;
  before: string;
  after: string;
};

export type FeePlan = {
  id: string;
  name: string;
  category: string;
  amount: number;
  term: string;
  grades: string;
  status: FeePlanStatus;
  dueDate: string;
};

export type LedgerPayment = PaymentRecord & {
  studentName: string;
  studentId: string;
  recordedBy: string;
};

export type ExpenseEntry = {
  id: string;
  date: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  requestedBy: string;
};

export type SchoolInvoice = {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  label: string;
  amount: number;
  paidAmount: number;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  term: string;
};

export type PayrollRun = {
  id: string;
  period: string;
  staffCount: number;
  totalAmount: number;
  status: PayrollStatus;
  processedDate?: string;
  createdAt?: string;
  finalizedBy?: string;
  notes?: string;
  disbursementRef?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
};

export type PayslipStatus = "pending" | "paid";

export type PayslipLine = {
  label: string;
  amount: number;
};

export type Payslip = {
  id: string;
  runId: string;
  staffId: string;
  employeeId: string;
  staffName: string;
  department: string;
  designation: string;
  period: string;
  grossPay: number;
  earnings: PayslipLine[];
  deductions: PayslipLine[];
  netPay: number;
  status: PayslipStatus;
  paidDate?: string;
  ytdGross?: number;
  ytdNet?: number;
  disbursementRef?: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  actorEmail?: string;
  reference: string;
  entityType: AuditEntityType;
  entityId?: string;
  amount?: number;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, string>;
  changes?: AuditChange[];
};

export type ReconciliationItemStatus = "unmatched" | "matched" | "flagged";

export type ReconciliationItem = {
  id: string;
  period: string;
  bankDate: string;
  bankDescription: string;
  bankAmount: number;
  bankReference: string;
  status: ReconciliationItemStatus;
  matchedPaymentId?: string;
  matchedReceiptId?: string;
  flagReason?: string;
};

export const RECONCILIATION_PERIOD = "MAR-2026";

export const FEE_PLANS: FeePlan[] = [
  { id: "fp-tuition", name: "Spring Tuition", category: "Tuition", amount: 3200, term: "Spring 2026", grades: "All grades", status: "active", dueDate: "2026-03-15" },
  { id: "fp-lab", name: "Science Lab Fee", category: "Lab", amount: 450, term: "Spring 2026", grades: "9–12", status: "active", dueDate: "2026-03-15" },
  { id: "fp-transport", name: "Bus Transport", category: "Transport", amount: 600, term: "Spring 2026", grades: "All grades", status: "active", dueDate: "2026-01-10" },
  { id: "fp-activities", name: "Student Activities", category: "Activities", amount: 220, term: "Spring 2026", grades: "6–12", status: "active", dueDate: "2026-04-01" },
  { id: "fp-library", name: "Library & Resources", category: "Library", amount: 180, term: "Spring 2026", grades: "All grades", status: "active", dueDate: "2026-02-01" },
  { id: "fp-summer", name: "Summer Program", category: "Tuition", amount: 1800, term: "Summer 2026", grades: "7–12", status: "draft", dueDate: "2026-06-01" },
];

const BASE_LEDGER: Omit<LedgerPayment, keyof PaymentRecord>[] = [
  { studentName: "Alex Johnson", studentId: "STU-2024-118", recordedBy: "Finance desk" },
  { studentName: "Maya Chen", studentId: "STU-2024-042", recordedBy: "Online gateway" },
  { studentName: "Jordan Smith", studentId: "STU-2023-201", recordedBy: "Finance desk" },
  { studentName: "Priya Patel", studentId: "STU-2024-089", recordedBy: "Bank transfer" },
  { studentName: "Sam Wilson", studentId: "STU-2024-156", recordedBy: "Finance desk" },
];

const DEMO_PAYMENTS: PaymentRecord[] = [
  { id: "pay-001", date: "2026-02-28", description: "Spring tuition — partial", amount: 2000, method: "card", receiptId: "RCP-20260228-001", status: "completed", feeIds: ["fee-tuition-spring"] },
  { id: "pay-002", date: "2026-02-15", description: "Library & resources", amount: 180, method: "cash", receiptId: "RCP-20260215-002", status: "completed", feeIds: ["fee-library"] },
  { id: "pay-003", date: "2026-02-10", description: "Transport — full term", amount: 600, method: "bank", receiptId: "RCP-20260210-003", status: "completed", feeIds: ["fee-transport"] },
  { id: "pay-004", date: "2026-03-01", description: "Lab fee — pending verification", amount: 450, method: "bank", receiptId: "RCP-20260301-004", status: "pending", feeIds: ["fee-lab"] },
  { id: "pay-005", date: "2026-01-20", description: "Activities deposit", amount: 110, method: "cash", receiptId: "RCP-20260120-005", status: "completed", feeIds: ["fee-activities"] },
];

export const EXPENSES: ExpenseEntry[] = [
  { id: "exp-001", date: "2026-02-25", category: "Supplies", vendor: "Office Depot", description: "Classroom stationery bulk order", amount: 1240, status: "approved", requestedBy: "Admin office" },
  { id: "exp-002", date: "2026-02-22", category: "Maintenance", vendor: "City HVAC Co.", description: "Auditorium AC repair", amount: 3800, status: "paid", requestedBy: "Facilities" },
  { id: "exp-003", date: "2026-03-02", category: "Technology", vendor: "TechServe Ltd", description: "Lab laptops — 12 units", amount: 9600, status: "pending", requestedBy: "IT department" },
  { id: "exp-004", date: "2026-02-18", category: "Transport", vendor: "Fuel Partners", description: "Bus fleet fuel — February", amount: 2100, status: "paid", requestedBy: "Transport office" },
  { id: "exp-005", date: "2026-03-05", category: "Events", vendor: "EventPro", description: "Science fair staging", amount: 850, status: "pending", requestedBy: "Science dept" },
];

export const SCHOOL_INVOICES: SchoolInvoice[] = [
  { id: "inv-001", invoiceNumber: "INV-2026-0142", studentName: "Alex Johnson", studentId: "STU-2024-118", label: "Spring Term Tuition", amount: 3200, paidAmount: 2000, issuedDate: "2026-01-15", dueDate: "2026-03-15", status: "partial", term: "Spring 2026" },
  { id: "inv-002", invoiceNumber: "INV-2026-0143", studentName: "Maya Chen", studentId: "STU-2024-042", label: "Spring Term Tuition", amount: 3200, paidAmount: 3200, issuedDate: "2026-01-15", dueDate: "2026-03-15", status: "paid", term: "Spring 2026" },
  { id: "inv-003", invoiceNumber: "INV-2026-0156", studentName: "Jordan Smith", studentId: "STU-2023-201", label: "CS Lab Fee", amount: 450, paidAmount: 0, issuedDate: "2026-02-01", dueDate: "2026-03-15", status: "overdue", term: "Spring 2026" },
  { id: "inv-004", invoiceNumber: "INV-2026-0160", studentName: "Priya Patel", studentId: "STU-2024-089", label: "Student Activities", amount: 220, paidAmount: 0, issuedDate: "2026-02-20", dueDate: "2026-04-01", status: "sent", term: "Spring 2026" },
  { id: "inv-005", invoiceNumber: "INV-2026-0168", studentName: "Sam Wilson", studentId: "STU-2024-156", label: "School Transport", amount: 600, paidAmount: 600, issuedDate: "2026-01-05", dueDate: "2026-01-10", status: "paid", term: "Spring 2026" },
];

export const PAYROLL_RUNS: PayrollRun[] = [
  { id: "pr-2026-02", period: "February 2026", staffCount: 84, totalAmount: 412500, status: "completed", processedDate: "2026-02-28" },
  { id: "pr-2026-01", period: "January 2026", staffCount: 83, totalAmount: 408200, status: "completed", processedDate: "2026-01-31" },
  { id: "pr-2026-03", period: "March 2026", staffCount: 84, totalAmount: 415800, status: "processing" },
  { id: "pr-2026-04", period: "April 2026", staffCount: 84, totalAmount: 0, status: "draft" },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud-001",
    timestamp: "2026-03-05T14:22:00",
    action: "payment_recorded",
    actor: "J. Accountant",
    actorEmail: "accountant@school.com",
    reference: "RCP-20260301-004",
    entityType: "payment",
    entityId: "pay-004",
    amount: 450,
    details: "Bank transfer pending verification for lab fee",
    ipAddress: "192.168.1.42",
    metadata: { method: "bank", studentId: "STU-2023-201" },
  },
  {
    id: "aud-002",
    timestamp: "2026-03-04T09:15:00",
    action: "expense_approved",
    actor: "Finance Manager",
    actorEmail: "finance@school.com",
    reference: "exp-001",
    entityType: "expense",
    entityId: "exp-001",
    amount: 1240,
    details: "Classroom stationery approved for payment",
    ipAddress: "10.0.0.18",
    changes: [{ field: "status", before: "pending", after: "approved" }],
  },
  {
    id: "aud-003",
    timestamp: "2026-03-03T16:40:00",
    action: "invoice_issued",
    actor: "System",
    reference: "INV-2026-0168",
    entityType: "invoice",
    entityId: "inv-005",
    amount: 600,
    details: "Transport invoice marked paid",
    metadata: { term: "Spring 2026", studentId: "STU-2024-156" },
  },
  {
    id: "aud-004",
    timestamp: "2026-03-02T11:00:00",
    action: "reconciliation",
    actor: "J. Accountant",
    actorEmail: "accountant@school.com",
    reference: RECONCILIATION_PERIOD,
    entityType: "reconciliation",
    entityId: RECONCILIATION_PERIOD,
    details: "Monthly bank reconciliation started — 4 items need review",
    ipAddress: "192.168.1.42",
    metadata: { period: RECONCILIATION_PERIOD, flagged: "4" },
  },
  {
    id: "aud-005",
    timestamp: "2026-02-28T17:30:00",
    action: "payroll_run",
    actor: "HR + Finance",
    reference: "pr-2026-02",
    entityType: "payroll",
    entityId: "pr-2026-02",
    amount: 412500,
    details: "February payroll completed — 84 staff",
    metadata: { staffCount: "84" },
  },
  {
    id: "aud-006",
    timestamp: "2026-02-25T10:05:00",
    action: "fee_updated",
    actor: "Admin",
    actorEmail: "principal@school.com",
    reference: "fp-activities",
    entityType: "fee_plan",
    entityId: "fp-activities",
    details: "Activities fee due date extended to April 1",
    changes: [{ field: "dueDate", before: "2026-03-15", after: "2026-04-01" }],
  },
];

export const RECONCILIATION_ITEMS: ReconciliationItem[] = [
  {
    id: "rec-001",
    period: RECONCILIATION_PERIOD,
    bankDate: "2026-03-01",
    bankDescription: "WIRE DEPOSIT — MAYA CHEN",
    bankAmount: 180,
    bankReference: "BNK-0301-001",
    status: "matched",
    matchedPaymentId: "pay-002",
    matchedReceiptId: "RCP-20260215-002",
  },
  {
    id: "rec-002",
    period: RECONCILIATION_PERIOD,
    bankDate: "2026-03-02",
    bankDescription: "ACH CREDIT TUITION",
    bankAmount: 2000,
    bankReference: "BNK-0302-002",
    status: "flagged",
    flagReason: "Amount differs from nearest payment by $50",
  },
  {
    id: "rec-003",
    period: RECONCILIATION_PERIOD,
    bankDate: "2026-03-03",
    bankDescription: "CASH DEPOSIT BRANCH",
    bankAmount: 600,
    bankReference: "BNK-0303-003",
    status: "unmatched",
  },
  {
    id: "rec-004",
    period: RECONCILIATION_PERIOD,
    bankDate: "2026-03-04",
    bankDescription: "CARD SETTLEMENT BATCH",
    bankAmount: 450,
    bankReference: "BNK-0304-004",
    status: "unmatched",
  },
  {
    id: "rec-005",
    period: RECONCILIATION_PERIOD,
    bankDate: "2026-03-05",
    bankDescription: "TRANSFER LAB FEE",
    bankAmount: 450,
    bankReference: "BNK-0305-005",
    status: "flagged",
    flagReason: "Possible duplicate — payment pending verification",
    matchedPaymentId: "pay-004",
    matchedReceiptId: "RCP-20260301-004",
  },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentRecord["method"], string> = {
  card: "Card",
  bank: "Bank transfer",
  cash: "Cash",
  scholarship: "Scholarship",
};

export const EXPENSE_STATUS_STYLES: Record<ExpenseStatus, string> = {
  pending: "bg-brand-orange/15 text-brand-orange",
  approved: "bg-brand-blue/15 text-brand-blue",
  rejected: "bg-destructive/15 text-destructive",
  paid: "bg-green/15 text-green",
};

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-brand-blue/15 text-brand-blue",
  paid: "bg-green/15 text-green",
  overdue: "bg-destructive/15 text-destructive",
  partial: "bg-brand-orange/15 text-brand-orange",
};

export const ACCOUNTANT_DASHBOARD_STATS = [
  { id: "collected", label: "Collected", value: "$186,420", hint: "Spring term to date", tone: "green" as const },
  { id: "outstanding", label: "Outstanding", value: "$42,680", hint: "Unpaid balances", tone: "orange" as const },
  { id: "expenses", label: "Expenses", value: "$17,590", hint: "This month", tone: "purple" as const },
  { id: "payroll", label: "Payroll due", value: "$415,800", hint: "March run in progress", tone: "blue" as const },
];

export const ACCOUNTANT_QUICK_ACTIONS = [
  { href: "/accountant/payments", label: "Record payment", description: "Log cash, card, or transfer", iconName: "CreditCard" },
  { href: "/accountant/invoices", label: "Issue invoice", description: "Bill students by class or term", iconName: "FileText" },
  { href: "/accountant/expenses", label: "Review expenses", description: "Approve pending requests", iconName: "Wallet" },
  { href: "/accountant/payroll", label: "Process payroll", description: "Monthly salary runs and payslips", iconName: "Banknote" },
  { href: "/accountant/reports", label: "Finance reports", description: "Collections and cash flow", iconName: "BarChart" },
];

export function accountantHref(segment?: string) {
  const base = "/accountant";
  return segment ? `${base}/${segment}` : base;
}

export function paymentHref(paymentId: string) {
  return accountantHref(`payments/${paymentId}`);
}

export function invoiceHref(invoiceId: string) {
  return accountantHref(`invoices/${invoiceId}`);
}

export function auditHref(auditId: string) {
  return accountantHref(`audit/${auditId}`);
}

export function reconciliationHref() {
  return accountantHref("audit/reconciliation");
}

export function payrollHref(runId: string) {
  return accountantHref(`payroll/${runId}`);
}

export function payslipHref(runId: string, payslipId: string) {
  return accountantHref(`payroll/${runId}/payslips/${payslipId}`);
}

export function getPayrollRunById(id: string): PayrollRun | undefined {
  return PAYROLL_RUNS.find((run) => run.id === id);
}

export function getAuditEventById(id: string): AuditEvent | undefined {
  return AUDIT_EVENTS.find((event) => event.id === id);
}

export function resolveAuditEntityHref(event: AuditEvent): string | undefined {
  if (!event.entityId) return undefined;

  switch (event.entityType) {
    case "payment":
      return paymentHref(event.entityId);
    case "invoice":
      return invoiceHref(event.entityId);
    case "reconciliation":
      return reconciliationHref();
    case "payroll":
      return payrollHref(event.entityId);
    default:
      return undefined;
  }
}

export function getAuditStatsFromEvents(events: AuditEvent[]) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const eventsThisWeek = events.filter(
    (event) => new Date(event.timestamp).getTime() >= weekAgo,
  ).length;

  return {
    totalEvents: events.length,
    eventsThisWeek,
    flaggedReconciliation: RECONCILIATION_ITEMS.filter(
      (item) => item.status === "flagged" || item.status === "unmatched",
    ).length,
    reconciliationPeriod: RECONCILIATION_PERIOD,
  };
}

export function formatDisplayDate(dateKey: string) {
  return formatFeeDate(dateKey);
}

function enrichPayment(payment: PaymentRecord, index: number): LedgerPayment {
  const meta = BASE_LEDGER[index % BASE_LEDGER.length];
  return { ...payment, ...meta };
}

export function getSeedLedgerPayments(): LedgerPayment[] {
  return DEMO_PAYMENTS.map((payment, index) => enrichPayment(payment, index));
}

export function getLedgerPayments(): LedgerPayment[] {
  const live = getLiveFeePayments().map(livePaymentToRecord);
  const merged = [...live, ...DEMO_PAYMENTS.filter((p) => !live.some((l) => l.id === p.id))];
  return merged.map((payment, index) => enrichPayment(payment, index));
}

export function getPaymentById(id: string): LedgerPayment | undefined {
  return getLedgerPayments().find((p) => p.id === id);
}

export function getInvoiceById(id: string): SchoolInvoice | undefined {
  return SCHOOL_INVOICES.find((inv) => inv.id === id);
}

export function getFinanceSummary() {
  const payments = getLedgerPayments();
  const collected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = SCHOOL_INVOICES.reduce(
    (sum, inv) => sum + Math.max(0, inv.amount - inv.paidAmount),
    0,
  );
  const expensesMonth = EXPENSES.filter((e) => e.date.startsWith("2026-03"))
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = EXPENSES.filter((e) => e.status === "pending").length;
  return { collected, outstanding, expensesMonth, pendingExpenses };
}

export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    payment_recorded: "Payment recorded",
    invoice_issued: "Invoice issued",
    expense_approved: "Expense approved",
    payroll_run: "Payroll run",
    reconciliation: "Reconciliation",
    fee_updated: "Fee updated",
  };
  return labels[action];
}
