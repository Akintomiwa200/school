"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinanceInvoices, useRecordInvoicePayment } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  AuditBackLink,
  AuditDetailGrid,
  AuditPageShell,
  AuditSectionCard,
} from "./accountant-audit-ui";
import {
  INVOICE_STATUS_STYLES,
  SCHOOL_INVOICES,
  accountantHref,
  formatDisplayDate,
  getInvoiceById,
} from "./accountant-data";
import { formatCurrency } from "./accountant-ui";

export function AccountantInvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const isLoading = usePageLoading();
  const { data: invoices = SCHOOL_INVOICES, isFetching } = useFinanceInvoices(SCHOOL_INVOICES);
  const recordPayment = useRecordInvoicePayment();

  const invoice = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId) ?? getInvoiceById(invoiceId),
    [invoices, invoiceId],
  );

  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  if (!invoice) {
    return (
      <AuditPageShell>
        <div className="rounded-[20px] border border-border bg-background p-8 text-center">
          <h2 className="text-lg font-bold">Invoice not found</h2>
          <Button asChild variant="outline" className="mt-4 rounded-full px-4">
            <Link href={accountantHref("invoices")}>Back to invoices</Link>
          </Button>
        </div>
      </AuditPageShell>
    );
  }

  const balance = invoice.amount - invoice.paidAmount;

  const detailItems = [
    { label: "Student", value: invoice.studentName },
    { label: "Student ID", value: invoice.studentId, mono: true },
    { label: "Issued", value: formatDisplayDate(invoice.issuedDate) },
    { label: "Due date", value: formatDisplayDate(invoice.dueDate) },
    { label: "Term", value: invoice.term },
    { label: "Total amount", value: formatCurrency(invoice.amount) },
    { label: "Paid", value: formatCurrency(invoice.paidAmount) },
    { label: "Balance due", value: formatCurrency(balance) },
  ];

  return (
    <AuditPageShell className="space-y-5">
      <AuditBackLink href={accountantHref("invoices")} label="Back to invoices" />

      <div className="overflow-hidden rounded-[20px] border border-border border-l-4 border-l-brand-purple bg-background">
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/10">
                <FileText className="h-6 w-6 text-brand-purple" />
              </div>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">{invoice.invoiceNumber}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {invoice.label} · {invoice.term}
                </p>
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    INVOICE_STATUS_STYLES[invoice.status],
                  )}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Balance due</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand-orange">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <AuditSectionCard title="Invoice details">
          <AuditDetailGrid items={detailItems} />
        </AuditSectionCard>

        {balance > 0 ? (
          <AuditSectionCard title="Actions">
            <Button
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
              disabled={recordPayment.isPending}
              onClick={() => recordPayment.mutate({ invoiceId: invoice.id, amount: balance, method: "cash" })}
            >
              {recordPayment.isPending ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : null}
              Record payment
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Records a cash payment for the full balance and updates this invoice.
            </p>
          </AuditSectionCard>
        ) : null}
      </div>
    </AuditPageShell>
  );
}
