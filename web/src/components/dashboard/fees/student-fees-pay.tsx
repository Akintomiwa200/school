"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { checkoutHref, saveCheckoutDraft } from "./fees-checkout-storage";
import { FeesPaySteps } from "./fees-pay-steps";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  formatDisplayDate,
  getFeeBalance,
  getPayableFees,
} from "./student-fees-data";
import { StudentFeesSkeleton } from "./student-fees-skeleton";

export function StudentFeesPay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectFee = searchParams.get("fee");
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();

  const payableFees = useMemo(() => getPayableFees(), [livePayments]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (preselectFee && payableFees.some((fee) => fee.id === preselectFee)) {
      setSelectedIds(new Set([preselectFee]));
    } else if (payableFees.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(payableFees.map((fee) => fee.id)));
    }
  }, [preselectFee, payableFees, selectedIds.size]);

  const selectedFees = payableFees.filter((fee) => selectedIds.has(fee.id));
  const totalAmount = selectedFees.reduce((sum, fee) => sum + getFeeBalance(fee), 0);

  function toggleFee(feeId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(feeId)) next.delete(feeId);
      else next.add(feeId);
      return next;
    });
  }

  function handleContinue() {
    if (selectedFees.length === 0) return;
    const feeIds = selectedFees.map((fee) => fee.id);
    saveCheckoutDraft({ feeIds, createdAt: Date.now() });
    router.push(checkoutHref(feeIds));
  }

  if (isLoading) {
    return <StudentFeesSkeleton />;
  }

  if (payableFees.length === 0) {
    return (
      <FeesPanel className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
        <h2 className="mt-4 text-lg font-bold">All fees are paid</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You have no outstanding balance for Spring 2026.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full px-4">
          <Link href={feesHref()}>Back to overview</Link>
        </Button>
      </FeesPanel>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={feesHref()}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to fees
      </Link>

      <FeesPanel>
        <FeesPaySteps currentStep={1} />
      </FeesPanel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <FeesPanel className="space-y-4">
          <div>
            <h2 className="text-base font-bold">Select fees to pay</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose outstanding fees, then continue to the secure payment gateway.
            </p>
          </div>

          <div className="space-y-2">
            {payableFees.map((fee) => {
              const balance = getFeeBalance(fee);
              const checked = selectedIds.has(fee.id);

              return (
                <label
                  key={fee.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    checked ? "border-brand-purple bg-brand-purple/5" : "border-border hover:bg-muted/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFee(fee.id)}
                    className="mt-1 h-4 w-4 rounded border-border accent-brand-purple"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{fee.label}</p>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-semibold",
                          FEE_STATUS_STYLES[fee.status],
                        )}
                      >
                        {FEE_STATUS_LABELS[fee.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {formatDisplayDate(fee.dueDate)} · Balance {formatCurrency(balance)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </FeesPanel>

        <FeesPanel className="space-y-4">
          <h2 className="text-base font-bold">Order summary</h2>
          <div className="space-y-2">
            {selectedFees.map((fee) => (
              <div key={fee.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{fee.label}</span>
                <span className="font-medium">{formatCurrency(getFeeBalance(fee))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-brand-purple">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <Button
            type="button"
            disabled={selectedFees.length === 0 || totalAmount <= 0}
            onClick={handleContinue}
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            Continue to payment gateway
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You will review and pay on the next step via Schooli Pay Gateway.
          </p>
        </FeesPanel>
      </div>
    </div>
  );
}
