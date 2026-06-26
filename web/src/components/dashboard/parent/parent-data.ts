export type ParentChild = {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  className: string;
  avatarTone: "purple" | "blue" | "green";
  attendanceRate: number;
  gpa: string;
  feesOutstanding: number;
  feesTotal: number;
};

export type ParentFeeItem = {
  id: string;
  childId: string;
  childName: string;
  label: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: "paid" | "partial" | "overdue" | "pending";
};

export type ParentAttendanceRecord = {
  id: string;
  childId: string;
  childName: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  subject?: string;
};

export type ParentAttendanceAlert = {
  id: string;
  childName: string;
  message: string;
  date: string;
  read: boolean;
};

export const PARENT_CHILDREN: ParentChild[] = [
  {
    id: "child-1",
    name: "Alex Johnson",
    studentId: "STU-2024-118",
    grade: "10",
    className: "10-A",
    avatarTone: "purple",
    attendanceRate: 94,
    gpa: "3.72",
    feesOutstanding: 1200,
    feesTotal: 4650,
  },
  {
    id: "child-2",
    name: "Emma Johnson",
    studentId: "STU-2022-045",
    grade: "12",
    className: "12-B",
    avatarTone: "blue",
    attendanceRate: 97,
    gpa: "3.91",
    feesOutstanding: 0,
    feesTotal: 4200,
  },
];

export const PARENT_FEE_ITEMS: ParentFeeItem[] = [
  { id: "pf1", childId: "child-1", childName: "Alex Johnson", label: "Spring Term Tuition", amount: 3200, paidAmount: 2000, dueDate: "2026-03-15", status: "partial" },
  { id: "pf2", childId: "child-1", childName: "Alex Johnson", label: "Computer Science Lab Fee", amount: 450, paidAmount: 0, dueDate: "2026-03-15", status: "overdue" },
  { id: "pf3", childId: "child-1", childName: "Alex Johnson", label: "Student Activities", amount: 220, paidAmount: 0, dueDate: "2026-04-01", status: "pending" },
  { id: "pf4", childId: "child-2", childName: "Emma Johnson", label: "Spring Term Tuition", amount: 3200, paidAmount: 3200, dueDate: "2026-03-15", status: "paid" },
  { id: "pf5", childId: "child-2", childName: "Emma Johnson", label: "Graduation Fee", amount: 180, paidAmount: 180, dueDate: "2026-05-01", status: "paid" },
];

export const PARENT_ATTENDANCE_RECORDS: ParentAttendanceRecord[] = [
  { id: "pa1", childId: "child-1", childName: "Alex Johnson", date: "2026-03-06", status: "present" },
  { id: "pa2", childId: "child-1", childName: "Alex Johnson", date: "2026-03-05", status: "late", subject: "Mathematics" },
  { id: "pa3", childId: "child-1", childName: "Alex Johnson", date: "2026-03-04", status: "present" },
  { id: "pa4", childId: "child-2", childName: "Emma Johnson", date: "2026-03-06", status: "present" },
  { id: "pa5", childId: "child-2", childName: "Emma Johnson", date: "2026-03-05", status: "present" },
  { id: "pa6", childId: "child-1", childName: "Alex Johnson", date: "2026-02-28", status: "absent" },
];

export const PARENT_ATTENDANCE_ALERTS: ParentAttendanceAlert[] = [
  { id: "al1", childName: "Alex Johnson", message: "Absent on Feb 28 — unexcused absence recorded", date: "2026-02-28", read: false },
  { id: "al2", childName: "Alex Johnson", message: "Late to Mathematics on Mar 5", date: "2026-03-05", read: true },
];

export const PARENT_DASHBOARD_STATS = [
  { id: "children", label: "Children", value: "2", hint: "Linked accounts", tone: "purple" as const },
  { id: "fees", label: "Fees due", value: "$1,670", hint: "Outstanding balance", tone: "orange" as const },
  { id: "attendance", label: "Avg attendance", value: "95%", hint: "This term", tone: "green" as const },
  { id: "messages", label: "Unread messages", value: "3", hint: "From school", tone: "blue" as const },
];

export const FEE_STATUS_STYLES = {
  paid: "bg-green/15 text-green",
  partial: "bg-brand-orange/15 text-brand-orange",
  overdue: "bg-destructive/15 text-destructive",
  pending: "bg-brand-blue/15 text-brand-blue",
} as const;

export const ATTENDANCE_STATUS_STYLES = {
  present: "bg-green/15 text-green",
  absent: "bg-destructive/15 text-destructive",
  late: "bg-brand-orange/15 text-brand-orange",
  excused: "bg-brand-blue/15 text-brand-blue",
} as const;

export function getParentFeeSummary() {
  const outstanding = PARENT_FEE_ITEMS.reduce(
    (sum, item) => sum + Math.max(0, item.amount - item.paidAmount),
    0,
  );
  const overdue = PARENT_FEE_ITEMS.filter((i) => i.status === "overdue").length;
  return { outstanding, overdue, childrenWithBalance: new Set(PARENT_FEE_ITEMS.filter((i) => i.amount > i.paidAmount).map((i) => i.childId)).size };
}

export function getChildAttendanceSummary(childId: string) {
  const records = PARENT_ATTENDANCE_RECORDS.filter((r) => r.childId === childId);
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  return { present, absent, late, total: records.length };
}
