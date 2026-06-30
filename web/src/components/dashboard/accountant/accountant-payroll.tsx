"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Loader2, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useFinancePayroll,
  usePayrollAction,
  usePayrollReports,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { AuditPageShell } from "./accountant-audit-ui";
import { PAYROLL_RUNS, formatDisplayDate, payrollHref } from "./accountant-data";
import { PayrollRunDialog } from "./accountant-payroll-run-dialog";
import { AccountantPayrollSettings } from "./accountant-payroll-settings";
import { FinancePanel, formatCurrency } from "./accountant-ui";

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  processing: "bg-brand-blue/15 text-brand-blue",
  completed: "bg-green/15 text-green",
  cancelled: "bg-destructive/15 text-destructive",
};

export function AccountantPayroll() {
  const { data: payrollRuns = PAYROLL_RUNS, isFetching } = useFinancePayroll(PAYROLL_RUNS);
  const { data: reports } = usePayrollReports();
  const payrollAction = usePayrollAction();
  const isLoading = usePageLoading() || isFetching;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duplicateId, setDuplicateId] = useState<string | undefined>();

  const currentRun = useMemo(
    () => payrollRuns.find((run) => run.status === "processing"),
    [payrollRuns],
  );

  async function handleGenerate(input: { period: string; notes: string; duplicateFromRunId?: string }) {
    await payrollAction.mutateAsync({
      action: "start",
      period: input.period,
      notes: input.notes,
      duplicateFromRunId: input.duplicateFromRunId,
    });
    setDialogOpen(false);
    setDuplicateId(undefined);
  }

  if (isLoading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  return (
    <AuditPageShell className="space-y-5">
      <ManagementPageHeader
        title="Payroll"
        description="Staff salary runs, payslips, and monthly processing."
        action={
          <Button
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
            disabled={payrollAction.isPending || Boolean(currentRun)}
            onClick={() => setDialogOpen(true)}
          >
            <Play className="h-4 w-4 shrink-0" />
            Generate payroll
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinancePanel className="border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">YTD disbursed</p>
          <p className="mt-2 text-2xl font-bold text-brand-purple">{formatCurrency(reports?.totalDisbursed ?? 0)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">YTD net pay</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(reports?.totalNetYtd ?? 0)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">YTD tax withheld</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">{formatCurrency(reports?.totalTaxYtd ?? 0)}</p>
        </FinancePanel>
        <FinancePanel className="border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Completed runs</p>
          <p className="mt-2 text-2xl font-bold">{reports?.completedRuns ?? 0}</p>
        </FinancePanel>
      </div>

      {currentRun ? (
        <FinancePanel className="border border-brand-blue/20 bg-brand-blue/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-blue">In progress</p>
              <h2 className="mt-1 text-lg font-bold">{currentRun.period}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentRun.staffCount} staff · {formatCurrency(currentRun.totalAmount)}
              </p>
            </div>
            <Button asChild className="inline-flex h-10 shrink-0 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue/90">
              <Link href={payrollHref(currentRun.id)}>Review & finalize</Link>
            </Button>
          </div>
        </FinancePanel>
      ) : null}

      <FinancePanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Processed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((run) => (
              <tr key={run.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">
                  <Link href={payrollHref(run.id)} className="hover:text-brand-purple">
                    {run.period}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{run.staffCount}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {run.totalAmount > 0 ? formatCurrency(run.totalAmount) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {run.processedDate ? formatDisplayDate(run.processedDate) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", STATUS_STYLES[run.status])}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {run.status === "completed" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-2.5"
                        disabled={payrollAction.isPending || Boolean(currentRun)}
                        onClick={() => {
                          setDuplicateId(run.id);
                          setDialogOpen(true);
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    {run.status === "draft" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-2.5 text-destructive"
                        disabled={payrollAction.isPending}
                        onClick={() => void payrollAction.mutateAsync({ action: "delete", runId: run.id })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FinancePanel>

      <AccountantPayrollSettings />

      <PayrollRunDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDuplicateId(undefined);
        }}
        onSubmit={handleGenerate}
        isPending={payrollAction.isPending}
        existingRuns={payrollRuns}
        defaultDuplicateId={duplicateId}
      />
    </AuditPageShell>
  );
}
