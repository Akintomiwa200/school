import { BookOpen, ClipboardCheck, Clock, FileEdit, School, Users } from "lucide-react";

export const TEACHER_DASHBOARD_STATS = [
  { id: "classes", label: "Classes", value: "4", hint: "Assigned sections", tone: "purple" as const, icon: School },
  { id: "assignments", label: "Assignments", value: "12", hint: "Active tasks", tone: "blue" as const, icon: FileEdit },
  { id: "students", label: "Students", value: "118", hint: "Under your care", tone: "green" as const, icon: Users },
  { id: "sessions", label: "Today's sessions", value: "5", hint: "On timetable", tone: "orange" as const, icon: Clock },
];

export const TEACHER_QUICK_ACTIONS = [
  { href: "/teacher/attendance", label: "Mark attendance", description: "Today's class sessions", icon: ClipboardCheck },
  { href: "/teacher/assignments", label: "Assignments", description: "Create and grade work", icon: FileEdit },
  { href: "/teacher/grades", label: "Gradebook", description: "Record and publish grades", icon: BookOpen },
  { href: "/teacher/timetable", label: "Timetable", description: "Weekly schedule", icon: Clock },
];

export const TEACHER_CLASSES = [
  { id: "class-a", name: "Grade 10-A Mathematics", students: 13, room: "Block B · 204", schedule: "Mon, Wed, Fri" },
  { id: "class-b", name: "Grade 11-B Physics", students: 28, room: "Science Lab · 1", schedule: "Tue, Thu" },
  { id: "class-c", name: "Grade 12-A Advanced Math", students: 30, room: "Block B · 206", schedule: "Mon–Thu" },
];

export const TEACHER_COURSES = [
  { id: "co1", title: "Algebra II", modules: 8, lessons: 24, students: 66, progress: 72 },
  { id: "co2", title: "Physics — Mechanics", modules: 6, lessons: 18, students: 28, progress: 58 },
  { id: "co3", title: "Calculus", modules: 10, lessons: 30, students: 26, progress: 45 },
];

export const TEACHER_ATTENDANCE_SESSIONS = [
  { id: "as1", className: "Grade 10-A", time: "08:00", date: "2026-03-06", marked: true, present: 30, absent: 2 },
  { id: "as2", className: "Grade 9-C", time: "10:00", date: "2026-03-06", marked: false, present: 0, absent: 0 },
  { id: "as3", className: "Grade 11-B", time: "13:00", date: "2026-03-06", marked: false, present: 0, absent: 0 },
];

export const TEACHER_ASSIGNMENTS = [
  { id: "ta1", title: "Quadratic equations worksheet", className: "Grade 10-A", dueDate: "2026-03-10", submitted: 28, total: 32, status: "active" as const },
  { id: "ta2", title: "Lab report — Forces", className: "Grade 11-B", dueDate: "2026-03-08", submitted: 22, total: 28, status: "grading" as const },
  { id: "ta3", title: "Integration practice", className: "Grade 12-A", dueDate: "2026-03-15", submitted: 8, total: 26, status: "active" as const },
];

export const TEACHER_MATERIALS = [
  { id: "m1", name: "Algebra II — Unit 4 slides", type: "PDF", size: "2.4 MB", sharedWith: "Grade 10-A", uploaded: "2026-03-01" },
  { id: "m2", name: "Physics lab safety guide", type: "PDF", size: "890 KB", sharedWith: "Grade 11-B", uploaded: "2026-02-20" },
  { id: "m3", name: "Calculus formula sheet", type: "PDF", size: "1.1 MB", sharedWith: "Grade 12-A", uploaded: "2026-02-15" },
];

export const TEACHER_TIMETABLE = [
  { day: "Monday", periods: [{ time: "08:00", subject: "Grade 10-A Mathematics", room: "B-204", classId: "class-a" }, { time: "10:00", subject: "Grade 11-B Physics", room: "Lab-1", classId: "class-b" }, { time: "14:00", subject: "Grade 12-A Advanced Math", room: "B-206", classId: "class-c" }] },
  { day: "Tuesday", periods: [{ time: "09:00", subject: "Grade 11-B Physics", room: "Lab-1", classId: "class-b" }, { time: "11:00", subject: "Grade 10-A Mathematics", room: "B-204", classId: "class-a" }] },
  { day: "Wednesday", periods: [{ time: "08:00", subject: "Grade 10-A Mathematics", room: "B-204", classId: "class-a" }, { time: "13:00", subject: "Grade 12-A Advanced Math", room: "B-206", classId: "class-c" }] },
];

export const TEACHER_DASHBOARD_CLASSES = [
  { id: "class-a", name: "Class A", students: 13 },
  { id: "class-b", name: "Class B", students: 28 },
  { id: "class-c", name: "Class C", students: 30 },
];

export const TEACHER_CLASS_ROSTER_PREVIEW = [
  { id: "r1", name: "Sabine Klein", initials: "SK", tone: "purple" as const },
  { id: "r2", name: "Dante Podenzana", initials: "DP", tone: "blue" as const },
  { id: "r3", name: "Susan Chan", initials: "SC", tone: "green" as const },
  { id: "r4", name: "Alex Rivera", initials: "AR", tone: "orange" as const },
  { id: "r5", name: "Maya Chen", initials: "MC", tone: "purple" as const },
];

export const TEACHER_CLASS_ROSTER_OVERFLOW = 8;

export const TEACHER_CLASS_SUMMARY = {
  overallScore: 68,
  overallGradeAvg: 71,
  workAssigned: 36,
  workGradeAvg: 38,
};

export type TeacherPerformanceTier = "mastered" | "working" | "attention";

export const TEACHER_PERFORMANCE_SEGMENTS: {
  tier: TeacherPerformanceTier;
  count: number;
  classPercent: number;
  gradeAvg: number;
  studentName: string;
  initials: string;
  avatarTone: "purple" | "blue" | "green" | "orange";
}[] = [
  { tier: "mastered", count: 5, classPercent: 20, gradeAvg: 23, studentName: "Susan Chan", initials: "SC", avatarTone: "green" },
  { tier: "working", count: 10, classPercent: 40, gradeAvg: 50, studentName: "Dante Podenzana", initials: "DP", avatarTone: "blue" },
  { tier: "attention", count: 5, classPercent: 20, gradeAvg: 15, studentName: "Sabine Klein", initials: "SK", avatarTone: "purple" },
];

export type TeacherStudentProficiency = {
  id: string;
  name: string;
  initials: string;
  avatarTone: "purple" | "blue" | "green" | "orange";
  rowTone: TeacherPerformanceTier;
  workCompleted: number;
  workTotal: number;
  averageScore: number;
  needingAttention: number;
  workingTowards: number;
  mastered: number;
};

export const TEACHER_STUDENT_PROFICIENCY: TeacherStudentProficiency[] = [
  {
    id: "sp1",
    name: "Sabine Klein",
    initials: "SK",
    avatarTone: "purple",
    rowTone: "attention",
    workCompleted: 33,
    workTotal: 36,
    averageScore: 23,
    needingAttention: 45,
    workingTowards: 8,
    mastered: 7,
  },
  {
    id: "sp2",
    name: "Dante Podenzana",
    initials: "DP",
    avatarTone: "blue",
    rowTone: "working",
    workCompleted: 31,
    workTotal: 36,
    averageScore: 53,
    needingAttention: 6,
    workingTowards: 35,
    mastered: 19,
  },
  {
    id: "sp3",
    name: "Susan Chan",
    initials: "SC",
    avatarTone: "green",
    rowTone: "mastered",
    workCompleted: 27,
    workTotal: 36,
    averageScore: 82,
    needingAttention: 1,
    workingTowards: 14,
    mastered: 45,
  },
];

export const TEACHER_DASHBOARD_ALERTS = {
  total: 6,
  urgent: 3,
};

export const TEACHER_AVATAR_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple ring-brand-purple/20",
  blue: "bg-brand-blue/15 text-brand-blue ring-brand-blue/20",
  green: "bg-green/15 text-green ring-green/20",
  orange: "bg-brand-orange/15 text-brand-orange ring-brand-orange/20",
} as const;

export const TEACHER_SCORE_BAR_TONES = {
  low: "bg-brand-orange",
  mid: "bg-brand-yellow",
  high: "bg-green",
} as const;

export function getTeacherScoreBarTone(score: number) {
  if (score >= 70) return TEACHER_SCORE_BAR_TONES.high;
  if (score >= 45) return TEACHER_SCORE_BAR_TONES.mid;
  return TEACHER_SCORE_BAR_TONES.low;
}

export const TEACHER_MASTERY_TONES = {
  attention: "bg-brand-orange/15 text-brand-orange",
  working: "bg-brand-blue/15 text-brand-blue",
  mastered: "bg-green/15 text-green",
} as const;

export function buildTeacherCoursesFallback() {
  return {
    classes: TEACHER_CLASSES.map((item) => ({
      id: item.id,
      name: item.name,
      students: item.students,
      room: item.room,
      schedule: item.schedule,
    })),
    courses: TEACHER_COURSES.map((course, index) => ({
      id: course.id,
      title: course.title,
      modules: course.modules,
      lessons: course.lessons,
      students: course.students,
      progress: course.progress,
      classId: TEACHER_CLASSES[index]?.id ?? "class-a",
    })),
  };
}

export function buildTeacherOverviewPerformers() {
  const rankBadges = ["gold", "silver", "bronze", "rose"] as const;
  return [...TEACHER_STUDENT_PROFICIENCY]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 4)
    .map((student, index) => ({
      rank: index + 1,
      id: student.id,
      name: student.name,
      initials: student.initials,
      avatarTone: student.avatarTone,
      classId: "class-a",
      courses: 1,
      assignments: student.workCompleted,
      hours: Math.round(student.workCompleted * 3.6 + 120),
      quiz: Math.min(100, Math.round(student.averageScore * 0.35)),
      points: student.averageScore,
      trend: (index === 0 || index === 2 ? "up" : "down") as "up" | "down",
      badge: rankBadges[index] ?? "default",
    }));
}

export function buildTeacherDashboardFallback(classId = TEACHER_DASHBOARD_CLASSES[0]?.id ?? "class-a") {
  const cls = TEACHER_DASHBOARD_CLASSES.find((item) => item.id === classId);
  return {
    classId,
    className: cls?.name ?? "Class A",
    rosterPreview: TEACHER_CLASS_ROSTER_PREVIEW.map((student) => ({
      id: student.id,
      name: student.name,
      initials: student.initials,
      tone: student.tone,
    })),
    rosterOverflow: TEACHER_CLASS_ROSTER_OVERFLOW,
    summary: TEACHER_CLASS_SUMMARY,
    segments: TEACHER_PERFORMANCE_SEGMENTS,
    proficiency: TEACHER_STUDENT_PROFICIENCY,
    alerts: TEACHER_DASHBOARD_ALERTS,
    assignmentsDue: TEACHER_ASSIGNMENTS.length,
    sessionsToday: TEACHER_ATTENDANCE_SESSIONS.length,
    updatedAt: new Date().toISOString(),
    classes: TEACHER_DASHBOARD_CLASSES.map((item) => {
      const meta = TEACHER_CLASSES.find((entry) => entry.id === item.id);
      return {
        id: item.id,
        name: item.name,
        label: meta?.name ?? item.name,
        students: item.students,
        room: meta?.room ?? "—",
        schedule: meta?.schedule ?? "—",
      };
    }),
  };
}
