"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Loader2,
  Play,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  downloadPayrollCsv,
  useAddPayrollEmployee,
  useFinancePayrollRun,
  usePayrollAction,
  useRemovePayrollPayslip,
  useUpdatePayrollPayslip,
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
  accountantHref,
  formatDisplayDate,
  getPayrollRunById,
  payrollHref,
  payslipHref,
} from "./accountant-data";
import { FinanceFilterSelect, FinancePanel, FinanceSearchBar, formatCurrency } from "./accountant-ui";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    badgeClass: "bg-muted text-muted-foreground",
    iconClass: "bg-muted text-muted-foreground",
    accentClass: "border-muted-foreground",
    Icon: Clock,
  },
  processing: {
    label: "Processing",
    badgeClass: "bg-brand-blue/15 text-brand-blue",
    iconClass: "bg-brand-blue/10 text-brand-blue",
    accentClass: "border-brand-blue",
    Icon: Clock,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-green/15 text-green",
    iconClass: "bg-green/10 text-green",
    accentClass: "border-green",
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-destructive/15 text-destructive",
    iconClass: "bg-destructive/10 text-destructive",
    accentClass: "border-destructive",
    Icon: Clock,
  },
} as const;

function emptyDetail(runId: string): PayrollRunDetail {
  const run = getPayrollRunById(runId) ?? PAYROLL_RUNS.find((entry) => entry.id === runId) ?? PAYROLL_RUNS[0];
  return {
    run,
    payslips: [],
    summary: {
      staffCount: run.staffCount,
      totalGross: 0,
      totalNet: run.totalAmount,
      pendingCount: 0,
      paidCount: 0,
    },
    availableStaff: [],
  };
}

export function AccountantPayrollDetail({ runId }: { runId: string }) {
  const isPageLoading = usePageLoading();
  const payrollAction = usePayrollAction();
  const addEmployee = useAddPayrollEmployee(runId);
  const removePayslip = useRemovePayrollPayslip(runId);
  const updatePayslip = useUpdatePayrollPayslip(runId);
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [actionState, setActionState] = useState<"activate" | "finalize" | "cancel" | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGross, setEditGross] = useState("");
  const [disbursementRef, setDisbursementRef] = useState("");

  const fallback = useMemo(() => emptyDetail(runId), [runId]);
  const { data: detail = fallback, isPending } = useFinancePayrollRun(runId, fallback);
  const { run, payslips, summary, availableStaff } = detail;

  const filteredPayslips = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return payslips;
    return payslips.filter(
      (slip) =>
        slip.staffName.toLowerCase().includes(query) ||
        slip.employeeId.toLowerCase().includes(query) ||
        slip.department.toLowerCase().includes(query),
    );
  }, [payslips, search]);

  const status = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.Icon;
  const canEdit = run.status === "processing";

  const staffOptions = useMemo(
    () => availableStaff.map((member) => ({ id: member.id, label: `${member.name} · ${member.employeeId}` })),
    [availableStaff],
  );

  if (isPageLoading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  if (!isPending && run.id !== runId && !PAYROLL_RUNS.some((entry) => entry.id === runId)) {
    return (
      <AuditPageShell>
        <FinancePanel className="border border-border text-center">
          <h2 className="text-lg font-bold">Payroll run not found</h2>
          <Button asChild variant="outline" className="mt-4 rounded-full px-4">
            <Link href={accountantHref("payroll")}>Back to payroll</Link>
          </Button>
        </FinancePanel>
      </AuditPageShell>
    );
  }

  const detailItems = [
    { label: "Period", value: run.period },
    { label: "Staff count", value: String(summary.staffCount || run.staffCount) },
    { label: "Total gross", value: formatCurrency(summary.totalGross) },
    { label: "Total net", value: formatCurrency(summary.totalNet || run.totalAmount) },
    { label: "Processed", value: run.processedDate ? formatDisplayDate(run.processedDate) : "—" },
    { label: "Finalized by", value: run.finalizedBy ?? "—" },
    { label: "Disbursement ref", value: run.disbursementRef ?? "—", mono: true },
    { label: "Notes", value: run.notes ?? "—", span: true },
    { label: "Run ID", value: run.id, mono: true, span: true },
  ];

  async function handleActivate() {
    setActionState("activate");
    try {
      await payrollAction.mutateAsync({ action: "activate", runId });
    } finally {
      setActionState(null);
    }
  }

  async function handleFinalize() {
    setActionState("finalize");
    try {
      await payrollAction.mutateAsync({
        action: "finalize",
        runId,
        finalizedBy: "Finance desk",
        disbursementRef: disbursementRef.trim() || undefined,
      });
    } finally {
      setActionState(null);
    }
  }

  async function handleCancel() {
    setActionState("cancel");
    try {
      await payrollAction.mutateAsync({ action: "cancel", runId });
    } finally {
      setActionState(null);
    }
  }

  async function handleAddAll() {
    await addEmployee.mutateAsync({ action: "add_all" });
  }

  async function handleSaveGross(payslipId: string) {
    const grossPay = Number(editGross);
    if (!Number.isFinite(grossPay) || grossPay <= 0) return;
    await updatePayslip.mutateAsync({ payslipId, grossPay });
    setEditingId(null);
    setEditGross("");
  }

  async function handleAddEmployee() {
    if (!selectedStaffId) {
      await addEmployee.mutateAsync({});
      return;
    }
    await addEmployee.mutateAsync({ staffId: selectedStaffId });
    setSelectedStaffId("");
  }

  async function handleRemovePayslip(payslipId: string) {
    setRemovingId(payslipId);
    try {
      await removePayslip.mutateAsync(payslipId);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <AuditPageShell className="space-y-5">
      <AuditBackLink href={accountantHref("payroll")} label="Back to payroll" />

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
                <Banknote className="h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-purple/15 px-2.5 py-1 text-[11px] font-semibold text-brand-purple">
                    Payroll run
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
                <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{run.period}</h1>
                <p className="mt-3 text-sm text-muted-foreground lg:text-base">
                  {summary.staffCount || run.staffCount} staff
                  {run.processedDate ? ` · processed ${formatDisplayDate(run.processedDate)}` : ""}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-right lg:min-w-[180px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total net pay</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand-purple lg:text-3xl">
                {summary.totalNet || run.totalAmount > 0 ? formatCurrency(summary.totalNet || run.totalAmount) : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.paidCount} paid · {summary.pendingCount} pending
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-5">
          <AuditSectionCard title="Run details">
            <AuditDetailGrid items={detailItems} />
          </AuditSectionCard>

          {run.status !== "draft" ? (
            <AuditSectionCard title="Staff payslips">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                  <FinanceSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name, employee ID, or department…"
                  />
                </div>
                {canEdit ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    {staffOptions.length > 0 ? (
                      <FinanceFilterSelect
                        label="Select employee"
                        value={selectedStaffId}
                        onChange={setSelectedStaffId}
                        options={[{ id: "", label: "Choose staff member…" }, ...staffOptions]}
                        className="min-w-[220px]"
                      />
                    ) : null}
                    <Button
                      variant="outline"
                      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4"
                      disabled={addEmployee.isPending || staffOptions.length === 0}
                      onClick={() => void handleAddAll()}
                    >
                      Add all staff
                    </Button>
                    <Button
                      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90"
                      disabled={addEmployee.isPending}
                      onClick={() => void handleAddEmployee()}
                    >
                      {addEmployee.isPending ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0" />
                      )}
                      {selectedStaffId ? "Add employee" : "Add placeholder"}
                    </Button>
                  </div>
                ) : null}
              </div>
              <FinancePanel className="overflow-x-auto border border-border p-0">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Gross</th>
                      <th className="px-4 py-3 font-medium">Net pay</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      {canEdit ? <th className="px-4 py-3 font-medium text-right">Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                          No payslips in this run yet. Add employees to calculate payroll.
                        </td>
                      </tr>
                    ) : (
                      filteredPayslips.map((slip) => (
                        <tr key={slip.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <Link
                              href={payslipHref(runId, slip.id)}
                              className="font-semibold text-foreground hover:text-brand-purple"
                            >
                              {slip.staffName}
                            </Link>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{slip.employeeId}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{slip.department}</td>
                          <td className="px-4 py-3 tabular-nums">
                            {canEdit && editingId === slip.id ? (
                              <input
                                type="number"
                                value={editGross}
                                onChange={(e) => setEditGross(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void handleSaveGross(slip.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="h-8 w-24 rounded-lg border border-border px-2 text-sm"
                              />
                            ) : (
                              <button
                                type="button"
                                className={cn(canEdit && "hover:text-brand-purple")}
                                onClick={() => {
                                  if (!canEdit) return;
                                  setEditingId(slip.id);
                                  setEditGross(String(slip.grossPay));
                                }}
                              >
                                {formatCurrency(slip.grossPay)}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(slip.netPay)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                                slip.status === "paid" ? "bg-green/15 text-green" : "bg-brand-orange/15 text-brand-orange",
                              )}
                            >
                              {slip.status}
                            </span>
                          </td>
                          {canEdit ? (
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                {editingId === slip.id ? (
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-full px-3"
                                    disabled={updatePayslip.isPending}
                                    onClick={() => void handleSaveGross(slip.id)}
                                  >
                                    Save
                                  </Button>
                                ) : null}
                                <Button
                                variant="outline"
                                size="sm"
                                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-destructive hover:text-destructive"
                                disabled={removePayslip.isPending && removingId === slip.id}
                                onClick={() => void handleRemovePayslip(slip.id)}
                              >
                                {removePayslip.isPending && removingId === slip.id ? (
                                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                )}
                                Remove
                              </Button>
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredPayslips.length > 0 ? (
                    <tfoot>
                      <tr className="bg-muted/25 font-semibold">
                        <td className="px-4 py-3" colSpan={2}>
                          Totals ({summary.staffCount} staff)
                        </td>
                        <td className="px-4 py-3 tabular-nums">{formatCurrency(summary.totalGross)}</td>
                        <td className="px-4 py-3 tabular-nums text-brand-purple">{formatCurrency(summary.totalNet)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {summary.paidCount} paid · {summary.pendingCount} pending
                        </td>
                        {canEdit ? <td /> : null}
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </FinancePanel>
              {canEdit ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Salaries auto-calculate from role and department. Adding or removing staff updates gross, net, and run totals instantly.
                </p>
              ) : null}
            </AuditSectionCard>
          ) : (
            <FinancePanel className="border border-dashed border-border bg-muted/20 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Draft run — payslips not generated yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prepare this run to calculate salaries for {run.staffCount} staff members.
              </p>
            </FinancePanel>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <AuditSectionCard title="Run actions">
            <div className="flex flex-col gap-2">
              {run.status === "draft" ? (
                <Button
                  className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
                  disabled={payrollAction.isPending}
                  onClick={() => void handleActivate()}
                >
                  {actionState === "activate" ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Play className="h-4 w-4 shrink-0" />}
                  Prepare run
                </Button>
              ) : null}

              {run.status === "processing" ? (
                <>
                  <label className="block text-xs">
                    <span className="mb-1.5 block font-medium text-muted-foreground">Disbursement reference</span>
                    <input
                      value={disbursementRef}
                      onChange={(e) => setDisbursementRef(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <Button
                    className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue/90"
                    disabled={payrollAction.isPending || payslips.length === 0}
                    onClick={() => void handleFinalize()}
                  >
                    {actionState === "finalize" ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                    Review & finalize
                  </Button>
                  <Button
                    variant="outline"
                    className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 text-destructive hover:text-destructive"
                    disabled={payrollAction.isPending}
                    onClick={() => void handleCancel()}
                  >
                    {actionState === "cancel" ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
                    Cancel run
                  </Button>
                </>
              ) : null}

              {run.status !== "draft" ? (
                <Button
                  variant="outline"
                  className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5"
                  onClick={() => downloadPayrollCsv(runId)}
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0" />
                  Export payslips CSV
                </Button>
              ) : null}
            </div>
          </AuditSectionCard>

          {run.status === "completed" ? (
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Finalized on <span className="font-medium text-foreground">{formatDisplayDate(run.processedDate!)}</span>.
                All {summary.paidCount} payslips are marked paid and ready for distribution.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </AuditPageShell>
  );
}
