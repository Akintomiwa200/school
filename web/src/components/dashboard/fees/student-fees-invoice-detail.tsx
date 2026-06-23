"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  formatDisplayDate,
  getFeeBalance,
  getFeeItemById,
  getInvoiceById,
  payHref,
} from "./student-fees-data";
import { StudentFeesListSkeleton } from "./student-fees-skeleton";

export function StudentFeesInvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const isLoading = usePageLoading();
  useLiveFeePayments();
  const invoice = getInvoiceById(invoiceId);
  const fee = invoice ? getFeeItemById(invoice.feeId) : undefined;
  const balance = fee ? getFeeBalance(fee) : 0;

  if (isLoading) {
    return <StudentFeesListSkeleton />;
  }

  if (!invoice) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">Invoice not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref("invoices")}>Back to invoices</Link>
        </Button>
      </FeesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={feesHref("invoices")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to invoices
      </Link>

      <FeesPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoice</p>
            <h2 className="mt-1 text-xl font-bold">{invoice.label}</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[invoice.status])}>
            {FEE_STATUS_LABELS[invoice.status]}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Issued</p>
            <p className="mt-1 text-sm font-semibold">{formatDisplayDate(invoice.issuedDate)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Due date</p>
            <p className="mt-1 text-sm font-semibold">{formatDisplayDate(invoice.dueDate)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Term</p>
            <p className="mt-1 text-sm font-semibold">{invoice.term}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(invoice.amount)}</p>
          </div>
        </div>

        {fee?.description ? (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{fee.description}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Amount paid</p>
            <p className="text-lg font-bold text-green">{formatCurrency(invoice.paidAmount)}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm text-muted-foreground">Balance due</p>
            <p className="text-lg font-bold text-brand-orange">{formatCurrency(balance)}</p>
          </div>
        </div>
      </FeesPanel>

      <div className="flex flex-wrap gap-3">
        {balance > 0 ? (
          <Button asChild className="rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
            <Link href={payHref(invoice.feeId)}>Pay {formatCurrency(balance)}</Link>
          </Button>
        ) : null}
        <Button variant="outline" className="rounded-full px-4">
          <Download className="mr-2 h-4 w-4" />
          Download invoice PDF
        </Button>
      </div>
    </div>
  );
}
