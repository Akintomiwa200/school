import { addAuditEvent } from "@/lib/api/audit-entity-store";
import type { ExpenseEntry, FeePlan, PayrollRun, SchoolInvoice } from "@/components/dashboard/accountant/accountant-data";
import type { LedgerPayment } from "@/components/dashboard/accountant/accountant-data";

export function logPaymentRecorded(payment: LedgerPayment) {
  addAuditEvent({
    action: "payment_recorded",
    actor: payment.recordedBy,
    reference: payment.receiptId,
    entityType: "payment",
    entityId: payment.id,
    amount: payment.amount,
    details: payment.description,
    metadata: { studentId: payment.studentId, method: payment.method },
  });
}

export function logExpenseStatusChange(expense: ExpenseEntry, before: string, after: string, actor = "Finance Manager") {
  addAuditEvent({
    action: "expense_approved",
    actor,
    reference: expense.id,
    entityType: "expense",
    entityId: expense.id,
    amount: expense.amount,
    details: `${expense.description} — status ${after}`,
    changes: [{ field: "status", before, after }],
  });
}

export function logInvoiceIssued(invoice: SchoolInvoice, details: string) {
  addAuditEvent({
    action: "invoice_issued",
    actor: "J. Accountant",
    reference: invoice.invoiceNumber,
    entityType: "invoice",
    entityId: invoice.id,
    amount: invoice.amount,
    details,
    metadata: { studentId: invoice.studentId, term: invoice.term },
  });
}

export function logFeeUpdated(plan: FeePlan, changes: { field: string; before: string; after: string }[]) {
  addAuditEvent({
    action: "fee_updated",
    actor: "Admin",
    reference: plan.id,
    entityType: "fee_plan",
    entityId: plan.id,
    amount: plan.amount,
    details: `Fee plan "${plan.name}" updated`,
    changes,
  });
}

export function logPayrollEvent(
  action: "started" | "activated" | "finalized" | "cancelled" | "employee_added" | "employee_removed" | "payslip_updated",
  run: PayrollRun,
  details: string,
  actor = "Finance desk",
) {
  addAuditEvent({
    action: "payroll_run",
    actor,
    reference: run.id,
    entityType: "payroll",
    entityId: run.id,
    amount: run.totalAmount,
    details,
    metadata: { payrollAction: action, staffCount: String(run.staffCount), period: run.period },
  });
}

/** @deprecated Use logPayrollEvent */
export function logPayrollRun(run: PayrollRun) {
  logPayrollEvent("finalized", run, `${run.period} payroll completed — ${run.staffCount} staff`);
}
