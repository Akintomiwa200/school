"use client";

import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "../fees/fees-live-store";
import {
  PAYMENT_METHOD_LABELS,
  accountantHref,
  formatDisplayDate,
  getPaymentById,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

export function AccountantPaymentDetail({ paymentId }: { paymentId: string }) {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const payment = getPaymentById(paymentId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!payment) {
    return (
      <FinancePanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Payment not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This transaction does not exist.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={accountantHref("payments")}>Back to payments</Link>
        </Button>
      </FinancePanel>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={accountantHref("payments")}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to payments
      </Link>

      <FinancePanel className="border border-border text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
        <h2 className="mt-4 text-xl font-bold">Payment receipt</h2>
        <p className="mt-2 text-sm text-muted-foreground">{payment.description}</p>
        <p className="mt-4 text-3xl font-bold text-brand-purple">{formatCurrency(payment.amount)}</p>
        <span
          className={cn(
            "mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize",
            payment.status === "completed"
              ? "bg-green/15 text-green"
              : "bg-brand-orange/15 text-brand-orange",
          )}
        >
          {payment.status}
        </span>
      </FinancePanel>

      <FinancePanel className="border border-border">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Student" value={`${payment.studentName} (${payment.studentId})`} />
          <DetailField label="Receipt ID" value={payment.receiptId} mono />
          <DetailField label="Date" value={formatDisplayDate(payment.date)} />
          <DetailField label="Method" value={PAYMENT_METHOD_LABELS[payment.method]} />
          <DetailField label="Recorded by" value={payment.recordedBy} />
          <DetailField label="Reference" value={payment.id} mono />
        </div>
        <Button variant="outline" className="mt-5 w-full rounded-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Download receipt
        </Button>
      </FinancePanel>
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-muted/45 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", mono && "font-mono")}>{value}</p>
    </div>
  );
}
