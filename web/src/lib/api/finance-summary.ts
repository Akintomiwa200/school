import { getMutableExpenses, getExpenseStats } from "@/lib/api/expense-entity-store";
import { getMutableInvoices } from "@/lib/api/invoice-entity-store";
import { getMutableLedgerPayments } from "@/lib/api/payment-entity-store";
import { getMutablePayrollRuns } from "@/lib/api/payroll-entity-store";

export function getFinanceSummaryFromStores(monthPrefix = new Date().toISOString().slice(0, 7)) {
  const payments = getMutableLedgerPayments();
  const invoices = getMutableInvoices();
  const expenseStats = getExpenseStats(monthPrefix);
  const payrollRuns = getMutablePayrollRuns();

  const collected = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const outstanding = invoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.amount - invoice.paidAmount),
    0,
  );

  const activeRun = payrollRuns.find((run) => run.status === "processing");

  const payrollDue =
    activeRun?.totalAmount ??
    payrollRuns.find((run) => run.status === "draft")?.totalAmount ??
    0;

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "overdue" || invoice.status === "partial",
  ).length;

  const pendingExpenses = getMutableExpenses().filter((expense) => expense.status === "pending").length;

  return {
    collected,
    outstanding,
    expensesMonth: expenseStats.monthTotal,
    pendingExpenses,
    pendingExpenseTotal: expenseStats.pendingTotal,
    payrollDue,
    activePayrollRunId: activeRun?.id ?? null,
    activePayrollPeriod: activeRun?.period ?? null,
    overdueInvoices,
    paymentCount: payments.length,
    invoiceCount: invoices.length,
    expenseCount: expenseStats.count,
  };
}
