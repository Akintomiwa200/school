export type PayrollSettings = {
  taxRate: number;
  pensionRate: number;
  healthRate: number;
  housingAllowanceRate: number;
  performanceBonusRate: number;
  payFrequency: "monthly" | "biweekly";
  defaultPayDay: number;
  autoPostExpenseOnFinalize: boolean;
  currency: string;
};

export const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  taxRate: 0.12,
  pensionRate: 0.06,
  healthRate: 0.03,
  housingAllowanceRate: 0.12,
  performanceBonusRate: 0.06,
  payFrequency: "monthly",
  defaultPayDay: 28,
  autoPostExpenseOnFinalize: true,
  currency: "USD",
};

let settings: PayrollSettings = { ...DEFAULT_PAYROLL_SETTINGS };

export function getPayrollSettings() {
  return settings;
}

export function updatePayrollSettings(patch: Partial<PayrollSettings>) {
  settings = { ...settings, ...patch };
  return settings;
}
