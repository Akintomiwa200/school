"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { receiptHref } from "./fees-checkout-storage";
import { FeesPaySteps } from "./fees-pay-steps";
import { getLivePaymentById, useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  PAYMENT_METHOD_LABELS,
  formatDisplayDate,
  getPaymentById,
  paymentHref,
} from "./student-fees-data";
import { StudentFeesListSkeleton } from "./student-fees-skeleton";

export function StudentFeesPayConfirmation() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? "";
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();

  const payment = useMemo(() => {
    if (!paymentId) return undefined;
    const live = getLivePaymentById(paymentId);
    if (live) {
      return {
        id: live.id,
        date: live.date,
        description: live.description,
        amount: live.amount,
        method: live.method,
        receiptId: live.receiptId,
        status: live.status,
        feeIds: live.feeIds,
      };
    }
    return getPaymentById(paymentId);
  }, [paymentId, livePayments]);

  const liveMeta = paymentId ? getLivePaymentById(paymentId) : undefined;

  if (isLoading) {
    return <StudentFeesListSkeleton />;
  }

  if (!payment) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">Confirmation not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This payment confirmation is unavailable.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref()}>Back to fees</Link>
        </Button>
      </FeesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <FeesPanel>
        <FeesPaySteps currentStep={3} />
      </FeesPanel>

      <FeesPanel className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-green">Payment confirmed</p>
        <h2 className="mt-2 text-2xl font-bold">Thank you!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment of <span className="font-semibold text-foreground">{formatCurrency(payment.amount)}</span> was
          processed successfully.
        </p>
        <p className="mt-4 text-3xl font-bold text-brand-purple">{formatCurrency(payment.amount)}</p>
      </FeesPanel>

      <FeesPanel>
        <h3 className="text-base font-bold">Transaction details</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Receipt number</p>
            <p className="mt-1 font-mono text-sm font-semibold">{payment.receiptId}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="mt-1 text-sm font-semibold">{formatDisplayDate(payment.date)}</p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Payment method</p>
            <p className="mt-1 text-sm font-semibold">
              {PAYMENT_METHOD_LABELS[payment.method]}
              {liveMeta?.cardLast4 ? ` ·••• ${liveMeta.cardLast4}` : ""}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/45 px-4 py-3">
            <p className="text-xs text-muted-foreground">Gateway reference</p>
            <p className="mt-1 font-mono text-xs font-semibold">
              {liveMeta?.gatewaySessionId ?? payment.id}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{payment.description}</p>
      </FeesPanel>

      <FeesPanel className="border border-green/25 bg-green/5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 text-green" />
          <div>
            <p className="text-sm font-bold">Receipt generated</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your official receipt <span className="font-mono">{payment.receiptId}</span> is ready to view and
              download.
            </p>
          </div>
        </div>
      </FeesPanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
          <Link href={receiptHref(payment.id)}>
            <FileText className="mr-2 h-4 w-4" />
            View receipt
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-4">
          <Link href={receiptHref(payment.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-4">
          <Link href={paymentHref(payment.id)}>Payment details</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full px-4">
          <Link href={feesHref()}>Back to fees</Link>
        </Button>
      </div>
    </div>
  );
}
