"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  INVOICE_STATUS_STYLES,
  accountantHref,
  formatDisplayDate,
  getInvoiceById,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

export function AccountantInvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const isLoading = usePageLoading();
  const invoice = getInvoiceById(invoiceId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!invoice) {
    return (
      <FinancePanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Invoice not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={accountantHref("invoices")}>Back to invoices</Link>
        </Button>
      </FinancePanel>
    );
  }

  const balance = invoice.amount - invoice.paidAmount;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={accountantHref("invoices")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to invoices
      </Link>

      <FinancePanel className="border border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-purple" />
              <h1 className="text-xl font-bold">{invoice.invoiceNumber}</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{invoice.label} · {invoice.term}</p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
              INVOICE_STATUS_STYLES[invoice.status],
            )}
          >
            {invoice.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailField label="Student" value={`${invoice.studentName} (${invoice.studentId})`} />
          <DetailField label="Issued" value={formatDisplayDate(invoice.issuedDate)} />
          <DetailField label="Due date" value={formatDisplayDate(invoice.dueDate)} />
          <DetailField label="Total amount" value={formatCurrency(invoice.amount)} />
          <DetailField label="Paid" value={formatCurrency(invoice.paidAmount)} />
          <DetailField label="Balance due" value={formatCurrency(balance)} highlight />
        </dl>

        {balance > 0 ? (
          <Button className="mt-5 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            Record payment against invoice
          </Button>
        ) : null}
      </FinancePanel>
    </div>
  );
}

function DetailField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/45 px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-sm font-semibold", highlight && "text-brand-orange")}>{value}</dd>
    </div>
  );
}
