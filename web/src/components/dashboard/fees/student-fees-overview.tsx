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
import { useStudentFees, type StudentFeesData } from "@/hooks/use-dashboard-data";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
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

function formatDisplayDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function FeeItemsList({ items }: { items: StudentFeesData["feeItems"] }) {
  return (
    <FeesPanel>
      <h2 className="text-base font-bold">Current term fees</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/student/fees/items/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Due {formatDisplayDate(item.dueDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold",
                item.status === "completed" ? "bg-green/15 text-green" :
                item.status === "pending" ? "bg-brand-orange/15 text-brand-orange" :
                "bg-destructive/15 text-destructive"
              )}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <div className="text-right">
                <p className="text-sm font-bold">{formatCurrency(item.amount)}</p>
                {item.paidAmount > 0 && item.status !== "completed" ? (
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.paidAmount)} paid</p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No fee items found.</p>
        )}
      </div>
    </FeesPanel>
  );
}

function RecentPaymentsTable({ payments }: { payments: StudentFeesData["paymentHistory"] }) {
  return (
    <FeesPanel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Recent payments</h2>
        <Link href="/student/fees/payments" className="text-xs font-medium text-brand-purple hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Method</th>
              <th className="pb-3 pr-4 font-medium">Receipt</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.slice(0, 5).map((payment) => (
              <tr key={payment.id} className="border-b border-border/60 last:border-none">
                <td className="py-3 pr-4 text-muted-foreground">{formatDisplayDate(payment.createdAt)}</td>
                <td className="py-3 pr-4">{payment.method}</td>
                <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{payment.receiptNumber}</td>
                <td className="py-3 text-right font-semibold text-green">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No payment history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FeesPanel>
  );
}

const EMPTY_FEES: StudentFeesData = {
  summary: { totalFees: 0, totalPaid: 0, totalOutstanding: 0 },
  feeItems: [],
  paymentHistory: [],
};

export function StudentFeesOverview() {
  const isLoading = usePageLoading();
  const { data: feesData } = useStudentFees(EMPTY_FEES);
  const data = feesData ?? EMPTY_FEES;

  if (isLoading) {
    return <StudentFeesSkeleton />;
  }

  const nextDueItem = data.feeItems.find((item) => item.status === "pending" && new Date(item.dueDate) > new Date());

  return (
    <div className="space-y-5">
      {data.summary.totalOutstanding > 0 ? (
        <FeesPanel className="flex flex-col gap-4 border border-brand-orange/25 bg-brand-orange/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">Payment due</p>
              <h2 className="mt-1 text-base font-bold">{formatCurrency(data.summary.totalOutstanding)} outstanding</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {nextDueItem
                  ? `${nextDueItem.name} due ${formatDisplayDate(nextDueItem.dueDate)}`
                  : "Review your upcoming due dates below."}
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90">
            <Link href="/student/fees/pay">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(data.summary.totalOutstanding)}
            </Link>
          </Button>
        </FeesPanel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={formatCurrency(data.summary.totalOutstanding)} label="Amount due" icon={Wallet} tone="orange" />
        <StatCard value={formatCurrency(data.summary.totalPaid)} label="Paid this term" icon={CreditCard} tone="blue" />
        <StatCard value={formatCurrency(0)} label="Scholarship" icon={GraduationCap} tone="purple" />
        <StatCard
          value={nextDueItem ? formatDisplayDate(nextDueItem.dueDate) : "—"}
          label="Next due date"
          icon={CalendarClock}
          tone="green"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FeesPanel>
          <h2 className="text-base font-bold">Fee summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">Total fees vs paid</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total Fees</span>
              <span className="font-semibold">{formatCurrency(data.summary.totalFees)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Total Paid</span>
              <span className="font-semibold text-green">{formatCurrency(data.summary.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border pt-4">
              <span className="font-semibold">Outstanding</span>
              <span className="font-bold text-brand-orange">{formatCurrency(data.summary.totalOutstanding)}</span>
            </div>
          </div>
        </FeesPanel>

        <FeesPanel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Upcoming due dates</h2>
            <Link href="/student/fees/pay" className="text-xs font-medium text-brand-purple hover:underline">Pay now</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.feeItems.filter((item) => item.status !== "completed").map((item) => (
              <Link
                key={item.id}
                href={`/student/fees/items/${item.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Due {formatDisplayDate(item.dueDate)}</p>
                </div>
                <p className="text-sm font-bold">{formatCurrency(item.amount - item.paidAmount)}</p>
              </Link>
            ))}
            {data.feeItems.filter((item) => item.status !== "completed").length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No outstanding fees.</p>
            )}
          </div>
        </FeesPanel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <FeeItemsList items={data.feeItems} />
        <RecentPaymentsTable payments={data.paymentHistory} />
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
