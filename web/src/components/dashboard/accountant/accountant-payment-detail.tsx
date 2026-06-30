"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  downloadPaymentReceiptFromApi,
  printPaymentReceiptFromApi,
} from "../fees/fees-receipt";
import { useFinancePayments } from "@/hooks/use-dashboard-data";
import { useLiveFeePayments } from "../fees/fees-live-store";
import type { PaymentRecord } from "../fees/student-fees-data";
import {
  AuditBackLink,
  AuditDetailGrid,
  AuditPageShell,
  AuditSectionCard,
} from "./accountant-audit-ui";
import {
  PAYMENT_METHOD_LABELS,
  accountantHref,
  formatDisplayDate,
  getPaymentById,
  getSeedLedgerPayments,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

const STATUS_CONFIG: Record<
  PaymentRecord["status"],
  { label: string; badgeClass: string; iconClass: string; accentClass: string; Icon: typeof CheckCircle2 }
> = {
  completed: {
    label: "Completed",
    badgeClass: "bg-green/15 text-green",
    iconClass: "bg-green/10 text-green",
    accentClass: "border-green",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    badgeClass: "bg-brand-orange/15 text-brand-orange",
    iconClass: "bg-brand-orange/10 text-brand-orange",
    accentClass: "border-brand-orange",
    Icon: Clock,
  },
  failed: {
    label: "Failed",
    badgeClass: "bg-destructive/15 text-destructive",
    iconClass: "bg-destructive/10 text-destructive",
    accentClass: "border-destructive",
    Icon: Clock,
  },
};

export function AccountantPaymentDetail({ paymentId }: { paymentId: string }) {
  const isLoading = usePageLoading();
  const [receiptAction, setReceiptAction] = useState<"download" | "print" | null>(null);
  const livePayments = useLiveFeePayments();
  const { data: payments = getSeedLedgerPayments() } = useFinancePayments(getSeedLedgerPayments());
  const payment = useMemo(
    () => payments.find((p) => p.id === paymentId) ?? getPaymentById(paymentId),
    [payments, paymentId, livePayments],
  );

  if (isLoading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  if (!payment) {
    return (
      <AuditPageShell>
        <FinancePanel className="border border-border text-center">
          <h2 className="text-lg font-bold">Payment not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This transaction does not exist.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full px-4">
            <Link href={accountantHref("payments")}>Back to payments</Link>
          </Button>
        </FinancePanel>
      </AuditPageShell>
    );
  }

  const status = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.Icon;

  const detailItems = [
    { label: "Student", value: payment.studentName },
    { label: "Student ID", value: payment.studentId, mono: true },
    { label: "Receipt ID", value: payment.receiptId, mono: true },
    { label: "Payment date", value: formatDisplayDate(payment.date) },
    { label: "Payment method", value: PAYMENT_METHOD_LABELS[payment.method] },
    { label: "Recorded by", value: payment.recordedBy },
    { label: "Reference", value: payment.id, mono: true, span: true },
  ];

  async function handleDownloadReceipt() {
    if (!payment) return;
    setReceiptAction("download");
    try {
      downloadPaymentReceiptFromApi(payment.id);
    } finally {
      window.setTimeout(() => setReceiptAction(null), 600);
    }
  }

  async function handlePrintReceipt() {
    if (!payment) return;
    setReceiptAction("print");
    try {
      await printPaymentReceiptFromApi(payment.id);
    } catch {
      // Silent — user can retry
    } finally {
      setReceiptAction(null);
    }
  }

  return (
    <AuditPageShell className="space-y-5">
      <AuditBackLink href={accountantHref("payments")} label="Back to payments" />

      <div
        className={cn(
          "overflow-hidden rounded-[20px] border border-border bg-background border-l-4",
          status.accentClass,
        )}
      >
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-4 lg:gap-5">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl lg:h-14 lg:w-14",
                  status.iconClass,
                )}
              >
                <CreditCard className="h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-blue/15 px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
                    Payment receipt
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      status.badgeClass,
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    {status.label}
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                  {payment.description}
                </h1>
                <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">{payment.receiptId}</p>
                <p className="mt-3 text-sm text-muted-foreground lg:text-base">
                  <span className="font-medium text-foreground">{payment.studentName}</span>
                  {" · "}
                  {payment.studentId}
                  {" · "}
                  {formatDisplayDate(payment.date)}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-right lg:min-w-[180px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Amount paid</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand-purple lg:text-3xl">
                {formatCurrency(payment.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_METHOD_LABELS[payment.method]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <AuditSectionCard title="Transaction details">
          <AuditDetailGrid items={detailItems} />
        </AuditSectionCard>

        <div className="space-y-4 lg:sticky lg:top-6">
          <AuditSectionCard title="Receipt actions">
            <div className="flex flex-col gap-2">
              <Button
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
                onClick={() => void handleDownloadReceipt()}
                disabled={receiptAction !== null}
              >
                {receiptAction === "download" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 shrink-0" />
                )}
                Download receipt
              </Button>
              <Button
                variant="outline"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5"
                onClick={() => void handlePrintReceipt()}
                disabled={receiptAction !== null}
              >
                {receiptAction === "print" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 shrink-0" />
                )}
                Print receipt
              </Button>
            </div>
          </AuditSectionCard>

          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Recorded by <span className="font-semibold text-foreground">{payment.recordedBy}</span> on{" "}
              {formatDisplayDate(payment.date)}. Receipt{" "}
              <span className="font-mono font-medium text-foreground">{payment.receiptId}</span> is available for
              download and printing.
            </p>
          </div>
        </div>
      </div>
    </AuditPageShell>
  );
}
