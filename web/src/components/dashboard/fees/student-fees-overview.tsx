"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertCircle,
  CalendarClock,
  CreditCard,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  FEE_CATEGORY_COLORS,
  FEE_STATUS_LABELS,
  FEE_STATUS_STYLES,
  feeItemHref,
  formatDisplayDate,
  getFeeBalance,
  getFeeBreakdown,
  getFeeItems,
  getFeeStats,
  getPaymentHistory,
  getUpcomingFees,
  payHref,
  paymentHref,
} from "./student-fees-data";
import { StudentFeesSkeleton } from "./student-fees-skeleton";

function StatCard({
  value,
  label,
  icon: Icon,
  tone,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "purple" | "blue" | "orange" | "green";
}) {
  const tones = {
    purple: { card: "bg-brand-purple/10", icon: "bg-brand-purple/15 text-brand-purple", value: "text-brand-purple" },
    blue: { card: "bg-brand-blue/10", icon: "bg-brand-blue/15 text-brand-blue", value: "text-brand-blue" },
    orange: { card: "bg-brand-orange/10", icon: "bg-brand-orange/15 text-brand-orange", value: "text-brand-orange" },
    green: { card: "bg-green/10", icon: "bg-green/15 text-green", value: "text-green" },
  } as const;

  const style = tones[tone];

  return (
    <FeesPanel className={cn("flex items-center gap-3", style.card)}>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-2xl font-bold leading-none", style.value)}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </FeesPanel>
  );
}

function FeeBreakdownChart() {
  const livePayments = useLiveFeePayments();
  const breakdown = useMemo(() => getFeeBreakdown(), [livePayments]);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const size = 140;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <FeesPanel>
      <h2 className="text-base font-bold">Fee breakdown</h2>
      <p className="mt-1 text-sm text-muted-foreground">Spring 2026 billing by category</p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-muted/50"
            />
            {breakdown.map((item) => {
              const fraction = total > 0 ? item.amount / total : 0;
              const dash = fraction * circumference;
              const circle = (
                <circle
                  key={item.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  className={cn("stroke-current", FEE_CATEGORY_COLORS[item.color].fill)}
                />
              );
              offset += dash;
              return circle;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="grid w-full gap-2 sm:flex-1">
          {breakdown.map((item) => (
            <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", FEE_CATEGORY_COLORS[item.color].bg)} />
                <span>{item.label}</span>
              </div>
              <span className="font-semibold">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </FeesPanel>
  );
}

function UpcomingFeesList() {
  const livePayments = useLiveFeePayments();
  const upcoming = useMemo(() => getUpcomingFees(), [livePayments]);

  return (
    <FeesPanel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Upcoming due dates</h2>
        <Link href={feesHref("pay")} className="text-xs font-medium text-brand-purple hover:underline">
          Pay now
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.map((item) => {
          const remaining = getFeeBalance(item);
          return (
            <Link
              key={item.id}
              href={feeItemHref(item.id)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">Due {formatDisplayDate(item.dueDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[item.status])}>
                  {FEE_STATUS_LABELS[item.status]}
                </span>
                <p className="text-sm font-bold">{formatCurrency(remaining)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </FeesPanel>
  );
}

function RecentPaymentsTable() {
  const livePayments = useLiveFeePayments();
  const recent = useMemo(() => getPaymentHistory().slice(0, 4), [livePayments]);

  return (
    <FeesPanel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Recent payments</h2>
        <Link href={feesHref("payments")} className="text-xs font-medium text-brand-purple hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Description</th>
              <th className="pb-3 pr-4 font-medium">Receipt</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((payment) => (
              <tr key={payment.id} className="border-b border-border/60 last:border-none">
                <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(payment.date)}</td>
                <td className="py-3 pr-4">
                  <Link href={paymentHref(payment.id)} className="hover:text-brand-purple">
                    {payment.description}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{payment.receiptId}</td>
                <td className="py-3 text-right font-semibold text-green">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FeesPanel>
  );
}

function FeeItemsList() {
  const livePayments = useLiveFeePayments();
  const items = useMemo(() => getFeeItems(), [livePayments]);

  return (
    <FeesPanel>
      <h2 className="text-base font-bold">Current term fees</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={feeItemHref(item.id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.term} · Due {formatDisplayDate(item.dueDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", FEE_STATUS_STYLES[item.status])}>
                {FEE_STATUS_LABELS[item.status]}
              </span>
              <div className="text-right">
                <p className="text-sm font-bold">{formatCurrency(item.amount)}</p>
                {item.paidAmount > 0 && item.status !== "paid" ? (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.paidAmount)} paid
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </FeesPanel>
  );
}

export function StudentFeesOverview() {
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();
  const stats = useMemo(() => getFeeStats(), [livePayments]);

  if (isLoading) {
    return <StudentFeesSkeleton />;
  }

  return (
    <div className="space-y-5">
      {stats.amountDue > 0 ? (
        <FeesPanel className="flex flex-col gap-4 border border-brand-orange/25 bg-brand-orange/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                Payment due
              </p>
              <h2 className="mt-1 text-base font-bold">
                {formatCurrency(stats.amountDue)} outstanding
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.nextDueLabel
                  ? `${stats.nextDueLabel} due ${stats.nextDueDate ? formatDisplayDate(stats.nextDueDate) : "soon"}`
                  : "Review your upcoming due dates below."}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90"
          >
            <Link href={payHref()}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(stats.amountDue)}
            </Link>
          </Button>
        </FeesPanel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          value={formatCurrency(stats.amountDue)}
          label="Amount due"
          icon={Wallet}
          tone="orange"
        />
        <StatCard
          value={formatCurrency(stats.totalPaid)}
          label="Paid this term"
          icon={CreditCard}
          tone="blue"
        />
        <StatCard
          value={formatCurrency(stats.scholarshipApplied)}
          label="Scholarship"
          icon={GraduationCap}
          tone="purple"
        />
        <StatCard
          value={stats.nextDueDate ? formatDisplayDate(stats.nextDueDate) : "—"}
          label="Next due date"
          icon={CalendarClock}
          tone="green"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FeeBreakdownChart />
        <UpcomingFeesList />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <FeeItemsList />
        <RecentPaymentsTable />
      </div>

      <FeesPanel className="flex flex-col items-start gap-4 bg-gradient-to-r from-brand-purple/10 via-brand-blue/10 to-brand-purple/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold">Need a payment plan?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact the accounts office to set up installments for tuition and lab fees.
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-full px-4">
          Contact accounts
        </Button>
      </FeesPanel>
    </div>
  );
}
