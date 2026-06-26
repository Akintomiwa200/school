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
  { id: "tc1", name: "Grade 10-A Mathematics", students: 32, room: "Block B · 204", schedule: "Mon, Wed, Fri" },
  { id: "tc2", name: "Grade 11-B Physics", students: 28, room: "Science Lab · 1", schedule: "Tue, Thu" },
  { id: "tc3", name: "Grade 12-A Advanced Math", students: 26, room: "Block B · 206", schedule: "Mon–Thu" },
  { id: "tc4", name: "Grade 9-C Mathematics", students: 34, room: "Block A · 102", schedule: "Daily" },
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
  { day: "Monday", periods: [{ time: "08:00", subject: "Math 10-A", room: "B-204" }, { time: "10:00", subject: "Math 9-C", room: "A-102" }, { time: "14:00", subject: "Calculus 12-A", room: "B-206" }] },
  { day: "Tuesday", periods: [{ time: "09:00", subject: "Physics 11-B", room: "Lab-1" }, { time: "11:00", subject: "Math 10-A", room: "B-204" }] },
  { day: "Wednesday", periods: [{ time: "08:00", subject: "Math 10-A", room: "B-204" }, { time: "13:00", subject: "Calculus 12-A", room: "B-206" }] },
];
