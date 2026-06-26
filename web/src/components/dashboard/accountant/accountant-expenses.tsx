"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinanceExpenses } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { EXPENSES, EXPENSE_STATUS_STYLES, formatDisplayDate } from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

type ExpenseFilter = "all" | "pending" | "approved" | "paid";

export function AccountantExpenses() {
  const { data: expenses = EXPENSES, isFetching } = useFinanceExpenses(EXPENSES);
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [query, setQuery] = useState("");

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

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Expenses"
        description="Track school spending, vendor payments, and approval workflow."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending approval</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">{formatCurrency(pendingTotal)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This month</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(17590)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entries</p>
          <p className="mt-2 text-2xl font-bold">{filtered.length}</p>
        </FinancePanel>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "paid"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                filter === item
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((expense) => (
          <FinancePanel key={expense.id} className="border border-border">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
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
                <h3 className="mt-1 text-base font-bold">{expense.description}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expense.vendor} · Requested by {expense.requestedBy} · {formatDisplayDate(expense.date)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-xl font-bold">{formatCurrency(expense.amount)}</p>
                {expense.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 rounded-full bg-green text-white hover:bg-green/90">
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-full">
                      <X className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </FinancePanel>
        ))}
      </div>
    </div>
  );
}
