"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { FeesPaySteps } from "./fees-pay-steps";
import { getLivePaymentById, useLiveFeePayments } from "./fees-live-store";
import { receiptHref } from "./fees-checkout-storage";
import { buildReceiptData, downloadReceiptPdf, type ReceiptData } from "./fees-receipt";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  PAYMENT_METHOD_LABELS,
  formatDisplayDate,
  getFeeItems,
  getPaymentById,
  paymentHref,
} from "./student-fees-data";
import { StudentFeesListSkeleton } from "./student-fees-skeleton";

const DEFAULT_STUDENT = { name: "Alex Johnson", studentId: "STU-2024-118" };

export function StudentFeesReceipt({ paymentId }: { paymentId: string }) {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const { data: session } = useSession();
  const [apiReceipt, setApiReceipt] = useState<ReceiptData | null>(null);

  const payment = useMemo(() => getPaymentById(paymentId), [paymentId, livePayments]);
  const liveMeta = getLivePaymentById(paymentId);
  const linkedFees = payment?.feeIds
    ? getFeeItems().filter((fee) => payment.feeIds?.includes(fee.id))
    : [];

  const studentName = session?.user?.name ?? DEFAULT_STUDENT.name;
  const studentId = DEFAULT_STUDENT.studentId;

  const localReceipt = useMemo(() => {
    if (!payment) return null;
    return buildReceiptData({
      payment,
      studentName,
      studentId,
      feeLines: linkedFees.map((fee) => ({ label: fee.label, amount: fee.amount })),
    });
  }, [payment, studentName, studentId, linkedFees]);

  useEffect(() => {
    if (!paymentId) return;
    void fetch(`/api/v1/fees/receipt/${paymentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const data = json.data as ReceiptData;
          setApiReceipt({
            ...data,
            amountFormatted: formatCurrency(data.amount),
            dateFormatted: formatDisplayDate(data.date),
            methodLabel: PAYMENT_METHOD_LABELS[data.method as keyof typeof PAYMENT_METHOD_LABELS] ?? data.method,
            feeLines: (data.feeLines ?? []).map((line) => ({
              ...line,
              amountFormatted: formatCurrency(line.amount),
            })),
          });
        }
      })
      .catch(() => undefined);
  }, [paymentId]);

  const receipt = apiReceipt ?? localReceipt;

  if (isLoading) {
    return <StudentFeesListSkeleton />;
  }

  if (!payment || !receipt) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">Receipt not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref("payments")}>Back to payments</Link>
        </Button>
      </FeesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={paymentHref(paymentId)}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to payment
      </Link>

      <FeesPanel>
        <FeesPaySteps currentStep={4} />
      </FeesPanel>

      <FeesPanel id="fee-receipt" className="space-y-6 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xl font-bold text-brand-purple">Schooli</p>
            <p className="mt-1 text-sm text-muted-foreground">Official payment receipt</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-bold">{receipt.receiptId}</p>
            <p className="text-muted-foreground">{receipt.dateFormatted}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="mt-1 text-sm font-semibold">{receipt.studentName}</p>
            <p className="text-xs text-muted-foreground">{receipt.studentId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Transaction</p>
            <p className="mt-1 font-mono text-sm font-semibold">{receipt.transactionRef}</p>
            {liveMeta?.gatewaySessionId ? (
              <p className="text-xs text-muted-foreground">Gateway: {liveMeta.gatewaySessionId}</p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="mt-1 text-sm font-medium">{receipt.description}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Fee item</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.feeLines.map((line) => (
              <tr key={line.label} className="border-b border-border/60">
                <td className="py-2.5">{line.label}</td>
                <td className="py-2.5 text-right font-medium">{line.amountFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            <p>Method: {receipt.methodLabel}{liveMeta?.cardLast4 ? ` ·••• ${liveMeta.cardLast4}` : ""}</p>
            <p>Status: {receipt.status}</p>
            <p className="mt-1 text-xs">
              Generated {new Date(receipt.generatedAt).toLocaleString("en-US")}
            </p>
          </div>
          <p className="text-2xl font-bold text-brand-purple">Total: {receipt.amountFormatted}</p>
        </div>
      </FeesPanel>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button
          type="button"
          onClick={() => downloadReceiptPdf(receipt)}
          className="rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Download / Print PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-4"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print receipt
        </Button>
        <Button asChild variant="outline" className="rounded-full px-4">
          <Link href={feesHref("payments")}>All payments</Link>
        </Button>
      </div>
    </div>
  );
}
