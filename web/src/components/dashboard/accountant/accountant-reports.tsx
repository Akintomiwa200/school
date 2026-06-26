"use client";

import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { EXPENSES, SCHOOL_INVOICES, getFinanceSummary } from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

export function AccountantReports() {
  const isLoading = usePageLoading();
  const summary = getFinanceSummary();

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
          label="Collection rate"
          value={`${Math.round((summary.collected / (summary.collected + summary.outstanding)) * 100)}%`}
          trend="up"
          change="+2%"
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
