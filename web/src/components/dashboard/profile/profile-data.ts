import { UserRole } from "@/shared";

export type ProfileExtras = {
  phone: string;
  studentId?: string;
  grade?: string;
  className?: string;
  guardian?: string;
  department?: string;
  jobTitle?: string;
  memberSince: string;
};

export type ActiveSession = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type ProfileMetric = {
  id: string;
  label: string;
  value: string;
  tone: "red" | "green" | "purple" | "orange" | "pink";
};

export type LearningSlice = {
  label: string;
  percent: number;
  color: string;
};

export type ProfileTask = {
  id: string;
  title: string;
  time: string;
  href: string;
};

export type ProfilePayment = {
  id: string;
  title: string;
  date: string;
  amount: string;
  tone: "purple" | "blue";
};

const DEFAULT_EXTRAS: ProfileExtras = {
  phone: "+1 (555) 012-3456",
  memberSince: "September 2024",
};

const ROLE_EXTRAS: Partial<Record<UserRole, Partial<ProfileExtras>>> = {
  [UserRole.STUDENT]: {
    studentId: "STU-2024-118",
    grade: "Grade 11",
    className: "11-A",
    guardian: "Maria Johnson",
  },
  [UserRole.PARENT]: {
    jobTitle: "Parent / Guardian",
    guardian: "2 children enrolled",
  },
  [UserRole.TEACHER]: {
    department: "Science Department",
    jobTitle: "Senior Teacher",
  },
  [UserRole.ADMIN]: {
    department: "School Administration",
    jobTitle: "School Admin",
  },
};

export const DEMO_SESSIONS: ActiveSession[] = [
  {
    id: "sess-1",
    device: "Windows · Chrome",
    location: "Lagos, Nigeria",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "sess-2",
    device: "iPhone · Safari",
    location: "Lagos, Nigeria",
    lastActive: "2 days ago",
    current: false,
  },
];

export const STUDENT_PROFILE_METRICS: ProfileMetric[] = [
  { id: "courses", label: "Enrolled courses", value: "10", tone: "red" },
  { id: "lessons", label: "Lessons completed", value: "500", tone: "green" },
  { id: "notifications", label: "Notifications", value: "100", tone: "purple" },
  { id: "purchases", label: "Fee payments", value: "12", tone: "orange" },
  { id: "balance", label: "Account balance", value: "$120", tone: "pink" },
];

export const STUDENT_LEARNING_SLICES: LearningSlice[] = [
  { label: "Reading", percent: 40, color: "#4f8cff" },
  { label: "Video watching", percent: 60, color: "#a855f7" },
  { label: "Writing", percent: 40, color: "#f59e0b" },
  { label: "Assignments", percent: 70, color: "#22c55e" },
];

export const STUDENT_ACTIVITY_HOURS = [
  { month: "Jan", hours: 2 },
  { month: "Feb", hours: 3 },
  { month: "Mar", hours: 4 },
  { month: "Apr", hours: 3.5 },
  { month: "May", hours: 5 },
  { month: "Jun", hours: 4.5 },
  { month: "Jul", hours: 6 },
  { month: "Aug", hours: 5.5 },
  { month: "Sep", hours: 4 },
  { month: "Oct", hours: 5 },
  { month: "Nov", hours: 3.5 },
  { month: "Dec", hours: 4 },
];

export const STUDENT_UPCOMING_TASKS: ProfileTask[] = [
  {
    id: "task-1",
    title: "Biology lab report",
    time: "10:00 AM – 2:00 PM",
    href: "/student/assignments",
  },
  {
    id: "task-2",
    title: "Marketing group project",
    time: "10:00 AM – 2:00 PM",
    href: "/student/assignments",
  },
];

export const STUDENT_PAYMENT_HISTORY: ProfilePayment[] = [
  { id: "pay-1", title: "Term tuition", date: "27 October, 2025", amount: "$120", tone: "purple" },
  { id: "pay-2", title: "Library shop", date: "14 September, 2025", amount: "$60", tone: "blue" },
  { id: "pay-3", title: "Lab fees", date: "02 August, 2025", amount: "$45", tone: "purple" },
  { id: "pay-4", title: "Sports kit", date: "19 June, 2025", amount: "$60", tone: "blue" },
];

export function getProfileExtras(role: UserRole): ProfileExtras {
  return {
    ...DEFAULT_EXTRAS,
    ...ROLE_EXTRAS[role],
  };
}

export function getAccountSummary(role: UserRole, extras: ProfileExtras) {
  if (role === UserRole.STUDENT) {
    return [
      { label: "Student ID", value: extras.studentId ?? "—" },
      { label: "Grade", value: extras.grade ?? "—" },
      { label: "Class", value: extras.className ?? "—" },
      { label: "Guardian", value: extras.guardian ?? "—" },
    ];
  }

  if (role === UserRole.PARENT) {
    return [
      { label: "Account type", value: "Parent / Guardian" },
      { label: "Linked children", value: extras.guardian ?? "—" },
      { label: "Member since", value: extras.memberSince },
    ];
  }

  if (role === UserRole.TEACHER) {
    return [
      { label: "Department", value: extras.department ?? "—" },
      { label: "Role", value: extras.jobTitle ?? "Teacher" },
      { label: "Member since", value: extras.memberSince },
    ];
  }

  return [
    { label: "Role", value: formatRoleFallback(role) },
    { label: "Member since", value: extras.memberSince },
  ];
}

function formatRoleFallback(role: UserRole) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
