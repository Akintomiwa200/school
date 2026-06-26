import {
  Award,
  BookOpen,
  GraduationCap,
  Medal,
  UserRound,
} from "lucide-react";

export const ADMIN_HERO_STATS = [
  { id: "students", label: "Students", value: "15.00K", tone: "purple" as const, icon: GraduationCap },
  { id: "teachers", label: "Teachers", value: "200", tone: "blue" as const, icon: UserRound },
  { id: "awards", label: "Awards", value: "5.6K", tone: "orange" as const, icon: Medal },
];

export const ADMIN_CLASS_ROUTINE_OPTIONS = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  classes: ["Class 06", "Class 07", "Class 08", "Class 09", "Class 10"],
  sections: ["Section A", "Section B", "Section C"],
};

export const ADMIN_PERFORMER_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu"];

export const ADMIN_CLASS_ROUTINE_MONTHS = [
  { id: "oct", label: "October, 2023", tone: "blue" as const },
  { id: "nov", label: "November, 2023", tone: "orange" as const },
];

export type AdminStarStudent = {
  id: string;
  name: string;
  studentId: string;
  marks: number;
  percent: number;
  avatarTone: "purple" | "blue" | "green" | "orange";
};

export const ADMIN_STAR_STUDENTS: AdminStarStudent[] = [
  { id: "s1", name: "Evelyn Harper", studentId: "PRE43178", marks: 1185, percent: 98, avatarTone: "purple" },
  { id: "s2", name: "Diana Plenty", studentId: "PRE43179", marks: 1098, percent: 91, avatarTone: "blue" },
  { id: "s3", name: "John Millar", studentId: "PRE43180", marks: 1105, percent: 92, avatarTone: "green" },
  { id: "s4", name: "Maya Chen", studentId: "PRE43181", marks: 1076, percent: 89, avatarTone: "orange" },
];

export const ADMIN_DASHBOARD_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Emergency School Closure",
    time: "4:00 PM",
    date: "15 Aug",
    tone: "orange" as const,
  },
  {
    id: "n2",
    title: "New Extracurricular Clubs",
    time: "2:30 PM",
    date: "14 Aug",
    tone: "blue" as const,
  },
  {
    id: "n3",
    title: "Sports Day Registration Open",
    time: "10:00 AM",
    date: "12 Aug",
    tone: "green" as const,
  },
  {
    id: "n4",
    title: "Fee Payment Reminder",
    time: "9:00 AM",
    date: "10 Aug",
    tone: "purple" as const,
  },
];

export const ADMIN_LIBRARY_RESOURCES = [
  { id: "lit", subject: "Literature", files: 302, tone: "purple" as const },
  { id: "math", subject: "Mathematics", files: 1872, tone: "blue" as const },
  { id: "eng", subject: "English", files: 575, tone: "orange" as const },
  { id: "sci", subject: "Science", files: 249, tone: "green" as const },
  { id: "hist", subject: "History", files: 418, tone: "pink" as const },
];

export const ADMIN_EXAMS_SUMMARY = {
  total: 256,
  trend: "+80%",
  period: "this month",
};

export type AdminBestPerformer = {
  id: string;
  classLabel: string;
  subject: string;
  percent: number;
  students: string[];
  gradient: string;
};

export const ADMIN_BEST_PERFORMERS: AdminBestPerformer[] = [
  {
    id: "bp1",
    classLabel: "Class 06",
    subject: "Math",
    percent: 80,
    students: ["EH", "DP", "JM"],
    gradient: "from-brand-purple to-primary",
  },
  {
    id: "bp2",
    classLabel: "Class 04",
    subject: "GK",
    percent: 70,
    students: ["MC", "AK"],
    gradient: "from-brand-orange to-brand-yellow",
  },
  {
    id: "bp3",
    classLabel: "Class 03",
    subject: "Science",
    percent: 72,
    students: ["RS", "LT", "NK"],
    gradient: "from-brand-blue to-primary",
  },
  {
    id: "bp4",
    classLabel: "Class 08",
    subject: "English",
    percent: 47,
    students: ["TW", "AB"],
    gradient: "from-destructive/80 to-brand-orange",
  },
];

export const ADMIN_COURSE_STATS = {
  total: 15000,
  segments: [
    { name: "Math", value: 5200, color: "var(--color-brand-orange)" },
    { name: "English", value: 4800, color: "var(--color-brand-purple)" },
    { name: "Chemistry", value: 5000, color: "var(--color-green)" },
  ],
};

export const ADMIN_PROMO = {
  title: "New Course",
  subtitle: "Build your career with API",
  cta: "Enroll Now",
  href: "/admin/subjects",
};

export const AVATAR_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple",
  blue: "bg-brand-blue/15 text-brand-blue",
  green: "bg-green/15 text-green",
  orange: "bg-brand-orange/15 text-brand-orange",
} as const;

export const NOTIFICATION_THUMBS = {
  purple: "from-brand-purple/25 to-brand-purple/10",
  blue: "from-brand-blue/25 to-primary/10",
  green: "from-green/25 to-green/10",
  orange: "from-brand-orange/25 to-brand-orange/10",
} as const;

export const LIBRARY_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple",
  blue: "bg-brand-blue/15 text-brand-blue",
  green: "bg-green/15 text-green",
  orange: "bg-brand-orange/15 text-brand-orange",
  pink: "bg-brand-pink/15 text-brand-pink",
} as const;

// Legacy exports kept for any remaining references
export const ADMIN_DASHBOARD_STATS = ADMIN_HERO_STATS.map((s) => ({
  ...s,
  hint: undefined,
}));

export const ADMIN_QUICK_ACTIONS = [
  { href: "/admin/students", label: "Students", description: "Enroll and manage records", icon: GraduationCap },
  { href: "/admin/staff", label: "Staff", description: "Teachers and employees", icon: UserRound },
  { href: "/admin/classes", label: "Classes", description: "Sections and rosters", icon: Award },
  { href: "/admin/subjects", label: "Subjects", description: "Curriculum catalog", icon: BookOpen },
];

export const ADMIN_RECENT_ACTIVITY = [
  { id: "1", title: "12 students enrolled in Grade 10-A", time: "2 hours ago", tone: "green" as const },
  { id: "2", title: "Admission application from Amina Bello", time: "4 hours ago", tone: "orange" as const },
  { id: "3", title: "Staff profile updated — Mr. Adeyemi", time: "Yesterday", tone: "blue" as const },
  { id: "4", title: "New subject added: Data Science", time: "Yesterday", tone: "purple" as const },
];

export const ADMIN_ADMISSION_PIPELINE = [
  { label: "Submitted", value: 18, color: "bg-brand-orange" },
  { label: "Under review", value: 9, color: "bg-brand-blue" },
  { label: "Approved", value: 24, color: "bg-green" },
  { label: "Rejected", value: 3, color: "bg-destructive" },
];
