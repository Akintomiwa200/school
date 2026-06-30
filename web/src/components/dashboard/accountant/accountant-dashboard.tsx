"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  FileText,
  Shield,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useAuditLog,
  useFinanceExpenses,
  useFinanceInvoices,
  useFinancePayments,
  useFinancePayroll,
  useFinanceSummary,
  type FinanceSummary,
} from "@/hooks/use-dashboard-data";
import { AuditPageShell, AuditTrailList } from "./accountant-audit-ui";
import { cn } from "@/lib/utils";
import {
  ManagementActionLink,
  ManagementPageHeader,
  ManagementPanel,
} from "../management/management-ui";
import {
  ACCOUNTANT_QUICK_ACTIONS,
  AUDIT_EVENTS,
  EXPENSES,
  PAYROLL_RUNS,
  SCHOOL_INVOICES,
  accountantHref,
  auditHref,
  formatDisplayDate,
  getFinanceSummary,
  getSeedLedgerPayments,
  payrollHref,
  paymentHref,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

const FALLBACK_SUMMARY: FinanceSummary = {
  ...getFinanceSummary(),
  pendingExpenseTotal: EXPENSES.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0),
  payrollDue: 415800,
  overdueInvoices: SCHOOL_INVOICES.filter((i) => i.status === "overdue" || i.status === "partial").length,
  paymentCount: 0,
  invoiceCount: SCHOOL_INVOICES.length,
  expenseCount: EXPENSES.length,
};

const QUICK_ACTION_ICONS = {
  CreditCard,
  FileText,
  Wallet,
  Banknote,
  BarChart: ArrowUpRight,
} as const;

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-80 rounded-[20px] bg-muted lg:col-span-2" />
        <div className="h-80 rounded-[20px] bg-muted" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "purple" | "blue" | "green" | "orange";
}) {
  const valueColors = {
    purple: "text-brand-purple",
    blue: "text-brand-blue",
    green: "text-green",
    orange: "text-brand-orange",
  } as const;
  const borderColors = {
    purple: "border-brand-purple/15 bg-brand-purple/5",
    blue: "border-brand-blue/15 bg-brand-blue/5",
    green: "border-green/15 bg-green/5",
    orange: "border-brand-orange/15 bg-brand-orange/5",
  } as const;

  return (
    <FinancePanel className={cn("border p-4", borderColors[tone])}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold", valueColors[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </FinancePanel>
  );
}

export function AccountantDashboard() {
  const loading = usePageLoading(400);
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "Finance";

  const { data: summary = FALLBACK_SUMMARY } = useFinanceSummary(FALLBACK_SUMMARY);
  const { data: payments = getSeedLedgerPayments() } = useFinancePayments(getSeedLedgerPayments());
  const { data: invoices = SCHOOL_INVOICES } = useFinanceInvoices(SCHOOL_INVOICES);
  const { data: expenses = EXPENSES } = useFinanceExpenses(EXPENSES);
  const { data: auditEvents = AUDIT_EVENTS } = useAuditLog("finance", AUDIT_EVENTS);
  const { data: payrollRuns = PAYROLL_RUNS } = useFinancePayroll(PAYROLL_RUNS);

  const activePayrollRun = useMemo(
    () => payrollRuns.find((run) => run.status === "processing") ?? null,
    [payrollRuns],
  );

  const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);
  const overdueInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === "overdue" || inv.status === "partial"),
    [invoices],
  );
  const pendingExpenses = useMemo(() => expenses.filter((e) => e.status === "pending"), [expenses]);
  const recentAudit = useMemo(() => auditEvents.slice(0, 4), [auditEvents]);

  const stats = [
    { id: "collected", label: "Collected", value: formatCurrency(summary.collected), hint: "Spring term to date", tone: "green" as const },
    { id: "outstanding", label: "Outstanding", value: formatCurrency(summary.outstanding), hint: "Unpaid balances", tone: "orange" as const },
    { id: "expenses", label: "Expenses", value: formatCurrency(summary.expensesMonth), hint: "This month", tone: "purple" as const },
    { id: "payroll", label: "Payroll due", value: formatCurrency(summary.payrollDue), hint: "Current run", tone: "blue" as const },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <AuditPageShell>
      <ManagementPageHeader
        title={`Finance overview — ${name}`}
        description="Track collections, expenses, payroll, and audit activity across the school."
        action={
          <Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Link href={accountantHref("payments")}>Record payment</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <ManagementPanel className="border border-border lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">Quick actions</h2>
            <Link href={accountantHref("audit")} className="text-xs font-semibold text-brand-purple hover:underline">
              Audit trail
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCOUNTANT_QUICK_ACTIONS.map((action) => {
              const Icon = QUICK_ACTION_ICONS[action.iconName as keyof typeof QUICK_ACTION_ICONS] ?? CreditCard;
              return (
                <ManagementActionLink
                  key={action.href}
                  href={action.href}
                  label={action.label}
                  description={action.description}
                  icon={Icon}
                />
              );
            })}
          </div>
        </ManagementPanel>

        <FinancePanel className="border border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-purple" />
              <h2 className="text-base font-bold">Recent audit</h2>
            </div>
            <Link href={accountantHref("audit")} className="text-xs font-semibold text-brand-purple hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4">
            <AuditTrailList
              events={recentAudit}
              getHref={(event) => auditHref(event.id)}
              compact
            />
          </div>
        </FinancePanel>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <FinancePanel className="border border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-blue" />
              <h2 className="text-base font-bold">Recent payments</h2>
            </div>
            <Link href={accountantHref("payments")} className="text-xs font-semibold text-brand-purple hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {recentPayments.map((payment) => (
              <li key={payment.id}>
                <Link
                  href={paymentHref(payment.id)}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{payment.studentName}</p>
                    <p className="truncate text-xs text-muted-foreground">{payment.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-green">{formatCurrency(payment.amount)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDisplayDate(payment.date)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </FinancePanel>

        <FinancePanel className="border border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-orange" />
              <h2 className="text-base font-bold">Attention needed</h2>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Overdue / partial invoices
              </p>
              <ul className="mt-2 space-y-2">
                {overdueInvoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                    <span className="text-sm font-medium">{inv.studentName}</span>
                    <span className="text-sm font-bold text-brand-orange">
                      {formatCurrency(inv.amount - inv.paidAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending expenses ({pendingExpenses.length})
              </p>
              <ul className="mt-2 space-y-2">
                {pendingExpenses.map((exp) => (
                  <li key={exp.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                    <span className="truncate text-sm">{exp.description}</span>
                    <span className="shrink-0 text-sm font-bold">{formatCurrency(exp.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={accountantHref("expenses")}>
                <Wallet className="mr-2 h-4 w-4" />
                Review expenses
              </Link>
            </Button>
          </div>
        </FinancePanel>
      </div>

      <FinancePanel className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" />
          <div>
            <p className="text-sm font-bold">
              {activePayrollRun
                ? `${activePayrollRun.period} payroll in progress`
                : "No active payroll run"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activePayrollRun
                ? `${activePayrollRun.staffCount} staff · ${formatCurrency(activePayrollRun.totalAmount)} due`
                : "Generate a new monthly run when ready."}
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href={activePayrollRun ? payrollHref(activePayrollRun.id) : accountantHref("payroll")}>
            {activePayrollRun ? "Review payroll" : "Open payroll"}
            <ArrowDownRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </FinancePanel>
    </AuditPageShell>
  );
}
