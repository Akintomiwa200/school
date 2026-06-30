import type { Payslip, PayrollRun } from "@/components/dashboard/accountant/accountant-data";
import { getMutablePayrollRuns, getPayslipsForRunExport } from "@/lib/api/payroll-entity-store";

export type PayrollDepartmentSummary = {
  department: string;
  staffCount: number;
  totalGross: number;
  totalNet: number;
};

export type PayrollYtdEntry = {
  staffId: string;
  employeeId: string;
  staffName: string;
  department: string;
  ytdGross: number;
  ytdNet: number;
  ytdTax: number;
  runsIncluded: number;
};

export type PayrollReports = {
  year: number;
  completedRuns: number;
  totalDisbursed: number;
  totalGrossYtd: number;
  totalNetYtd: number;
  totalTaxYtd: number;
  activeRun: PayrollRun | null;
  byDepartment: PayrollDepartmentSummary[];
  ytdByEmployee: PayrollYtdEntry[];
  recentRuns: PayrollRun[];
};

function collectCompletedPayslips(year: number): Payslip[] {
  const runs = getMutablePayrollRuns().filter(
    (run) => run.status === "completed" && run.period.includes(String(year)),
  );
  const slips: Payslip[] = [];
  for (const run of runs) {
    slips.push(...getPayslipsForRunExport(run.id));
  }
  return slips;
}

export function getPayrollReports(year = new Date().getFullYear()): PayrollReports {
  const runs = getMutablePayrollRuns();
  const completed = runs.filter((run) => run.status === "completed" && run.period.includes(String(year)));
  const activeRun = runs.find((run) => run.status === "processing") ?? null;
  const payslips = collectCompletedPayslips(year);

  const deptMap = new Map<string, PayrollDepartmentSummary>();
  const ytdMap = new Map<string, PayrollYtdEntry>();

  for (const slip of payslips) {
    const tax = slip.deductions.find((line) => line.label === "Income tax")?.amount ?? 0;
    const dept = deptMap.get(slip.department) ?? {
      department: slip.department,
      staffCount: 0,
      totalGross: 0,
      totalNet: 0,
    };
    dept.staffCount += 1;
    dept.totalGross += slip.grossPay;
    dept.totalNet += slip.netPay;
    deptMap.set(slip.department, dept);

    const ytd = ytdMap.get(slip.staffId) ?? {
      staffId: slip.staffId,
      employeeId: slip.employeeId,
      staffName: slip.staffName,
      department: slip.department,
      ytdGross: 0,
      ytdNet: 0,
      ytdTax: 0,
      runsIncluded: 0,
    };
    ytd.ytdGross += slip.grossPay;
    ytd.ytdNet += slip.netPay;
    ytd.ytdTax += tax;
    ytd.runsIncluded += 1;
    ytdMap.set(slip.staffId, ytd);
  }

  return {
    year,
    completedRuns: completed.length,
    totalDisbursed: completed.reduce((sum, run) => sum + run.totalAmount, 0),
    totalGrossYtd: payslips.reduce((sum, slip) => sum + slip.grossPay, 0),
    totalNetYtd: payslips.reduce((sum, slip) => sum + slip.netPay, 0),
    totalTaxYtd: payslips.reduce(
      (sum, slip) => sum + (slip.deductions.find((line) => line.label === "Income tax")?.amount ?? 0),
      0,
    ),
    activeRun,
    byDepartment: [...deptMap.values()].sort((a, b) => b.totalNet - a.totalNet),
    ytdByEmployee: [...ytdMap.values()].sort((a, b) => b.ytdNet - a.ytdNet),
    recentRuns: runs.slice(0, 6),
  };
}

export function computeEmployeeYtd(staffId: string, year = new Date().getFullYear()) {
  const slips = collectCompletedPayslips(year).filter((slip) => slip.staffId === staffId);
  return {
    ytdGross: slips.reduce((sum, slip) => sum + slip.grossPay, 0),
    ytdNet: slips.reduce((sum, slip) => sum + slip.netPay, 0),
    ytdTax: slips.reduce(
      (sum, slip) => sum + (slip.deductions.find((line) => line.label === "Income tax")?.amount ?? 0),
      0,
    ),
  };
}
