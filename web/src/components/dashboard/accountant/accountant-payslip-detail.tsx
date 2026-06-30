"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, Clock, Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  downloadPayslipFromApi,
  printPayslipFromApi,
  useFinancePayrollRun,
  type PayrollRunDetail,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  AuditBackLink,
  AuditDetailGrid,
  AuditPageShell,
  AuditSectionCard,
} from "./accountant-audit-ui";
import {
  PAYROLL_RUNS,
  formatDisplayDate,
  getPayrollRunById,
  payrollHref,
} from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

function emptyDetail(runId: string): PayrollRunDetail {
  const run = getPayrollRunById(runId) ?? PAYROLL_RUNS[0];
  return { run, payslips: [], summary: { staffCount: 0, totalGross: 0, totalNet: 0, pendingCount: 0, paidCount: 0 }, availableStaff: [] };
}

export function AccountantPayslipDetail({ runId, payslipId }: { runId: string; payslipId: string }) {
  const isLoading = usePageLoading();
  const [receiptAction, setReceiptAction] = useState<"download" | "print" | null>(null);
  const fallback = useMemo(() => emptyDetail(runId), [runId]);
  const { data: detail = fallback, isFetching } = useFinancePayrollRun(runId, fallback);

  const payslip = useMemo(
    () => detail.payslips.find((slip) => slip.id === payslipId),
    [detail.payslips, payslipId],
  );

  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  if (!payslip) {
    return (
      <AuditPageShell>
        <FinancePanel className="border border-border text-center">
          <h2 className="text-lg font-bold">Payslip not found</h2>
          <Button asChild variant="outline" className="mt-4 rounded-full px-4">
            <Link href={payrollHref(runId)}>Back to payroll run</Link>
          </Button>
        </FinancePanel>
      </AuditPageShell>
    );
  }

  const totalDeductions = payslip.deductions.reduce((sum, line) => sum + line.amount, 0);
  const isPaid = payslip.status === "paid";

  const detailItems = [
    { label: "Employee", value: payslip.staffName },
    { label: "Employee ID", value: payslip.employeeId, mono: true },
    { label: "Department", value: payslip.department },
    { label: "Designation", value: payslip.designation },
    { label: "Pay period", value: payslip.period },
    { label: "Gross pay", value: formatCurrency(payslip.grossPay) },
    { label: "Total deductions", value: formatCurrency(totalDeductions) },
    { label: "Net pay", value: formatCurrency(payslip.netPay) },
    { label: "Paid date", value: payslip.paidDate ? formatDisplayDate(payslip.paidDate) : "—" },
    { label: "Payslip ID", value: payslip.id, mono: true, span: true },
  ];

  async function handleDownload() {
    setReceiptAction("download");
    try {
      downloadPayslipFromApi(runId, payslipId);
    } finally {
      window.setTimeout(() => setReceiptAction(null), 600);
    }
  }

  async function handlePrint() {
    setReceiptAction("print");
    try {
      await printPayslipFromApi(runId, payslipId);
    } catch {
      // User can retry
    } finally {
      setReceiptAction(null);
    }
  }

  return (
    <AuditPageShell className="space-y-5">
      <AuditBackLink href={payrollHref(runId)} label="Back to payroll run" />

      <div
        className={cn(
          "overflow-hidden rounded-[20px] border border-border bg-background border-l-4",
          isPaid ? "border-green" : "border-brand-orange",
        )}
      >
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-4 lg:gap-5">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl lg:h-14 lg:w-14",
                  isPaid ? "bg-green/10 text-green" : "bg-brand-orange/10 text-brand-orange",
                )}
              >
                <Banknote className="h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-purple/15 px-2.5 py-1 text-[11px] font-semibold text-brand-purple">
                    Staff payslip
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      isPaid ? "bg-green/15 text-green" : "bg-brand-orange/15 text-brand-orange",
                    )}
                  >
                    {isPaid ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Clock className="h-3.5 w-3.5 shrink-0" />}
                    {payslip.status}
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{payslip.staffName}</h1>
                <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">{payslip.employeeId}</p>
                <p className="mt-3 text-sm text-muted-foreground lg:text-base">
                  {payslip.designation} · {payslip.period}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-right lg:min-w-[180px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Net pay</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand-purple lg:text-3xl">
                {formatCurrency(payslip.netPay)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{payslip.department}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-5">
          <AuditSectionCard title="Payslip details">
            <AuditDetailGrid items={detailItems} />
          </AuditSectionCard>

          <div className="grid gap-5 sm:grid-cols-2">
            <AuditSectionCard title="Earnings">
              <ul className="space-y-2 text-sm">
                {payslip.earnings.map((line) => (
                  <li key={line.label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(line.amount)}</span>
                  </li>
                ))}
              </ul>
            </AuditSectionCard>

            <AuditSectionCard title="Deductions">
              <ul className="space-y-2 text-sm">
                {payslip.deductions.map((line) => (
                  <li key={line.label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-semibold tabular-nums text-destructive">-{formatCurrency(line.amount)}</span>
                  </li>
                ))}
              </ul>
            </AuditSectionCard>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <AuditSectionCard title="Payslip actions">
            <div className="flex flex-col gap-2">
              <Button
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
                disabled={receiptAction !== null}
                onClick={() => void handleDownload()}
              >
                {receiptAction === "download" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 shrink-0" />
                )}
                Download payslip
              </Button>
              <Button
                variant="outline"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5"
                disabled={receiptAction !== null}
                onClick={() => void handlePrint()}
              >
                {receiptAction === "print" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 shrink-0" />
                )}
                Print payslip
              </Button>
            </div>
          </AuditSectionCard>
        </div>
      </div>
    </AuditPageShell>
  );
}
