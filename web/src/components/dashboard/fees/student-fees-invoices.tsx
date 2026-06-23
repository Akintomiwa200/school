"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileText, Search } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency } from "./fee-ui";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  formatDisplayDate,
  getFeeBalance,
  getFeeItemById,
  getInvoices,
  invoiceHref,
  payHref,
} from "./student-fees-data";
import { StudentFeesTableSkeleton } from "./student-fees-skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudentFeesInvoices() {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const [query, setQuery] = useState("");

  const invoices = useMemo(() => getInvoices(), [livePayments]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter(
      (invoice) =>
        invoice.label.toLowerCase().includes(normalized) ||
        invoice.invoiceNumber.toLowerCase().includes(normalized),
    );
  }, [invoices, query]);

  if (isLoading) {
    return <StudentFeesTableSkeleton />;
  }

  return (
    <div className="space-y-5">
      <FeesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoices</p>
          <h2 className="mt-1 text-lg font-bold">{filtered.length} invoices</h2>
          <p className="mt-1 text-sm text-muted-foreground">Spring 2026 term billing documents</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </FeesPanel>

      <FeesPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Invoice</th>
                <th className="pb-3 pr-4 font-medium">Issued</th>
                <th className="pb-3 pr-4 font-medium">Due</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => {
                const fee = getFeeItemById(invoice.feeId);
                const balance = fee ? getFeeBalance(fee) : invoice.amount - invoice.paidAmount;

                return (
                  <tr key={invoice.id} className="border-b border-border/60 last:border-none">
                    <td className="py-3 pr-4">
                      <Link href={invoiceHref(invoice.id)} className="font-semibold hover:text-brand-purple">
                        {invoice.label}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(invoice.issuedDate)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(invoice.dueDate)}</td>
                    <td className="py-3 pr-4">
                      <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[invoice.status])}>
                        {FEE_STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">{formatCurrency(invoice.amount)}</td>
                    <td className="py-3">
                      {invoice.status !== "paid" ? (
                        <Button asChild size="sm" className="h-8 rounded-full bg-brand-purple px-3 text-xs text-white">
                          <Link href={payHref(invoice.feeId)}>Pay</Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                          <Link href={invoiceHref(invoice.id)}>
                            <FileText className="mr-1 h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FeesPanel>
    </div>
  );
}
