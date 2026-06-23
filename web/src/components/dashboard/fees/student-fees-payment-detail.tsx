"use client";

import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { receiptHref } from "./fees-checkout-storage";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  PAYMENT_METHOD_LABELS,
  formatDisplayDate,
  getFeeItems,
  getPaymentById,
} from "./student-fees-data";
import { StudentFeesListSkeleton } from "./student-fees-skeleton";

export function StudentFeesPaymentDetail({ paymentId }: { paymentId: string }) {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const payment = getPaymentById(paymentId);
  const linkedFees = payment?.feeIds
    ? getFeeItems().filter((fee) => payment.feeIds?.includes(fee.id))
    : [];

  if (isLoading) {
    return <StudentFeesListSkeleton />;
  }

  if (!payment) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">Payment not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This receipt does not exist.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref("payments")}>Back to payments</Link>
        </Button>
      </FeesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={feesHref("payments")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to payments
      </Link>

      <FeesPanel className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
        <h2 className="mt-4 text-xl font-bold">Payment receipt</h2>
        <p className="mt-2 text-sm text-muted-foreground">{payment.description}</p>
        <p className="mt-4 text-3xl font-bold text-brand-purple">{formatCurrency(payment.amount)}</p>
        <span
          className={cn(
            "mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold",
            payment.status === "completed"
              ? "bg-green/15 text-green"
              : payment.status === "pending"
                ? "bg-brand-orange/15 text-brand-orange"
                : "bg-destructive/15 text-destructive",
          )}
        >
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      </FeesPanel>

      <FeesPanel>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Receipt ID</p>
            <p className="mt-1 font-mono text-sm font-semibold">{payment.receiptId}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="mt-1 text-sm font-semibold">{formatDisplayDate(payment.date)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Payment method</p>
            <p className="mt-1 text-sm font-semibold">{PAYMENT_METHOD_LABELS[payment.method]}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <p className="mt-1 font-mono text-sm font-semibold">{payment.id}</p>
          </div>
        </div>

        {linkedFees.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-bold">Fees covered</h3>
            <ul className="mt-3 space-y-2">
              {linkedFees.map((fee) => (
                <li key={fee.id} className="flex justify-between text-sm">
                  <span>{fee.label}</span>
                  <span className="font-medium">{formatCurrency(fee.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </FeesPanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
          <Link href={receiptHref(paymentId)}>
            <Download className="mr-2 h-4 w-4" />
            View & download receipt
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-4">
          <Link href={feesHref("payments")}>All payments</Link>
        </Button>
      </div>
    </div>
  );
}
