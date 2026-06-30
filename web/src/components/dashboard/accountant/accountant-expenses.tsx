"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useExpenseAction, useFinanceExpenses } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { AuditPageShell } from "./accountant-audit-ui";
import { EXPENSES, EXPENSE_STATUS_STYLES, formatDisplayDate } from "./accountant-data";
import {
  FinanceFilterSelect,
  FinanceListToolbar,
  FinancePanel,
  FinanceSearchBar,
  formatCurrency,
} from "./accountant-ui";

type ExpenseFilter = "all" | "pending" | "approved" | "paid" | "rejected";

export function AccountantExpenses() {
  const { data: expenses = EXPENSES, isFetching } = useFinanceExpenses(EXPENSES);
  const expenseAction = useExpenseAction();
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const monthPrefix = new Date().toISOString().slice(0, 7);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (filter !== "all" && expense.status !== filter) return false;
      if (!normalized) return true;
      return (
        expense.description.toLowerCase().includes(normalized) ||
        expense.vendor.toLowerCase().includes(normalized) ||
        expense.category.toLowerCase().includes(normalized)
      );
    });
  }, [expenses, filter, query]);

  const pendingTotal = useMemo(
    () => expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const monthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, monthPrefix],
  );

  async function handleAction(expenseId: string, action: "approve" | "reject") {
    setPendingId(expenseId);
    try {
      await expenseAction.mutateAsync({ expenseId, action });
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  return (
    <AuditPageShell>
      <ManagementPageHeader
        title="Expenses"
        description="Track school spending, vendor payments, and approval workflow."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending approval</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-orange lg:text-3xl">
            {formatCurrency(pendingTotal)}
          </p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This month</p>
          <p className="mt-2 text-2xl font-bold tabular-nums lg:text-3xl">{formatCurrency(monthTotal)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entries</p>
          <p className="mt-2 text-2xl font-bold tabular-nums lg:text-3xl">{expenses.length}</p>
        </FinancePanel>
      </div>

      <FinanceListToolbar eyebrow="Expense entries" title={`${filtered.length} expenses`}>
        <FinanceSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search expenses"
          className="sm:w-56"
        />
        <FinanceFilterSelect
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All status" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "paid", label: "Paid" },
            { id: "rejected", label: "Rejected" },
          ]}
          className="min-w-[160px]"
        />
      </FinanceListToolbar>

      <div className="space-y-3">
        {filtered.map((expense) => {
          const isPending = pendingId === expense.id && expenseAction.isPending;
          return (
            <FinancePanel key={expense.id} className="border border-border">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{expense.category}</span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                        EXPENSE_STATUS_STYLES[expense.status],
                      )}
                    >
                      {expense.status}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-bold lg:text-lg">{expense.description}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {expense.vendor} · Requested by {expense.requestedBy} · {formatDisplayDate(expense.date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="text-xl font-bold tabular-nums">{formatCurrency(expense.amount)}</p>
                  {expense.status === "pending" ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={isPending}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-green px-4 text-white hover:bg-green/90"
                        onClick={() => handleAction(expense.id, "approve")}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4"
                        onClick={() => handleAction(expense.id, "reject")}
                      >
                        <X className="h-3.5 w-3.5 shrink-0" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </FinancePanel>
          );
        })}
      </div>
    </AuditPageShell>
  );
}
