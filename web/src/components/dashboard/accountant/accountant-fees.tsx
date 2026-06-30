"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useCreateFeePlan, useFinanceFees } from "@/hooks/use-dashboard-data";
import { AuditPageShell } from "./accountant-audit-ui";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { FEE_PLANS, formatDisplayDate } from "./accountant-data";
import {
  FinanceFilterSelect,
  FinanceListToolbar,
  FinancePanel,
  FinanceSearchBar,
  formatCurrency,
} from "./accountant-ui";

type StatusFilter = "all" | "active" | "draft";

export function AccountantFees() {
  const { data: feePlans = FEE_PLANS, isFetching } = useFinanceFees(FEE_PLANS);
  const createFeePlan = useCreateFeePlan();
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Tuition",
    amount: "",
    term: "Spring 2026",
    grades: "All grades",
    dueDate: "2026-04-01",
  });

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

  async function handleCreateFeePlan() {
    if (!form.name || !form.amount) return;
    await createFeePlan.mutateAsync({
      name: form.name,
      category: form.category,
      amount: Number(form.amount),
      term: form.term,
      grades: form.grades,
      dueDate: form.dueDate,
      status: "draft",
    });
    setShowForm(false);
    setForm({ name: "", category: "Tuition", amount: "", term: "Spring 2026", grades: "All grades", dueDate: "2026-04-01" });
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
        title="Fee structure"
        description="Define fee types, amounts, and billing schedules by grade and term."
        action={
          <Button
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
            onClick={() => setShowForm((open) => !open)}
          >
            <Plus className="h-4 w-4 shrink-0" />
            New fee plan
          </Button>
        }
      />

      {showForm ? (
        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Create fee plan</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-border px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-border px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Amount</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-border px-3"
              />
            </label>
          </div>
          <Button
            className="mt-4 inline-flex h-10 shrink-0 rounded-full bg-brand-purple px-5 text-white"
            disabled={createFeePlan.isPending}
            onClick={handleCreateFeePlan}
          >
            {createFeePlan.isPending ? "Saving…" : "Save fee plan"}
          </Button>
        </FinancePanel>
      ) : null}

      <FinanceListToolbar eyebrow="Active plans" title={`${filtered.length} fee plans`}>
        <FinanceSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search plans"
          className="sm:w-56"
        />
        <FinanceFilterSelect
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All status" },
            { id: "active", label: "Active" },
            { id: "draft", label: "Draft" },
          ]}
        />
      </FinanceListToolbar>

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
    </AuditPageShell>
  );
}
