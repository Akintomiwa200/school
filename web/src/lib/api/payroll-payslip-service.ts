import type { Payslip, PayrollRun, PayslipLine } from "@/components/dashboard/accountant/accountant-data";
import type { StaffRecord, StaffRole } from "@/components/dashboard/admin/admin-entities-data";
import { formatCurrency } from "@/components/dashboard/fees/fee-ui";
import { formatDisplayDate } from "@/components/dashboard/fees/student-fees-data";
import { getPayrollSettings } from "@/lib/api/payroll-settings-store";

export type PayslipPayload = Omit<Payslip, "earnings" | "deductions"> & {
  grossPayFormatted: string;
  netPayFormatted: string;
  paidDateFormatted?: string;
  earnings: Array<PayslipLine & { amountFormatted: string }>;
  deductions: Array<PayslipLine & { amountFormatted: string }>;
  generatedAt: string;
};

const ROLE_BASE: Record<StaffRole, number> = {
  Teacher: 4800,
  HOD: 6200,
  Accountant: 5500,
  Librarian: 4200,
  "IT Support": 5100,
  Administrator: 5800,
  "Non-teaching": 3800,
};

const SYNTHETIC_FIRST = [
  "Grace",
  "Samuel",
  "Amina",
  "Chidi",
  "Ngozi",
  "Ibrahim",
  "Elena",
  "Kwame",
  "Priya",
  "Omar",
];
const SYNTHETIC_LAST = [
  "Williams",
  "Chen",
  "Patel",
  "Osei",
  "Bello",
  "Nguyen",
  "Khan",
  "Mbeki",
  "Santos",
  "Ali",
];
const SYNTHETIC_DEPTS = [
  "Mathematics",
  "Science",
  "English",
  "Finance",
  "Library",
  "Technology",
  "Administration",
  "Social Studies",
];

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function buildEarnings(grossPay: number) {
  const settings = getPayrollSettings();
  const base = roundCurrency(grossPay * (1 - settings.housingAllowanceRate - settings.performanceBonusRate));
  const allowance = roundCurrency(grossPay * settings.housingAllowanceRate);
  const bonus = roundCurrency(grossPay * settings.performanceBonusRate);
  return [
    { label: "Base salary", amount: base },
    { label: "Housing allowance", amount: allowance },
    { label: "Performance bonus", amount: bonus },
  ];
}

function buildDeductions(grossPay: number) {
  const settings = getPayrollSettings();
  const tax = roundCurrency(grossPay * settings.taxRate);
  const pension = roundCurrency(grossPay * settings.pensionRate);
  const health = roundCurrency(grossPay * settings.healthRate);
  return [
    { label: "Income tax", amount: tax },
    { label: "Pension", amount: pension },
    { label: "Health insurance", amount: health },
  ];
}

export function recalculatePayslipAmounts(slip: Payslip, grossPay: number): Payslip {
  const earnings = buildEarnings(grossPay);
  const deductions = buildDeductions(grossPay);
  const netPay = roundCurrency(
    earnings.reduce((sum, line) => sum + line.amount, 0) -
      deductions.reduce((sum, line) => sum + line.amount, 0),
  );
  return { ...slip, grossPay, earnings, deductions, netPay };
}

export function createPayslipForStaff(run: PayrollRun, member: StaffRecord, index: number): Payslip {
  const seed = hashSeed(`${run.id}-${member.id}`);
  const base = ROLE_BASE[member.role] + (seed % 900);
  const earnings = buildEarnings(base);
  const deductions = buildDeductions(base);
  const netPay = roundCurrency(earnings.reduce((sum, line) => sum + line.amount, 0) - deductions.reduce((sum, line) => sum + line.amount, 0));

  return {
    id: `ps-${run.id}-${member.id}`,
    runId: run.id,
    staffId: member.id,
    employeeId: member.employeeId,
    staffName: member.name,
    department: member.department,
    designation: member.designation,
    period: run.period,
    grossPay: base,
    earnings,
    deductions,
    netPay,
    status: run.status === "completed" ? "paid" : "pending",
    paidDate: run.status === "completed" ? run.processedDate : undefined,
  };
}

function buildPayslipFromStaff(run: PayrollRun, member: StaffRecord, index: number): Payslip {
  return createPayslipForStaff(run, member, index);
}

export function createSyntheticPayslip(run: PayrollRun, index: number): Payslip {
  const seed = hashSeed(`${run.id}-synthetic-${index}`);
  const first = SYNTHETIC_FIRST[seed % SYNTHETIC_FIRST.length];
  const last = SYNTHETIC_LAST[(seed >> 3) % SYNTHETIC_LAST.length];
  const department = SYNTHETIC_DEPTS[(seed >> 5) % SYNTHETIC_DEPTS.length];
  const roles: StaffRole[] = ["Teacher", "Teacher", "Teacher", "HOD", "Non-teaching"];
  const role = roles[seed % roles.length];
  const base = ROLE_BASE[role] + (seed % 700);
  const earnings = buildEarnings(base);
  const deductions = buildDeductions(base);
  const netPay = roundCurrency(earnings.reduce((sum, line) => sum + line.amount, 0) - deductions.reduce((sum, line) => sum + line.amount, 0));
  const employeeId = `EMP-${1100 + index}`;

  return {
    id: `ps-${run.id}-syn-${index}`,
    runId: run.id,
    staffId: `syn-${index}`,
    employeeId,
    staffName: `${first} ${last}`,
    department,
    designation: role === "HOD" ? `Head of ${department}` : `${department} ${role}`,
    period: run.period,
    grossPay: base,
    earnings,
    deductions,
    netPay,
    status: run.status === "completed" ? "paid" : "pending",
    paidDate: run.status === "completed" ? run.processedDate : undefined,
  };
}

function buildSyntheticPayslip(run: PayrollRun, index: number): Payslip {
  return createSyntheticPayslip(run, index);
}

function scalePayslipsToTotal(payslips: Payslip[], targetTotal: number) {
  const currentTotal = payslips.reduce((sum, slip) => sum + slip.netPay, 0);
  if (currentTotal <= 0 || Math.abs(currentTotal - targetTotal) < 1) return;

  const ratio = targetTotal / currentTotal;
  payslips.forEach((slip) => {
    slip.earnings = slip.earnings.map((line) => ({ ...line, amount: roundCurrency(line.amount * ratio) }));
    slip.deductions = slip.deductions.map((line) => ({ ...line, amount: roundCurrency(line.amount * ratio) }));
    slip.grossPay = roundCurrency(slip.grossPay * ratio);
    slip.netPay = roundCurrency(slip.netPay * ratio);
  });

  const adjustedTotal = payslips.reduce((sum, slip) => sum + slip.netPay, 0);
  const delta = roundCurrency(targetTotal - adjustedTotal);
  if (delta !== 0 && payslips[0]) {
    payslips[0].netPay = roundCurrency(payslips[0].netPay + delta);
    const bonus = payslips[0].earnings.find((line) => line.label === "Performance bonus");
    if (bonus) bonus.amount = roundCurrency(bonus.amount + delta);
  }
}

export function generatePayslipsForRun(
  run: PayrollRun,
  staff: StaffRecord[],
): Payslip[] {
  if (run.status === "draft") return [];

  const activeStaff = staff.filter((member) => member.status === "active");
  const payslips: Payslip[] = [];

  for (const member of activeStaff) {
    payslips.push(buildPayslipFromStaff(run, member, payslips.length));
  }

  while (payslips.length < run.staffCount) {
    payslips.push(buildSyntheticPayslip(run, payslips.length));
  }

  const result = payslips.slice(0, run.staffCount);
  if (run.totalAmount > 0) {
    scalePayslipsToTotal(result, run.totalAmount);
  }

  return result;
}

export function toPayslipPayload(payslip: Payslip): PayslipPayload {
  return {
    ...payslip,
    grossPayFormatted: formatCurrency(payslip.grossPay),
    netPayFormatted: formatCurrency(payslip.netPay),
    paidDateFormatted: payslip.paidDate ? formatDisplayDate(payslip.paidDate) : undefined,
    earnings: payslip.earnings.map((line) => ({ ...line, amountFormatted: formatCurrency(line.amount) })),
    deductions: payslip.deductions.map((line) => ({ ...line, amountFormatted: formatCurrency(line.amount) })),
    generatedAt: new Date().toISOString(),
  };
}

export function payslipPrintHtml(payslip: PayslipPayload) {
  const earningRows = payslip.earnings
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${line.label}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${line.amountFormatted}</td></tr>`,
    )
    .join("");
  const deductionRows = payslip.deductions
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${line.label}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">-${line.amountFormatted}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payslip ${payslip.id}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #111; margin: 40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
    .brand { font-size:24px; font-weight:700; color:#5d21d0; }
    .meta { text-align:right; font-size:13px; color:#555; }
    h1 { font-size:20px; margin:0 0 8px; }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    .section { margin-top:24px; }
    .total { font-size:22px; font-weight:700; color:#5d21d0; margin-top:24px; }
    .footer { margin-top:40px; font-size:12px; color:#666; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Schooli</div>
      <p style="margin:8px 0 0;color:#555">Official staff payslip</p>
    </div>
    <div class="meta">
      <div><strong>${payslip.period}</strong></div>
      <div>${payslip.employeeId}</div>
    </div>
  </div>
  <h1>Payslip</h1>
  <p><strong>Employee:</strong> ${payslip.staffName}</p>
  <p><strong>Department:</strong> ${payslip.department}</p>
  <p><strong>Designation:</strong> ${payslip.designation}</p>
  <p><strong>Status:</strong> ${payslip.status}</p>
  <div class="section">
    <h2 style="font-size:14px;margin:0 0 8px">Earnings</h2>
    <table><tbody>${earningRows}</tbody></table>
  </div>
  <div class="section">
    <h2 style="font-size:14px;margin:0 0 8px">Deductions</h2>
    <table><tbody>${deductionRows}</tbody></table>
  </div>
  <div class="total">Net pay: ${payslip.netPayFormatted}</div>
  <div class="footer">
    Generated ${new Date(payslip.generatedAt).toLocaleString("en-US")}${payslip.paidDateFormatted ? ` · Paid ${payslip.paidDateFormatted}` : ""}
  </div>
</body>
</html>`;
}

export function payslipsToCsv(payslips: Payslip[]) {
  const header = "Employee ID,Name,Department,Designation,Gross Pay,Net Pay,Status";
  const rows = payslips.map(
    (slip) =>
      `${slip.employeeId},"${slip.staffName}","${slip.department}","${slip.designation}",${slip.grossPay},${slip.netPay},${slip.status}`,
  );
  return [header, ...rows].join("\n");
}
