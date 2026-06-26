"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinanceFees } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { FEE_PLANS, formatDisplayDate } from "./accountant-data";
import { FinancePanel } from "./accountant-ui";
import { formatCurrency } from "./accountant-ui";

type StatusFilter = "all" | "active" | "draft";

export function AccountantFees() {
  const { data: feePlans = FEE_PLANS, isFetching } = useFinanceFees(FEE_PLANS);
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return feePlans.filter((plan) => {
      if (filter !== "all" && plan.status !== filter) return false;
      if (!normalized) return true;
      return (
        plan.name.toLowerCase().includes(normalized) ||
        plan.category.toLowerCase().includes(normalized) ||
        plan.grades.toLowerCase().includes(normalized)
      );
    });
  }, [feePlans, filter, query]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Fee structure"
        description="Define fee types, amounts, and billing schedules by grade and term."
        action={
          <Button className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            New fee plan
          </Button>
        }
      />

      <FinancePanel className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active plans</p>
          <h2 className="mt-1 text-lg font-bold">{filtered.length} fee plans</h2>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </FinancePanel>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "draft"] as const).map((item) => (
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

      <FinancePanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Fee plan</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Grades</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plan) => (
              <tr key={plan.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.term}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{plan.category}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(plan.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{plan.grades}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(plan.dueDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      plan.status === "active"
                        ? "bg-green/15 text-green"
                        : plan.status === "draft"
                          ? "bg-brand-orange/15 text-brand-orange"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {plan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FinancePanel>
    </div>
  );
}
