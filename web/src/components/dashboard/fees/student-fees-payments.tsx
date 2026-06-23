"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency } from "./fee-ui";
import {
  PAYMENT_METHOD_LABELS,
  formatDisplayDate,
  getPaymentHistory,
  paymentHref,
  type PaymentRecord,
} from "./student-fees-data";
import { StudentFeesTableSkeleton } from "./student-fees-skeleton";

type PaymentFilter = "all" | "completed" | "pending";

const FILTERS: { id: PaymentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
];

function matchesFilter(payment: PaymentRecord, filter: PaymentFilter) {
  if (filter === "all") return true;
  return payment.status === filter;
}

export function StudentFeesPayments() {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [query, setQuery] = useState("");

  const payments = useMemo(() => getPaymentHistory(), [livePayments]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return payments.filter((payment) => {
      if (!matchesFilter(payment, filter)) return false;
      if (!normalized) return true;
      return (
        payment.description.toLowerCase().includes(normalized) ||
        payment.receiptId.toLowerCase().includes(normalized)
      );
    });
  }, [payments, filter, query]);

  const totalPaid = useMemo(
    () =>
      filtered
        .filter((payment) => payment.status === "completed")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [filtered],
  );

  if (isLoading) {
    return <StudentFeesTableSkeleton />;
  }

  return (
    <div className="space-y-5">
      <FeesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Payment history
          </p>
          <h2 className="mt-1 text-lg font-bold">{filtered.length} transactions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Total completed: <span className="font-semibold text-green">{formatCurrency(totalPaid)}</span>
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-full px-4">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </FeesPanel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === item.id
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search receipts"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <FeesPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Description</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 pr-4 font-medium">Receipt</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 pl-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-border/60 last:border-none">
                  <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(payment.date)}</td>
                  <td className="py-3 pr-4">
                    <Link href={paymentHref(payment.id)} className="font-medium hover:text-brand-purple">
                      {payment.description}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {payment.receiptId}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        payment.status === "completed"
                          ? "bg-green/15 text-green"
                          : payment.status === "pending"
                            ? "bg-brand-orange/15 text-brand-orange"
                            : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 pl-4">
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                      <Link href={`/student/fees/payments/${payment.id}/receipt`}>
                        <Receipt className="mr-1.5 h-3.5 w-3.5" />
                        Receipt
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payments match your search.
          </p>
        ) : null}
      </FeesPanel>
    </div>
  );
}
