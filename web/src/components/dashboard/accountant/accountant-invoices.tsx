"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useBulkBilling, useFinanceInvoices } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import {
  INVOICE_STATUS_STYLES,
  SCHOOL_INVOICES,
  formatDisplayDate,
  invoiceHref,
} from "./accountant-data";
import {
  FinanceFilterSelect,
  FinanceListToolbar,
  FinancePanel,
  FinanceSearchBar,
  formatCurrency,
} from "./accountant-ui";

type InvoiceFilter = "all" | "overdue" | "paid" | "sent";

export function AccountantInvoices() {
  const { data: invoices = SCHOOL_INVOICES, isFetching } = useFinanceInvoices(SCHOOL_INVOICES);
  const bulkBilling = useBulkBilling();
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (filter === "overdue" && invoice.status !== "overdue" && invoice.status !== "partial") return false;
      if (filter === "paid" && invoice.status !== "paid") return false;
      if (filter === "sent" && invoice.status !== "sent") return false;
      if (!normalized) return true;
      return (
        invoice.studentName.toLowerCase().includes(normalized) ||
        invoice.invoiceNumber.toLowerCase().includes(normalized) ||
        invoice.label.toLowerCase().includes(normalized)
      );
    });
  }, [invoices, filter, query]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Invoices"
        description="Issue and manage student fee invoices — draft, sent, paid, and overdue."
        action={
          <Button
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
            disabled={bulkBilling.isPending}
            onClick={() => bulkBilling.mutate()}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {bulkBilling.isPending ? "Issuing…" : "Bulk billing"}
          </Button>
        }
      />

      <FinanceListToolbar eyebrow="Invoice list" title={`${filtered.length} invoices`}>
        <FinanceSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search invoices"
          className="sm:w-56"
        />
        <FinanceFilterSelect
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All status" },
            { id: "overdue", label: "Overdue / partial" },
            { id: "sent", label: "Sent" },
            { id: "paid", label: "Paid" },
          ]}
          className="min-w-[180px]"
        />
      </FinanceListToolbar>

      <FinancePanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link href={invoiceHref(invoice.id)} className="font-semibold hover:text-brand-purple">
                    {invoice.invoiceNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">{invoice.label}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{invoice.studentName}</p>
                  <p className="text-xs text-muted-foreground">{invoice.studentId}</p>
                </td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(invoice.amount)}</td>
                <td className="px-4 py-3 font-semibold text-brand-orange">
                  {formatCurrency(invoice.amount - invoice.paidAmount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      INVOICE_STATUS_STYLES[invoice.status],
                    )}
                  >
                    {invoice.status}
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
