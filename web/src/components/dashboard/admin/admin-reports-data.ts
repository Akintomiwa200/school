export type ReportPeriod = "Daily" | "Weekly" | "Monthly" | "Yearly";

export type ReportMetric = {
  id: string;
  label: string;
  value: string;
  change: number;
  tone: "pink" | "teal" | "blue" | "cyan" | "purple" | "orange";
};

export const ADMIN_REPORT_METRICS: ReportMetric[] = [
  { id: "fees", label: "Fees collected", value: "₦12.6M", change: 2.5, tone: "pink" },
  { id: "outstanding", label: "Outstanding dues", value: "₦2.0M", change: -4.5, tone: "teal" },
  { id: "admissions", label: "New admissions", value: "110", change: 1.5, tone: "blue" },
  { id: "attendance", label: "Attendance rate", value: "94%", change: -2.5, tone: "cyan" },
  { id: "students", label: "Active students", value: "842", change: 3.5, tone: "purple" },
  { id: "classSize", label: "Avg class size", value: "31", change: 2.5, tone: "orange" },
];

export const ENROLLMENT_TREND: Record<ReportPeriod, { label: string; value: number }[]> = {
  Daily: [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 18 },
    { label: "Wed", value: 15 },
    { label: "Thu", value: 22 },
    { label: "Fri", value: 19 },
    { label: "Sat", value: 8 },
    { label: "Sun", value: 5 },
  ],
  Weekly: [
    { label: "W1", value: 42 },
    { label: "W2", value: 58 },
    { label: "W3", value: 51 },
    { label: "W4", value: 67 },
  ],
  Monthly: [
    { label: "Sep", value: 120 },
    { label: "Oct", value: 145 },
    { label: "Nov", value: 132 },
    { label: "Dec", value: 98 },
    { label: "Jan", value: 156 },
    { label: "Feb", value: 168 },
    { label: "Mar", value: 175 },
  ],
  Yearly: [
    { label: "2022", value: 680 },
    { label: "2023", value: 720 },
    { label: "2024", value: 798 },
    { label: "2025", value: 842 },
    { label: "2026", value: 865 },
  ],
};

export const COLLECTION_COMPARISON = [
  { period: "Term 1", online: 4200, offline: 3100 },
  { period: "Term 2", online: 4800, offline: 2900 },
  { period: "Term 3", online: 3900, offline: 3400 },
  { period: "Summer", online: 2100, offline: 1800 },
];

export const FEATURED_STUDENT = {
  name: "Evelyn Harper",
  grade: "Grade 10-A",
  studentId: "PRE43178",
  attendance: 99,
  averageScore: 98,
  feeStatus: "Paid",
  avatarTone: "purple" as const,
};

export const TOP_ENROLLMENT_LOCATIONS = [
  { region: "Lagos Mainland", students: 186, share: 22 },
  { region: "Abuja FCT", students: 142, share: 17 },
  { region: "Port Harcourt", students: 98, share: 12 },
  { region: "Ibadan", students: 76, share: 9 },
  { region: "Kano", students: 54, share: 6 },
];

export const FEE_BREAKDOWN = [
  { name: "Tuition", value: 58, color: "#7c3aed" },
  { name: "Transport", value: 18, color: "#06b6d4" },
  { name: "Library", value: 12, color: "#f59e0b" },
  { name: "Sports", value: 8, color: "#ec4899" },
  { name: "Other", value: 4, color: "#94a3b8" },
];

export const REVENUE_BY_CATEGORY = [
  { name: "Primary fees", value: 35, color: "#8b5cf6" },
  { name: "Secondary fees", value: 40, color: "#14b8a6" },
  { name: "Boarding", value: 15, color: "#3b82f6" },
  { name: "Extras", value: 10, color: "#f97316" },
];

export type StandardReportCategory = "students" | "staff" | "operations" | "finance" | "admissions";

export type StandardReport = {
  id: string;
  name: string;
  description: string;
  format: string;
  lastRun: string;
  category: StandardReportCategory;
  recordsLabel: string;
  tone: "purple" | "blue" | "green" | "orange" | "teal";
};

export const STANDARD_REPORTS: StandardReport[] = [
  {
    id: "r1",
    name: "Enrollment summary",
    description: "Students by grade and class",
    format: "PDF / CSV",
    lastRun: "2026-03-01",
    category: "students",
    recordsLabel: "842 students",
    tone: "purple",
  },
  {
    id: "r2",
    name: "Staff directory export",
    description: "All employees with roles",
    format: "CSV",
    lastRun: "2026-02-28",
    category: "staff",
    recordsLabel: "56 staff",
    tone: "blue",
  },
  {
    id: "r3",
    name: "Attendance overview",
    description: "School-wide attendance rates",
    format: "PDF",
    lastRun: "2026-02-25",
    category: "operations",
    recordsLabel: "30 days",
    tone: "green",
  },
  {
    id: "r4",
    name: "Admissions pipeline",
    description: "Applications by status",
    format: "PDF / CSV",
    lastRun: "2026-03-04",
    category: "admissions",
    recordsLabel: "110 applications",
    tone: "orange",
  },
  {
    id: "r5",
    name: "Fee collection",
    description: "Collections vs outstanding",
    format: "PDF",
    lastRun: "2026-03-05",
    category: "finance",
    recordsLabel: "₦12.6M collected",
    tone: "teal",
  },
];

/** @deprecated use STANDARD_REPORTS */
export const EXPORT_REPORTS = STANDARD_REPORTS.map(({ id, name, description, format, lastRun }) => ({
  id,
  name,
  description,
  format,
  lastRun,
}));

export function formatReportLastRun(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseReportFormats(format: string) {
  return format.split("/").map((part) => part.trim());
}

export function formatReportChange(change: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function totalFeeBreakdown() {
  return "₦12.6M";
}
