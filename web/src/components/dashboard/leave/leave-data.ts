export type LeaveType = "annual" | "sick" | "personal" | "emergency";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequest = {
  id: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submittedDate: string;
  reviewedBy?: string;
};

export type LeaveBalance = {
  type: LeaveType;
  label: string;
  total: number;
  used: number;
  remaining: number;
};

export const LEAVE_BALANCES: LeaveBalance[] = [
  { type: "annual", label: "Annual leave", total: 20, used: 8, remaining: 12 },
  { type: "sick", label: "Sick leave", total: 10, used: 2, remaining: 8 },
  { type: "personal", label: "Personal leave", total: 5, used: 1, remaining: 4 },
  { type: "emergency", label: "Emergency leave", total: 3, used: 0, remaining: 3 },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "lv1", type: "sick", from: "2026-03-03", to: "2026-03-05", days: 3, reason: "Medical appointment and recovery", status: "approved", submittedDate: "2026-03-01", reviewedBy: "HR Manager" },
  { id: "lv2", type: "annual", from: "2026-03-20", to: "2026-03-27", days: 8, reason: "Family vacation", status: "pending", submittedDate: "2026-03-04" },
  { id: "lv3", type: "personal", from: "2026-02-10", to: "2026-02-10", days: 1, reason: "Personal errand", status: "approved", submittedDate: "2026-02-08", reviewedBy: "HR Manager" },
];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: "Annual leave",
  sick: "Sick leave",
  personal: "Personal leave",
  emergency: "Emergency leave",
};

export const LEAVE_STATUS_STYLES: Record<LeaveStatus, string> = {
  pending: "bg-brand-orange/15 text-brand-orange",
  approved: "bg-green/15 text-green",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};
