"use client";

import { Download, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinanceSummary, usePayrollReports } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { EXPENSES, SCHOOL_INVOICES, accountantHref, getFinanceSummary, payrollHref } from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";
import type { FinanceSummary } from "@/hooks/use-dashboard-data";

const REPORTS_SUMMARY_FALLBACK: FinanceSummary = {
  ...getFinanceSummary(),
  pendingExpenseTotal: EXPENSES.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0),
  payrollDue: 415800,
  overdueInvoices: SCHOOL_INVOICES.filter((i) => i.status === "overdue" || i.status === "partial").length,
  paymentCount: 0,
  invoiceCount: SCHOOL_INVOICES.length,
  expenseCount: EXPENSES.length,
};

export function AccountantReports() {
  const isLoading = usePageLoading();
  const { data: summary = REPORTS_SUMMARY_FALLBACK } = useFinanceSummary(REPORTS_SUMMARY_FALLBACK);
  const { data: payrollReports } = usePayrollReports();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  const collectionsByCategory = [
    { label: "Tuition", amount: 142800, pct: 62 },
    { label: "Transport", amount: 28400, pct: 12 },
    { label: "Lab & activities", amount: 18600, pct: 8 },
    { label: "Other", amount: 41220, pct: 18 },
  ];

  const expenseByCategory = EXPENSES.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] ?? 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Finance reports"
        description="Revenue, collections, expenses, and cash-flow summaries."
        action={
          <Button variant="outline" className="h-10 rounded-full px-5">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStat label="Collected (term)" value={formatCurrency(summary.collected)} trend="up" change="+12%" />
        <ReportStat label="Outstanding" value={formatCurrency(summary.outstanding)} trend="down" change="-4%" />
        <ReportStat label="Expenses (month)" value={formatCurrency(summary.expensesMonth)} trend="up" change="+8%" />
        <ReportStat
          label="Payroll YTD"
          value={formatCurrency(payrollReports?.totalNetYtd ?? 0)}
          trend="up"
          change={`${payrollReports?.completedRuns ?? 0} runs`}
        />
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Collections by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Spring 2026 fee collections</p>
          <ul className="mt-5 space-y-4">
            {collectionsByCategory.map((item) => (
              <li key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-bold">{formatCurrency(item.amount)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-purple"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </FinancePanel>

        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Expense breakdown</h2>
          <p className="mt-1 text-sm text-muted-foreground">By category — current period</p>
          <ul className="mt-5 space-y-3">
            {Object.entries(expenseByCategory).map(([category, amount]) => (
              <li key={category} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm font-bold">{formatCurrency(amount)}</span>
              </li>
            ))}
          </ul>
        </FinancePanel>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <FinancePanel className="border border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Payroll by department</h2>
              <p className="mt-1 text-sm text-muted-foreground">YTD net pay breakdown</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={accountantHref("payroll")}>Payroll</Link>
            </Button>
          </div>
          <ul className="mt-5 space-y-3">
            {(payrollReports?.byDepartment ?? []).slice(0, 6).map((dept) => (
              <li key={dept.department} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                <span className="text-sm font-medium">
                  {dept.department}
                  <span className="ml-2 text-xs text-muted-foreground">({dept.staffCount})</span>
                </span>
                <span className="text-sm font-bold">{formatCurrency(dept.totalNet)}</span>
              </li>
            ))}
          </ul>
        </FinancePanel>

        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Payroll summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">{payrollReports?.year ?? new Date().getFullYear()} year to date</p>
          <ul className="mt-5 space-y-3">
            <li className="flex justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
              <span>Total disbursed</span>
              <span className="font-bold">{formatCurrency(payrollReports?.totalDisbursed ?? 0)}</span>
            </li>
            <li className="flex justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
              <span>Tax withheld</span>
              <span className="font-bold text-brand-orange">{formatCurrency(payrollReports?.totalTaxYtd ?? 0)}</span>
            </li>
            <li className="flex justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
              <span>Active run due</span>
              <span className="font-bold text-brand-purple">{formatCurrency(summary.payrollDue)}</span>
            </li>
          </ul>
          {payrollReports?.activeRun ? (
            <Button asChild className="mt-4 w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
              <Link href={payrollHref(payrollReports.activeRun.id)}>Review {payrollReports.activeRun.period}</Link>
            </Button>
          ) : null}
        </FinancePanel>
      </div>

      <FinancePanel className="border border-border">
        <h2 className="text-base font-bold">Invoice aging</h2>
        <p className="mt-1 text-sm text-muted-foreground">Outstanding balances by due status</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <AgingBucket label="Current" count={SCHOOL_INVOICES.filter((i) => i.status === "sent").length} amount={220} />
          <AgingBucket
            label="Partial"
            count={SCHOOL_INVOICES.filter((i) => i.status === "partial").length}
            amount={1200}
            tone="orange"
          />
          <AgingBucket
            label="Overdue"
            count={SCHOOL_INVOICES.filter((i) => i.status === "overdue").length}
            amount={450}
            tone="red"
          />
        </div>
      </FinancePanel>
    </div>
  );
}

function ReportStat({
  label,
  value,
  trend,
  change,
}: {
  label: string;
  value: string;
  trend: "up" | "down";
  change: string;
}) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const color = trend === "up" ? "text-green" : "text-brand-orange";

  return (
    <FinancePanel className="border border-border">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold", color)}>
        <Icon className="h-3.5 w-3.5" />
        {change} vs last term
      </p>
    </FinancePanel>
  );
}

function AgingBucket({
  label,
  count,
  amount,
  tone = "default",
}: {
  label: string;
  count: number;
  amount: number;
  tone?: "default" | "orange" | "red";
}) {
  const styles = {
    default: "border-border",
    orange: "border-brand-orange/30 bg-brand-orange/5",
    red: "border-destructive/30 bg-destructive/5",
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-4", styles)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold">{count} invoices</p>
      <p className="mt-1 text-sm font-semibold text-brand-orange">{formatCurrency(amount)}</p>
    </div>
  );
}
