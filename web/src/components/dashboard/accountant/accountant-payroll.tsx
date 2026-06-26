"use client";

import { Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useFinancePayroll } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { PAYROLL_RUNS, formatDisplayDate } from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  processing: "bg-brand-blue/15 text-brand-blue",
  completed: "bg-green/15 text-green",
};

export function AccountantPayroll() {
  const { data: payrollRuns = PAYROLL_RUNS, isFetching } = useFinancePayroll(PAYROLL_RUNS);
  const isLoading = usePageLoading() || isFetching;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  const currentRun = payrollRuns.find((run) => run.status === "processing");

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Payroll"
        description="Staff salary runs, payslips, and monthly processing."
        action={
          <Button className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Play className="mr-2 h-4 w-4" />
            Start new run
          </Button>
        }
      />

      {currentRun ? (
        <FinancePanel className="border border-brand-blue/20 bg-brand-blue/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-blue">In progress</p>
              <h2 className="mt-1 text-lg font-bold">{currentRun.period}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentRun.staffCount} staff · estimated {formatCurrency(currentRun.totalAmount)}
              </p>
            </div>
            <Button className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
              Review & finalize
            </Button>
          </div>
        </FinancePanel>
      ) : null}

      <FinancePanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Processed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((run) => (
              <tr key={run.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">{run.period}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {run.staffCount}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {run.totalAmount > 0 ? formatCurrency(run.totalAmount) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {run.processedDate ? formatDisplayDate(run.processedDate) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      STATUS_STYLES[run.status],
                    )}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {run.status === "completed" ? (
                    <Button variant="outline" size="sm" className="h-8 rounded-full">
                      Payslips
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FinancePanel>
    </div>
  );
}
