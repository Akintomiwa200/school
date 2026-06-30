import { PAYROLL_RUNS, type PayrollRun, type Payslip } from "@/components/dashboard/accountant/accountant-data";
import { addExpense } from "@/lib/api/expense-entity-store";
import {
  createPayslipForStaff,
  createSyntheticPayslip,
  generatePayslipsForRun,
  recalculatePayslipAmounts,
} from "@/lib/api/payroll-payslip-service";
import { getPayrollSettings } from "@/lib/api/payroll-settings-store";
import { getMutableStaff, getStaffById } from "@/lib/api/staff-entity-store";

let payrollRuns: PayrollRun[] = [...PAYROLL_RUNS];
const payslipCache = new Map<string, Payslip[]>();

export type PayrollStaffOption = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
};

function roundTotal(value: number) {
  return Math.round(value);
}

function periodBounds(period: string) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const match = period.match(/^(\w+)\s+(\d{4})$/);
  if (!match) {
    const now = new Date();
    return {
      payPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      payPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
    };
  }
  const monthIndex = months.indexOf(match[1]);
  const year = Number(match[2]);
  if (monthIndex < 0) {
    const now = new Date();
    return {
      payPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      payPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
    };
  }
  return {
    payPeriodStart: new Date(year, monthIndex, 1).toISOString().slice(0, 10),
    payPeriodEnd: new Date(year, monthIndex + 1, 0).toISOString().slice(0, 10),
  };
}

function attachYtd(slip: Payslip): Payslip {
  const year = String(new Date().getFullYear());
  let ytdGross = 0;
  let ytdNet = 0;
  for (const run of payrollRuns.filter((entry) => entry.status === "completed" && entry.period.includes(year))) {
    const cached = payslipCache.get(run.id) ?? [];
    for (const entry of cached) {
      if (entry.staffId === slip.staffId) {
        ytdGross += entry.grossPay;
        ytdNet += entry.netPay;
      }
    }
  }
  return { ...slip, ytdGross: ytdGross + slip.grossPay, ytdNet: ytdNet + slip.netPay };
}

function summarizePayslips(payslips: Payslip[]) {
  return {
    staffCount: payslips.length,
    totalGross: roundTotal(payslips.reduce((sum, slip) => sum + slip.grossPay, 0)),
    totalNet: roundTotal(payslips.reduce((sum, slip) => sum + slip.netPay, 0)),
    pendingCount: payslips.filter((slip) => slip.status === "pending").length,
    paidCount: payslips.filter((slip) => slip.status === "paid").length,
  };
}

function syncRunFromPayslips(runId: string, payslips: Payslip[]) {
  const summary = summarizePayslips(payslips);
  payrollRuns = payrollRuns.map((entry) =>
    entry.id === runId
      ? { ...entry, staffCount: summary.staffCount, totalAmount: summary.totalNet }
      : entry,
  );
  payslipCache.set(runId, payslips.map(attachYtd));
}

function refreshPayslipCache(runId: string) {
  const run = payrollRuns.find((entry) => entry.id === runId);
  if (!run || run.status === "draft" || run.status === "cancelled") {
    payslipCache.delete(runId);
    return [];
  }
  const payslips = generatePayslipsForRun(run, getMutableStaff()).map(attachYtd);
  payslipCache.set(runId, payslips);
  return payslips;
}

function getPayslipsForRun(runId: string) {
  const run = getPayrollRunById(runId);
  if (!run || run.status === "draft" || run.status === "cancelled") return [];
  const cached = payslipCache.get(runId);
  if (cached && cached.length > 0) return cached;
  return refreshPayslipCache(runId);
}

export function getPayslipsForRunExport(runId: string) {
  return getPayslipsForRun(runId);
}

function getAvailableStaffForRun(runId: string): PayrollStaffOption[] {
  const included = new Set(getPayslipsForRun(runId).map((slip) => slip.staffId));
  return getMutableStaff()
    .filter((member) => member.status === "active" && !included.has(member.id))
    .map((member) => ({
      id: member.id,
      name: member.name,
      employeeId: member.employeeId,
      department: member.department,
      designation: member.designation,
    }));
}

export function getMutablePayrollRuns() {
  return payrollRuns;
}

export function getPayrollRunById(id: string) {
  return payrollRuns.find((run) => run.id === id);
}

export function getActivePayrollRun() {
  return payrollRuns.find((run) => run.status === "processing") ?? null;
}

export function getPayrollRunDetail(id: string) {
  const run = getPayrollRunById(id);
  if (!run) return null;

  const payslips = getPayslipsForRun(id);
  const summary =
    payslips.length > 0
      ? summarizePayslips(payslips)
      : {
          staffCount: run.staffCount,
          totalGross: 0,
          totalNet: run.totalAmount,
          pendingCount: 0,
          paidCount: 0,
        };

  return {
    run: { ...run, staffCount: summary.staffCount, totalAmount: summary.totalNet || run.totalAmount },
    payslips,
    summary,
    availableStaff: run.status === "processing" ? getAvailableStaffForRun(id) : [],
  };
}

export function getPayslipById(runId: string, payslipId: string) {
  return getPayslipsForRun(runId).find((slip) => slip.id === payslipId);
}

export function startPayrollRun(input: {
  period: string;
  notes?: string;
  duplicateFromRunId?: string;
}) {
  if (payrollRuns.some((run) => run.status === "processing")) return null;
  if (payrollRuns.some((run) => run.period === input.period && run.status !== "cancelled")) return null;

  const bounds = periodBounds(input.period);
  const runId = `pr-${Date.now()}`;

  let payslips: Payslip[] = [];
  if (input.duplicateFromRunId) {
    const source = getPayslipsForRun(input.duplicateFromRunId);
    payslips = source.map((slip) => ({
      ...slip,
      id: `ps-${runId}-${slip.staffId}-${Date.now()}`,
      runId,
      period: input.period,
      status: "pending" as const,
      paidDate: undefined,
      disbursementRef: undefined,
    }));
  } else {
    const count = getMutableStaff().filter((member) => member.status === "active").length || 84;
    payslips = generatePayslipsForRun(
      { id: runId, period: input.period, staffCount: count, totalAmount: 0, status: "processing" },
      getMutableStaff(),
    ).map((slip) => ({ ...slip, runId, period: input.period, status: "pending" as const, paidDate: undefined }));
  }

  const run: PayrollRun = {
    id: runId,
    period: input.period,
    staffCount: payslips.length,
    totalAmount: roundTotal(payslips.reduce((sum, slip) => sum + slip.netPay, 0)),
    status: "processing",
    createdAt: new Date().toISOString(),
    notes: input.notes,
    ...bounds,
  };

  payrollRuns = [run, ...payrollRuns];
  payslipCache.set(runId, payslips.map(attachYtd));
  return run;
}

export function activateDraftRun(id: string) {
  const run = payrollRuns.find((entry) => entry.id === id);
  if (!run || run.status !== "draft") return null;

  const preview = generatePayslipsForRun(
    { ...run, status: "processing" },
    getMutableStaff(),
  ).map((slip) => ({ ...slip, status: "pending" as const, paidDate: undefined }));

  const updated: PayrollRun = {
    ...run,
    status: "processing",
    staffCount: preview.length,
    totalAmount: roundTotal(preview.reduce((sum, slip) => sum + slip.netPay, 0)),
    createdAt: new Date().toISOString(),
    ...periodBounds(run.period),
  };

  payrollRuns = payrollRuns.map((entry) => (entry.id === id ? updated : entry));
  payslipCache.set(id, preview.map(attachYtd));
  return updated;
}

export function cancelPayrollRun(id: string) {
  const run = getPayrollRunById(id);
  if (!run || run.status !== "processing") return null;

  const updated: PayrollRun = { ...run, status: "cancelled" };
  payrollRuns = payrollRuns.map((entry) => (entry.id === id ? updated : entry));
  payslipCache.delete(id);
  return updated;
}

export function deleteDraftRun(id: string) {
  const run = getPayrollRunById(id);
  if (!run || run.status !== "draft") return null;
  payrollRuns = payrollRuns.filter((entry) => entry.id !== id);
  payslipCache.delete(id);
  return run;
}

export function duplicatePayrollRun(sourceId: string, period?: string) {
  const source = getPayrollRunById(sourceId);
  if (!source) return null;
  return startPayrollRun({
    period: period ?? source.period,
    notes: `Duplicated from ${source.period}`,
    duplicateFromRunId: sourceId,
  });
}

export function addStaffToPayrollRun(runId: string, staffId: string) {
  const run = getPayrollRunById(runId);
  if (!run || run.status !== "processing") return null;

  const member = getStaffById(staffId);
  if (!member || member.status !== "active") return null;

  const payslips = [...getPayslipsForRun(runId)];
  if (payslips.some((slip) => slip.staffId === staffId)) return null;

  const slip = createPayslipForStaff(run, member, payslips.length);
  payslips.push({ ...slip, status: "pending", paidDate: undefined });
  syncRunFromPayslips(runId, payslips);
  return getPayrollRunDetail(runId);
}

export function addAllStaffToPayrollRun(runId: string) {
  const run = getPayrollRunById(runId);
  if (!run || run.status !== "processing") return null;

  let payslips = [...getPayslipsForRun(runId)];
  for (const member of getAvailableStaffForRun(runId)) {
    const staff = getStaffById(member.id);
    if (!staff) continue;
    const slip = createPayslipForStaff(run, staff, payslips.length);
    payslips.push({ ...slip, status: "pending", paidDate: undefined });
  }
  syncRunFromPayslips(runId, payslips);
  return getPayrollRunDetail(runId);
}

export function addSyntheticToPayrollRun(runId: string) {
  const run = getPayrollRunById(runId);
  if (!run || run.status !== "processing") return null;

  const payslips = [...getPayslipsForRun(runId)];
  const index = payslips.length + 1;
  const slip = createSyntheticPayslip(run, index);
  payslips.push({
    ...slip,
    id: `ps-${runId}-syn-${Date.now()}`,
    staffId: `syn-${Date.now()}`,
    employeeId: `EMP-${1200 + index}`,
    status: "pending",
    paidDate: undefined,
  });
  syncRunFromPayslips(runId, payslips);
  return getPayrollRunDetail(runId);
}

export function removePayslipFromRun(runId: string, payslipId: string) {
  const run = getPayrollRunById(runId);
  if (!run || run.status !== "processing") return null;

  const before = getPayslipsForRun(runId);
  const payslips = before.filter((slip) => slip.id !== payslipId);
  if (payslips.length === before.length) return null;

  syncRunFromPayslips(runId, payslips);
  return getPayrollRunDetail(runId);
}

export function updatePayslipInRun(runId: string, payslipId: string, grossPay: number) {
  const run = getPayrollRunById(runId);
  if (!run || run.status !== "processing") return null;
  if (!Number.isFinite(grossPay) || grossPay <= 0) return null;

  const payslips = getPayslipsForRun(runId).map((slip) =>
    slip.id === payslipId ? recalculatePayslipAmounts(slip, grossPay) : slip,
  );
  if (!payslips.some((slip) => slip.id === payslipId)) return null;

  syncRunFromPayslips(runId, payslips);
  return getPayrollRunDetail(runId);
}

export function finalizePayrollRun(id: string, finalizedBy = "Finance desk", disbursementRef?: string) {
  const run = payrollRuns.find((entry) => entry.id === id);
  if (!run || run.status !== "processing") return null;

  const processedDate = new Date().toISOString().slice(0, 10);
  const ref = disbursementRef ?? `DISB-${processedDate.replace(/-/g, "")}-${id.slice(-4).toUpperCase()}`;
  const payslips = getPayslipsForRun(id).map((slip) => ({
    ...slip,
    status: "paid" as const,
    paidDate: processedDate,
    disbursementRef: ref,
  }));

  const summary = summarizePayslips(payslips);
  const updated: PayrollRun = {
    ...run,
    status: "completed",
    processedDate,
    finalizedBy,
    disbursementRef: ref,
    staffCount: summary.staffCount,
    totalAmount: summary.totalNet,
  };

  payrollRuns = payrollRuns.map((entry) => (entry.id === id ? updated : entry));
  payslipCache.set(id, payslips.map(attachYtd));

  if (getPayrollSettings().autoPostExpenseOnFinalize) {
    addExpense({
      date: processedDate,
      category: "Payroll",
      vendor: "Staff salaries",
      description: `${run.period} payroll disbursement — ${summary.staffCount} staff`,
      amount: summary.totalNet,
      status: "paid",
      requestedBy: finalizedBy,
    });
  }

  return updated;
}

for (const run of payrollRuns) {
  if (run.status !== "draft" && run.status !== "cancelled") {
    refreshPayslipCache(run.id);
  }
}
