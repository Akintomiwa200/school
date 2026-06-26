"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinancePayments } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "../fees/fees-live-store";
import { ManagementPageHeader } from "../management/management-ui";
import {
  PAYMENT_METHOD_LABELS,
  formatDisplayDate,
  getLedgerPayments,
  paymentHref,
  type LedgerPayment,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

type PaymentFilter = "all" | "completed" | "pending";

export function AccountantPayments() {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const fallbackPayments = useMemo(() => getLedgerPayments(), [livePayments]);
  const { data: apiPayments = fallbackPayments, isFetching } = useFinancePayments(fallbackPayments);
  const loading = isLoading || isFetching;
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [query, setQuery] = useState("");

  const payments = apiPayments;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return payments.filter((payment) => {
      if (filter !== "all" && payment.status !== filter) return false;
      if (!normalized) return true;
      return (
        payment.studentName.toLowerCase().includes(normalized) ||
        payment.description.toLowerCase().includes(normalized) ||
        payment.receiptId.toLowerCase().includes(normalized)
      );
    });
  }, [payments, filter, query]);

  const totalCompleted = useMemo(
    () =>
      filtered.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    [filtered],
  );

  if (loading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Payments"
        description="Record and reconcile fee payments across all students."
      />

      <FinancePanel className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment ledger</p>
          <h2 className="mt-1 text-lg font-bold">{filtered.length} transactions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed total: <span className="font-semibold text-green">{formatCurrency(totalCompleted)}</span>
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-full px-4">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </FinancePanel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "completed", "pending"] as const).map((item) => (
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
            placeholder="Search student or receipt"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <FinancePanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </tbody>
        </table>
      </FinancePanel>
    </div>
  );
}

function PaymentRow({ payment }: { payment: LedgerPayment }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20">
      <td className="px-4 py-3">
        <Link href={paymentHref(payment.id)} className="font-semibold hover:text-brand-purple">
          {payment.studentName}
        </Link>
        <p className="text-xs text-muted-foreground">{payment.studentId}</p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{payment.description}</td>
      <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
      <td className="px-4 py-3 text-muted-foreground">{PAYMENT_METHOD_LABELS[payment.method]}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(payment.date)}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
            payment.status === "completed"
              ? "bg-green/15 text-green"
              : payment.status === "pending"
                ? "bg-brand-orange/15 text-brand-orange"
                : "bg-destructive/15 text-destructive",
          )}
        >
          {payment.status}
        </span>
      </td>
    </tr>
  );
}
