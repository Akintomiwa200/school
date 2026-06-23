"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency } from "./fee-ui";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  formatDisplayDate,
  getFeeBalance,
  getFeeItems,
  getFeesByMonth,
  getFeeStats,
  getPaymentHistory,
  payHref,
} from "./student-fees-data";
import { StudentFeesSkeleton } from "./student-fees-skeleton";
import { cn } from "@/lib/utils";

export function StudentFeesStatement() {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();

  const stats = useMemo(() => getFeeStats(), [livePayments]);
  const items = useMemo(() => getFeeItems(), [livePayments]);
  const payments = useMemo(() => getPaymentHistory(), [livePayments]);
  const byMonth = useMemo(() => getFeesByMonth(), [livePayments]);

  if (isLoading) {
    return <StudentFeesSkeleton />;
  }

  return (
    <div className="space-y-5">
      <FeesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account statement</p>
          <h2 className="mt-1 text-lg font-bold">Spring 2026</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-full px-4">
          <Download className="mr-2 h-4 w-4" />
          Download statement PDF
        </Button>
      </FeesPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FeesPanel className="bg-brand-purple/10">
          <p className="text-xs text-muted-foreground">Total billed</p>
          <p className="mt-1 text-xl font-bold text-brand-purple">{formatCurrency(stats.totalBilled)}</p>
        </FeesPanel>
        <FeesPanel className="bg-brand-blue/10">
          <p className="text-xs text-muted-foreground">Total paid</p>
          <p className="mt-1 text-xl font-bold text-brand-blue">{formatCurrency(stats.totalPaid)}</p>
        </FeesPanel>
        <FeesPanel className="bg-brand-orange/10">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-xl font-bold text-brand-orange">{formatCurrency(stats.amountDue)}</p>
        </FeesPanel>
        <FeesPanel className="bg-green/10">
          <p className="text-xs text-muted-foreground">Paid %</p>
          <p className="mt-1 text-xl font-bold text-green">{stats.paidPercent}%</p>
        </FeesPanel>
      </div>

      <FeesPanel>
        <h2 className="text-base font-bold">Fee schedule by month</h2>
        <div className="mt-4 space-y-4">
          {byMonth.map((group) => (
            <div key={group.monthKey} className="rounded-2xl bg-muted/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold">{group.label}</h3>
                <p className="text-sm font-semibold text-brand-orange">{formatCurrency(group.totalDue)} due</p>
              </div>
              <ul className="mt-3 space-y-2">
                {group.fees.map((fee) => (
                  <li key={fee.id} className="flex justify-between text-sm">
                    <span>{fee.label}</span>
                    <span>{formatDisplayDate(fee.dueDate)} · {formatCurrency(getFeeBalance(fee))}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FeesPanel>

      <FeesPanel>
        <h2 className="text-base font-bold">All fees — Spring 2026</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Fee</th>
                <th className="pb-3 pr-4 font-medium">Due</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium text-right">Billed</th>
                <th className="pb-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {items.map((fee) => (
                <tr key={fee.id} className="border-b border-border/60 last:border-none">
                  <td className="py-3 pr-4 font-medium">{fee.label}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(fee.dueDate)}</td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[fee.status])}>
                      {FEE_STATUS_LABELS[fee.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">{formatCurrency(fee.amount)}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(getFeeBalance(fee))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FeesPanel>

      <FeesPanel>
        <h2 className="text-base font-bold">Transaction log</h2>
        <div className="mt-4 space-y-2">
          {payments.slice(0, 8).map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{payment.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDisplayDate(payment.date)} · {payment.receiptId}
                </p>
              </div>
              <p className="font-semibold text-green">{formatCurrency(payment.amount)}</p>
            </div>
          ))}
        </div>
      </FeesPanel>

      {stats.amountDue > 0 ? (
        <FeesPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Outstanding balance: <span className="font-bold text-foreground">{formatCurrency(stats.amountDue)}</span>
          </p>
          <Button asChild className="shrink-0 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
            <Link href={payHref()}>Pay outstanding balance</Link>
          </Button>
        </FeesPanel>
      ) : null}
    </div>
  );
}
