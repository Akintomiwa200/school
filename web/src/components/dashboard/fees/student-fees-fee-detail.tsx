"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  FEE_CATEGORY_LABELS,
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  formatDisplayDate,
  getFeeBalance,
  getFeeItemById,
  getPaymentHistory,
  payHref,
  paymentHref,
} from "./student-fees-data";
import { StudentFeesListSkeleton } from "./student-fees-skeleton";

export function StudentFeesFeeDetail({ feeId }: { feeId: string }) {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const fee = getFeeItemById(feeId);
  const relatedPayments = getPaymentHistory().filter((payment) => payment.feeIds?.includes(feeId));

  if (isLoading) {
    return <StudentFeesListSkeleton />;
  }

  if (!fee) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">Fee not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This fee item does not exist.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref()}>Back to overview</Link>
        </Button>
      </FeesPanel>
    );
  }

  const balance = getFeeBalance(fee);

  return (
    <div className="space-y-5">
      <Link href={feesHref()} className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Back to overview
      </Link>

      <FeesPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fee detail</p>
            <h2 className="mt-1 text-xl font-bold">{fee.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {fee.term} · {FEE_CATEGORY_LABELS[fee.category]}
            </p>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[fee.status])}>
            {FEE_STATUS_LABELS[fee.status]}
          </span>
        </div>

        {fee.description ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{fee.description}</p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Total amount</p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(fee.amount)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="mt-1 text-sm font-semibold text-green">{formatCurrency(fee.paidAmount)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Balance due</p>
            <p className="mt-1 text-sm font-semibold text-brand-orange">{formatCurrency(balance)}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">Due date: {formatDisplayDate(fee.dueDate)}</p>

        {balance > 0 ? (
          <Button asChild className="mt-5 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
            <Link href={payHref(fee.id)}>Pay {formatCurrency(balance)}</Link>
          </Button>
        ) : null}
      </FeesPanel>

      {relatedPayments.length > 0 ? (
        <FeesPanel>
          <h3 className="text-base font-bold">Payment history</h3>
          <div className="mt-4 space-y-2">
            {relatedPayments.map((payment) => (
              <Link
                key={payment.id}
                href={paymentHref(payment.id)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-semibold">{payment.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDisplayDate(payment.date)} · {payment.receiptId}
                  </p>
                </div>
                <p className="text-sm font-bold text-green">{formatCurrency(payment.amount)}</p>
              </Link>
            ))}
          </div>
        </FeesPanel>
      ) : null}
    </div>
  );
}
