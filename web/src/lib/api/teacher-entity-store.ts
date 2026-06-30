import {
  TEACHER_ASSIGNMENTS,
  TEACHER_ATTENDANCE_SESSIONS,
  TEACHER_CLASSES,
  TEACHER_COURSES,
  TEACHER_DASHBOARD_CLASSES,
  TEACHER_MATERIALS,
  TEACHER_STUDENT_PROFICIENCY,
  TEACHER_TIMETABLE,
  type TeacherPerformanceTier,
  type TeacherStudentProficiency,
} from "@/components/dashboard/teacher/teacher-data";

export type TeacherClassRecord = {
  id: string;
  name: string;
  label: string;
  students: number;
  room: string;
  schedule: string;
};

export type TeacherAssignmentStatus = "active" | "grading" | "closed";

export type AssignmentSubmission = {
  studentId: string;
  studentName: string;
  submitted: boolean;
  score: number | null;
  submittedAt: string | null;
};

export type TeacherAssignmentRecord = {
  id: string;
  title: string;
  classId: string;
  className: string;
  dueDate: string;
  total: number;
  submitted: number;
  status: TeacherAssignmentStatus;
  description?: string;
  maxScore: number;
  submissions: AssignmentSubmission[];
  createdAt: string;
};

export type TeacherAttendanceRecord = {
  id: string;
  classId: string;
  className: string;
  time: string;
  date: string;
  marked: boolean;
  present: number;
  absent: number;
};

export type TeacherMaterialRecord = {
  id: string;
  name: string;
  type: string;
  size: string;
  classId: string;
  sharedWith: string;
  uploaded: string;
  sharedClasses: string[];
};

export type AttendanceStudentStatus = "present" | "absent" | "late" | "unmarked";

export type AttendanceStudentRecord = {
  studentId: string;
  studentName: string;
  status: AttendanceStudentStatus;
};

export type TeacherAttendanceSessionDetail = TeacherAttendanceRecord & {
  records: AttendanceStudentRecord[];
};

export type TeacherCourseModule = {
  id: string;
  title: string;
  lessons: number;
  order: number;
};

export type TeacherCourseRecord = {
  id: string;
  title: string;
  classId: string;
  className: string;
  modules: TeacherCourseModule[];
  lessons: number;
  students: number;
  progress: number;
};

export type GradePublication = {
  classId: string;
  term: string;
  publishedAt: string;
};

export type TeacherStudentRecord = TeacherStudentProficiency & {
  classId: string;
  studentId: string;
};

export type TeacherDashboardSummary = {
  overallScore: number;
  overallGradeAvg: number;
  workAssigned: number;
  workGradeAvg: number;
};

export type TeacherPerformanceSegment = {
  tier: TeacherPerformanceTier;
  count: number;
  classPercent: number;
  gradeAvg: number;
  studentName: string;
  initials: string;
  avatarTone: TeacherStudentProficiency["avatarTone"];
};

export type TeacherDashboardPayload = {
  classId: string;
  className: string;
  rosterPreview: { id: string; name: string; initials: string; tone: TeacherStudentProficiency["avatarTone"] }[];
  rosterOverflow: number;
  summary: TeacherDashboardSummary;
  segments: TeacherPerformanceSegment[];
  proficiency: TeacherStudentProficiency[];
  alerts: { total: number; urgent: number };
  assignmentsDue: number;
  sessionsToday: number;
  updatedAt: string;
};

const CLASS_ID_MAP: Record<string, string> = {
  "class-a": "tc1",
  "class-b": "tc2",
  "class-c": "tc3",
};

const REVERSE_CLASS_MAP: Record<string, string> = {
  tc1: "class-a",
  tc2: "class-b",
  tc3: "class-c",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeStudentRecord(
  id: string,
  classId: string,
  seed: {
    name: string;
    initials: string;
    avatarTone: TeacherStudentProficiency["avatarTone"];
    averageScore: number;
  },
  studentId: string,
  index: number,
): TeacherStudentRecord {
  const rowTone = tierFromScore(seed.averageScore);
  return {
    id,
    name: seed.name,
    initials: seed.initials,
    avatarTone: seed.avatarTone,
    rowTone,
    classId,
    studentId,
    workCompleted: 20 + (index % 10),
    workTotal: 36,
    averageScore: seed.averageScore,
    needingAttention: rowTone === "attention" ? 15 + index : index % 6,
    workingTowards: rowTone === "working" ? 20 + index : 8 + (index % 4),
    mastered: rowTone === "mastered" ? 25 + index : 6 + (index % 3),
  };
}

export function normalizeClassId(id: string) {
  return REVERSE_CLASS_MAP[id] ?? id;
}

function tierFromScore(score: number): TeacherPerformanceTier {
  if (score >= 70) return "mastered";
  if (score >= 45) return "working";
  return "attention";
}

let classes: TeacherClassRecord[] = TEACHER_DASHBOARD_CLASSES.map((item, index) => {
  const legacy = TEACHER_CLASSES[index];
  return {
    id: item.id,
    name: item.name,
    label: legacy?.name ?? item.name,
    students: item.students,
    room: legacy?.room ?? "—",
    schedule: legacy?.schedule ?? "—",
  };
});

let students: TeacherStudentRecord[] = TEACHER_STUDENT_PROFICIENCY.map((entry, index) => ({
  ...entry,
  classId: "class-a",
  studentId: `STU-2024-${110 + index}`,
}));

const extraClassAStudents = [
  { name: "Alex Rivera", initials: "AR", avatarTone: "orange" as const, averageScore: 61 },
  { name: "Maya Chen", initials: "MC", avatarTone: "purple" as const, averageScore: 74 },
  { name: "Jordan Lee", initials: "JL", avatarTone: "blue" as const, averageScore: 48 },
  { name: "Priya Patel", initials: "PP", avatarTone: "green" as const, averageScore: 88 },
  { name: "Noah Williams", initials: "NW", avatarTone: "orange" as const, averageScore: 39 },
  { name: "Emma Davis", initials: "ED", avatarTone: "purple" as const, averageScore: 67 },
  { name: "Liam O'Brien", initials: "LO", avatarTone: "blue" as const, averageScore: 55 },
  { name: "Chloe Martin", initials: "CM", avatarTone: "green" as const, averageScore: 91 },
  { name: "Ethan Brooks", initials: "EB", avatarTone: "orange" as const, averageScore: 42 },
  { name: "Zoe Kim", initials: "ZK", avatarTone: "purple" as const, averageScore: 58 },
];

for (const [index, seed] of extraClassAStudents.entries()) {
  const rowTone = tierFromScore(seed.averageScore);
  students.push({
    id: `sp${index + 4}`,
    name: seed.name,
    initials: seed.initials,
    avatarTone: seed.avatarTone,
    rowTone,
    classId: "class-a",
    studentId: `STU-2024-${130 + index}`,
    workCompleted: 28 + (index % 6),
    workTotal: 36,
    averageScore: seed.averageScore,
    needingAttention: rowTone === "attention" ? 20 + index : index % 8,
    workingTowards: rowTone === "working" ? 25 + index : 10 + (index % 5),
    mastered: rowTone === "mastered" ? 30 + index : 8 + (index % 4),
  });
}

const classBSeeds = [
  { name: "Marcus Webb", initials: "MW", avatarTone: "blue" as const, averageScore: 72 },
  { name: "Olivia Grant", initials: "OG", avatarTone: "green" as const, averageScore: 81 },
  { name: "Tyler Ross", initials: "TR", avatarTone: "orange" as const, averageScore: 38 },
  { name: "Nina Kapoor", initials: "NK", avatarTone: "purple" as const, averageScore: 55 },
  { name: "James Holt", initials: "JH", avatarTone: "blue" as const, averageScore: 64 },
  { name: "Aria Singh", initials: "AS", avatarTone: "green" as const, averageScore: 89 },
  { name: "Ben Carter", initials: "BC", avatarTone: "orange" as const, averageScore: 41 },
  { name: "Lily Nguyen", initials: "LN", avatarTone: "purple" as const, averageScore: 58 },
];

const classCSeeds = [
  { name: "Chris Park", initials: "CP", avatarTone: "blue" as const, averageScore: 68 },
  { name: "Hannah Reed", initials: "HR", avatarTone: "green" as const, averageScore: 77 },
  { name: "Daniel Moss", initials: "DM", avatarTone: "orange" as const, averageScore: 44 },
  { name: "Ella Stone", initials: "ES", avatarTone: "purple" as const, averageScore: 52 },
  { name: "Ryan Fox", initials: "RF", avatarTone: "blue" as const, averageScore: 71 },
  { name: "Mia Torres", initials: "MT", avatarTone: "green" as const, averageScore: 85 },
  { name: "Kevin Shaw", initials: "KS", avatarTone: "orange" as const, averageScore: 36 },
  { name: "Sophie Lane", initials: "SL", avatarTone: "purple" as const, averageScore: 63 },
];

classBSeeds.forEach((seed, index) => {
  students.push(makeStudentRecord(`sp-b${index + 1}`, "class-b", seed, `STU-2024-${210 + index}`, index));
});

classCSeeds.forEach((seed, index) => {
  students.push(makeStudentRecord(`sp-c${index + 1}`, "class-c", seed, `STU-2024-${230 + index}`, index));
});

classes = classes.map((item) => ({
  ...item,
  students: students.filter((s) => s.classId === item.id).length,
}));

function buildSubmissions(classId: string, className: string, total: number, submitted: number): AssignmentSubmission[] {
  const classStudents = students.filter((s) => s.classId === classId);
  return classStudents.slice(0, total).map((student, index) => ({
    studentId: student.id,
    studentName: student.name,
    submitted: index < submitted,
    score: index < submitted ? Math.min(100, Math.max(0, student.averageScore + (index % 3) * 5 - 5)) : null,
    submittedAt: index < submitted ? `${todayIso()}T${String(8 + index).padStart(2, "0")}:30:00.000Z` : null,
  }));
}

let assignments: TeacherAssignmentRecord[] = TEACHER_ASSIGNMENTS.map((item, index) => {
  const classId = index === 0 ? "class-a" : index === 1 ? "class-b" : "class-c";
  const classStudents = students.filter((s) => s.classId === classId);
  const total = classStudents.length;
  const submitted = Math.min(item.submitted, total);
  return {
    id: item.id,
    title: item.title,
    classId,
    className: item.className,
    dueDate: item.dueDate,
    total,
    submitted,
    status: item.status,
    maxScore: 100,
    description: "Complete all sections and submit before the due date.",
    submissions: buildSubmissions(classId, item.className, total, submitted),
    createdAt: `${todayIso()}T08:00:00.000Z`,
  };
});

let attendanceSessions: TeacherAttendanceRecord[] = TEACHER_ATTENDANCE_SESSIONS.map((item, index) => ({
  id: item.id,
  classId: index === 0 ? "class-a" : index === 1 ? "class-c" : "class-b",
  className: item.className,
  time: item.time,
  date: todayIso(),
  marked: item.marked,
  present: item.present,
  absent: item.absent,
}));

let attendanceRosters: Record<string, AttendanceStudentRecord[]> = {};

function ensureAttendanceRoster(sessionId: string): AttendanceStudentRecord[] {
  const session = attendanceSessions.find((s) => s.id === sessionId);
  if (!session) return [];

  if (!attendanceRosters[sessionId]) {
    const classStudents = students.filter((s) => s.classId === session.classId);
    attendanceRosters[sessionId] = classStudents.map((student, index) => ({
      studentId: student.id,
      studentName: student.name,
      status: session.marked
        ? index < session.present
          ? "present"
          : "absent"
        : "unmarked",
    }));
  }

  return attendanceRosters[sessionId];
}

let materials: TeacherMaterialRecord[] = TEACHER_MATERIALS.map((item, index) => ({
  id: item.id,
  name: item.name,
  type: item.type,
  size: item.size,
  classId: index === 0 ? "class-a" : index === 1 ? "class-b" : "class-c",
  sharedWith: item.sharedWith,
  uploaded: item.uploaded,
  sharedClasses: [index === 0 ? "class-a" : index === 1 ? "class-b" : "class-c"],
}));

let courses: TeacherCourseRecord[] = TEACHER_COURSES.map((item, index) => {
  const classId = index === 0 ? "class-a" : index === 1 ? "class-b" : "class-c";
  const cls = classes.find((c) => c.id === classId);
  const moduleCount = item.modules;
  return {
    id: item.id,
    title: item.title,
    classId,
    className: cls?.label ?? item.title,
    lessons: item.lessons,
    students: students.filter((s) => s.classId === classId).length,
    progress: item.progress,
    modules: Array.from({ length: moduleCount }, (_, moduleIndex) => ({
      id: `${item.id}-m${moduleIndex + 1}`,
      title: `Module ${moduleIndex + 1}`,
      lessons: Math.max(1, Math.round(item.lessons / moduleCount)),
      order: moduleIndex + 1,
    })),
  };
});

let gradePublications: GradePublication[] = [];

type TimetablePeriod = { time: string; subject: string; room: string; classId: string };
type TimetableDay = { day: string; periods: TimetablePeriod[] };

let timetable: TimetableDay[] = TEACHER_TIMETABLE.map((day) => ({
  day: day.day,
  periods: day.periods.map((period) => ({
    time: period.time,
    subject: period.subject,
    room: period.room,
    classId: "classId" in period ? String(period.classId) : "class-a",
  })),
}));

function computeSegments(classId: string): TeacherPerformanceSegment[] {
  const classStudents = students.filter((s) => s.classId === classId);
  const total = classStudents.length || 1;
  const tiers: TeacherPerformanceTier[] = ["mastered", "working", "attention"];

  return tiers.map((tier) => {
    const group = classStudents.filter((s) => s.rowTone === tier);
    const count = group.length;
    const gradeAvg =
      count > 0 ? Math.round(group.reduce((sum, s) => sum + s.averageScore, 0) / count) : 0;
    const lead = group[0];
    return {
      tier,
      count,
      classPercent: Math.round((count / total) * 100),
      gradeAvg,
      studentName: lead?.name ?? "—",
      initials: lead?.initials ?? "—",
      avatarTone: lead?.avatarTone ?? "purple",
    };
  });
}

function computeSummary(classId: string): TeacherDashboardSummary {
  const classStudents = students.filter((s) => s.classId === classId);
  const classAssignments = assignments.filter((a) => a.classId === classId);
  const overallScore =
    classStudents.length > 0
      ? Math.round(classStudents.reduce((sum, s) => sum + s.averageScore, 0) / classStudents.length)
      : 0;
  const workAssigned = classAssignments.reduce((sum, a) => sum + a.total, 0) || 36;
  const workGradeAvg =
    classAssignments.length > 0
      ? Math.round(
          classAssignments.reduce((sum, a) => sum + (a.submitted / Math.max(a.total, 1)) * 100, 0) /
            classAssignments.length,
        )
      : 38;

  return {
    overallScore,
    overallGradeAvg: Math.min(100, overallScore + 3),
    workAssigned,
    workGradeAvg,
  };
}

function syncStudentFromSubmissions(classId: string) {
  const classAssignments = assignments.filter((a) => a.classId === classId);
  const workTotal = classAssignments.length > 0 ? 36 : 36;

  students = students.map((student) => {
    if (student.classId !== classId) return student;

    let completed = 0;
    const scores: number[] = [];
    let attention = 0;
    let working = 0;
    let mastered = 0;

    for (const assignment of classAssignments) {
      const submission = assignment.submissions.find((s) => s.studentId === student.id);
      if (submission?.submitted) {
        completed += 1;
        if (submission.score != null) scores.push(submission.score);
      }
    }

    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : student.averageScore;
    const rowTone = tierFromScore(averageScore);

    for (const assignment of classAssignments) {
      const submission = assignment.submissions.find((s) => s.studentId === student.id);
      if (!submission?.submitted || submission.score == null) continue;
      if (submission.score < 45) attention += 15;
      else if (submission.score < 70) working += 12;
      else mastered += 10;
    }

    if (attention === 0 && working === 0 && mastered === 0) {
      return { ...student, workCompleted: completed, workTotal, averageScore, rowTone };
    }

    return {
      ...student,
      workCompleted: completed || student.workCompleted,
      workTotal,
      averageScore,
      rowTone,
      needingAttention: attention || student.needingAttention,
      workingTowards: working || student.workingTowards,
      mastered: mastered || student.mastered,
    };
  });
}

export function listTeacherClasses() {
  return classes;
}

export function getTeacherClass(classId: string) {
  const normalized = normalizeClassId(classId);
  return classes.find((c) => c.id === normalized) ?? null;
}

export function getTeacherClassDetail(classId: string) {
  const normalized = normalizeClassId(classId);
  const cls = getTeacherClass(normalized);
  if (!cls) return null;

  syncStudentFromSubmissions(normalized);
  const roster = students
    .filter((s) => s.classId === normalized)
    .map(({ classId: _c, ...rest }) => rest);

  return {
    ...cls,
    roster,
    assignments: assignments
      .filter((a) => a.classId === normalized)
      .map((a) => ({ id: a.id, title: a.title, dueDate: a.dueDate, status: a.status, submitted: a.submitted, total: a.total })),
    materials: materials.filter((m) => m.classId === normalized || m.sharedClasses.includes(normalized)),
  };
}

export function listTeacherCourses() {
  return {
    classes: classes.map((item) => ({
      id: item.id,
      name: item.label,
      students: students.filter((s) => s.classId === item.id).length,
      room: item.room,
      schedule: item.schedule,
    })),
    courses: courses.map(({ modules: _m, ...course }) => course),
  };
}

export function getTeacherCourse(courseId: string) {
  return courses.find((c) => c.id === courseId) ?? null;
}

export function createTeacherCourseModule(courseId: string, title: string) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;

  const module: TeacherCourseModule = {
    id: nextId("mod"),
    title: title.trim(),
    lessons: 4,
    order: course.modules.length + 1,
  };

  const updated: TeacherCourseRecord = {
    ...course,
    modules: [...course.modules, module],
    lessons: course.lessons + module.lessons,
  };

  courses = courses.map((c) => (c.id === courseId ? updated : c));
  return updated;
}

export function listTeacherTimetable() {
  return timetable;
}

export function listTeacherStudents(classId?: string) {
  const normalized = classId ? normalizeClassId(classId) : undefined;
  const list = normalized ? students.filter((s) => s.classId === normalized) : students;
  return list.map((student) => ({
    id: student.id,
    name: student.name,
    initials: student.initials,
    avatarTone: student.avatarTone,
    classId: student.classId,
    className: classes.find((c) => c.id === student.classId)?.label ?? student.classId,
    studentId: student.studentId,
    averageScore: student.averageScore,
    workCompleted: student.workCompleted,
    workTotal: student.workTotal,
  }));
}

export function createTeacherAttendanceSession(input: { classId: string; date: string; time: string }) {
  const normalized = normalizeClassId(input.classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  const record: TeacherAttendanceRecord = {
    id: nextId("as"),
    classId: normalized,
    className: cls.label,
    time: input.time,
    date: input.date,
    marked: false,
    present: 0,
    absent: 0,
  };

  attendanceSessions = [record, ...attendanceSessions];
  return {
    ...record,
    rosterSize: students.filter((s) => s.classId === normalized).length,
  };
}

export function getTeacherDashboard(classId: string): TeacherDashboardPayload | null {
  const normalized = normalizeClassId(classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  syncStudentFromSubmissions(normalized);
  const classStudents = students.filter((s) => s.classId === normalized);
  const preview = classStudents.slice(0, 5).map((s) => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    tone: s.avatarTone,
  }));

  const gradingQueue = assignments.filter((a) => a.classId === normalized && a.status === "grading").length;
  const unmarked = attendanceSessions.filter((s) => s.classId === normalized && !s.marked).length;

  return {
    classId: normalized,
    className: cls.name,
    rosterPreview: preview,
    rosterOverflow: Math.max(0, classStudents.length - preview.length),
    summary: computeSummary(normalized),
    segments: computeSegments(normalized),
    proficiency: classStudents.map(({ classId: _c, studentId: _s, ...rest }) => rest),
    alerts: {
      total: gradingQueue + unmarked + assignments.filter((a) => a.classId === normalized && a.status === "active").length,
      urgent: unmarked + gradingQueue,
    },
    assignmentsDue: assignments.filter((a) => a.classId === normalized && a.status !== "closed").length,
    sessionsToday: attendanceSessions.filter((s) => s.classId === normalized && s.date === todayIso()).length,
    updatedAt: new Date().toISOString(),
  };
}

export function listTeacherAssignments(classId?: string) {
  if (!classId) return assignments;
  return assignments.filter((a) => a.classId === classId);
}

export function getTeacherAssignment(assignmentId: string) {
  return assignments.find((a) => a.id === assignmentId) ?? null;
}

export function createTeacherAssignment(input: {
  title: string;
  classId: string;
  dueDate: string;
  description?: string;
  maxScore?: number;
}) {
  const normalized = normalizeClassId(input.classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  const classStudents = students.filter((s) => s.classId === normalized);
  const record: TeacherAssignmentRecord = {
    id: nextId("ta"),
    title: input.title.trim(),
    classId: normalized,
    className: cls.label,
    dueDate: input.dueDate,
    total: classStudents.length,
    submitted: 0,
    status: "active",
    description: input.description?.trim() || undefined,
    maxScore: input.maxScore ?? 100,
    submissions: classStudents.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      submitted: false,
      score: null,
      submittedAt: null,
    })),
    createdAt: new Date().toISOString(),
  };

  assignments = [record, ...assignments];
  syncStudentFromSubmissions(normalized);
  return record;
}

export function updateTeacherAssignment(
  assignmentId: string,
  patch: Partial<Pick<TeacherAssignmentRecord, "title" | "dueDate" | "status" | "description">>,
) {
  const current = assignments.find((a) => a.id === assignmentId);
  if (!current) return null;

  const updated = { ...current, ...patch };
  assignments = assignments.map((a) => (a.id === assignmentId ? updated : a));
  syncStudentFromSubmissions(updated.classId);
  return updated;
}

export function gradeTeacherSubmission(assignmentId: string, studentId: string, score: number) {
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) return null;

  const submissions = assignment.submissions.map((entry) =>
    entry.studentId === studentId
      ? {
          ...entry,
          submitted: true,
          score: Math.min(assignment.maxScore, Math.max(0, score)),
          submittedAt: entry.submittedAt ?? new Date().toISOString(),
        }
      : entry,
  );

  const submitted = submissions.filter((s) => s.submitted).length;
  const allGraded = submissions.every((s) => !s.submitted || s.score != null);
  const status: TeacherAssignmentStatus =
    allGraded && submitted === assignment.total ? "closed" : submitted > 0 ? "grading" : assignment.status;

  const updated = { ...assignment, submissions, submitted, status };
  assignments = assignments.map((a) => (a.id === assignmentId ? updated : a));
  syncStudentFromSubmissions(assignment.classId);
  return updated;
}

export function listTeacherAttendance() {
  return attendanceSessions.map((session) => ({
    ...session,
    rosterSize: students.filter((s) => s.classId === session.classId).length,
  }));
}

export function getTeacherAttendanceSession(sessionId: string): TeacherAttendanceSessionDetail | null {
  const session = attendanceSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  return {
    ...session,
    records: ensureAttendanceRoster(sessionId),
  };
}

export function markTeacherAttendance(sessionId: string, present: number, absent: number) {
  const session = attendanceSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const updated = { ...session, marked: true, present, absent };
  attendanceSessions = attendanceSessions.map((s) => (s.id === sessionId ? updated : s));
  return updated;
}

export function markTeacherAttendanceRecords(
  sessionId: string,
  records: { studentId: string; status: AttendanceStudentStatus }[],
) {
  const session = attendanceSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const roster = ensureAttendanceRoster(sessionId);
  attendanceRosters[sessionId] = roster.map((entry) => {
    const patch = records.find((r) => r.studentId === entry.studentId);
    return patch ? { ...entry, status: patch.status } : entry;
  });

  const present = attendanceRosters[sessionId].filter((r) => r.status === "present" || r.status === "late").length;
  const absent = attendanceRosters[sessionId].filter((r) => r.status === "absent").length;
  const updated = { ...session, marked: true, present, absent };
  attendanceSessions = attendanceSessions.map((s) => (s.id === sessionId ? updated : s));
  return getTeacherAttendanceSession(sessionId);
}

export function listTeacherMaterials(classId?: string) {
  if (!classId) return materials;
  return materials.filter((m) => m.classId === classId);
}

export function addTeacherMaterial(input: {
  name: string;
  type: string;
  size: string;
  classId: string;
}) {
  const normalized = normalizeClassId(input.classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  const record: TeacherMaterialRecord = {
    id: nextId("mat"),
    name: input.name.trim(),
    type: input.type,
    size: input.size,
    classId: normalized,
    sharedWith: cls.label,
    uploaded: todayIso(),
    sharedClasses: [normalized],
  };

  materials = [record, ...materials];
  return record;
}

export function getTeacherMaterial(materialId: string) {
  return materials.find((m) => m.id === materialId) ?? null;
}

export function deleteTeacherMaterial(materialId: string) {
  const existing = materials.find((m) => m.id === materialId);
  if (!existing) return null;
  materials = materials.filter((m) => m.id !== materialId);
  return existing;
}

export function shareTeacherMaterial(materialId: string, classIds: string[]) {
  const material = materials.find((m) => m.id === materialId);
  if (!material) return null;

  const labels = classIds
    .map((id) => classes.find((c) => c.id === normalizeClassId(id))?.label)
    .filter(Boolean) as string[];

  const updated: TeacherMaterialRecord = {
    ...material,
    sharedClasses: Array.from(new Set([...material.sharedClasses, ...classIds.map(normalizeClassId)])),
    sharedWith: labels.length > 0 ? labels.join(", ") : material.sharedWith,
  };

  materials = materials.map((m) => (m.id === materialId ? updated : m));
  return updated;
}

export function getTeacherGradebook(classId: string) {
  const normalized = normalizeClassId(classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  syncStudentFromSubmissions(normalized);
  const classStudents = students.filter((s) => s.classId === normalized);
  const classAssignments = assignments.filter((a) => a.classId === normalized);
  const publication = gradePublications.find((p) => p.classId === normalized) ?? null;

  return {
    classId: normalized,
    className: cls.label,
    published: publication != null,
    publishedAt: publication?.publishedAt,
    term: publication?.term,
    students: classStudents.map((student) => {
      const grades = classAssignments.map((assignment) => {
        const submission = assignment.submissions.find((s) => s.studentId === student.id);
        return {
          assignmentId: assignment.id,
          title: assignment.title,
          score: submission?.score ?? null,
          submitted: submission?.submitted ?? false,
        };
      });
      return {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        averageScore: student.averageScore,
        grades,
      };
    }),
    assignments: classAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      status: a.status,
      maxScore: a.maxScore,
    })),
  };
}

export function publishTeacherGrades(classId: string, term?: string) {
  const normalized = normalizeClassId(classId);
  const cls = classes.find((c) => c.id === normalized);
  if (!cls) return null;

  const record: GradePublication = {
    classId: normalized,
    term: term?.trim() || `Spring ${new Date().getFullYear()}`,
    publishedAt: new Date().toISOString(),
  };

  gradePublications = gradePublications.filter((p) => p.classId !== normalized);
  gradePublications.push(record);
  return record;
}

export function getTeacherStudent(studentId: string) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const cls = classes.find((c) => c.id === student.classId);
  const { classId: _c, ...profile } = student;
  return {
    ...profile,
    classId: student.classId,
    className: cls?.label ?? student.classId,
    assignments: assignments
      .filter((a) => a.classId === student.classId)
      .map((a) => {
        const submission = a.submissions.find((s) => s.studentId === student.id);
        return {
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          score: submission?.score ?? null,
          submitted: submission?.submitted ?? false,
        };
      }),
  };
}

export function getTeacherClassesOverview() {
  const courseCardTones = ["purple", "green", "pink", "orange"] as const;
  const courseCards = courses.map((course, index) => {
    const materialsCount = materials.filter((m) => m.classId === course.classId || m.sharedClasses.includes(course.classId)).length;
    const assignmentCount = assignments.filter((a) => a.classId === course.classId).length;
    return {
      id: course.id,
      classId: course.classId,
      title: course.title,
      students: students.filter((s) => s.classId === course.classId).length,
      modules: course.modules.length,
      lessons: course.lessons,
      materials: materialsCount,
      assignments: assignmentCount,
      progress: course.progress,
      tone: courseCardTones[index % courseCardTones.length],
    };
  });

  const rankBadges = ["gold", "silver", "bronze", "rose"] as const;
  const bestPerformers = [...students]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 4)
    .map((student, index) => ({
      rank: index + 1,
      id: student.id,
      name: student.name,
      initials: student.initials,
      avatarTone: student.avatarTone,
      classId: student.classId,
      courses: Math.max(1, courses.filter((c) => c.classId === student.classId).length),
      assignments: student.workCompleted,
      hours: Math.round(student.workCompleted * 3.6 + 120),
      quiz: Math.min(100, Math.round(student.averageScore * 0.35)),
      points: student.averageScore,
      trend: index === 0 || index === 2 ? ("up" as const) : ("down" as const),
      badge: rankBadges[index] ?? "default",
    }));

  const now = Date.now();
  const assignmentFeed = assignments
    .filter((a) => a.status !== "closed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
    .map((assignment, index) => {
      const feedTones = ["pink", "blue", "green", "yellow"] as const;
      const dueMs = new Date(`${assignment.dueDate}T23:59:59`).getTime();
      const hoursLeft = Math.max(1, Math.round((dueMs - now) / 3_600_000));
      const statusLabel =
        assignment.status === "grading"
          ? `Grading (${assignment.submitted}/${assignment.total})`
          : hoursLeft <= 48
            ? `Pending (${hoursLeft} Hours Remaining)`
            : `Due ${assignment.dueDate}`;

      return {
        id: assignment.id,
        title: assignment.title,
        className: assignment.className,
        status: statusLabel,
        tone: feedTones[index % feedTones.length],
      };
    });

  return {
    courseCards,
    bestPerformers,
    assignments: assignmentFeed,
    classCount: classes.length,
    studentCount: students.length,
  };
}

export function resolveLegacyClassId(id: string) {
  return CLASS_ID_MAP[id] ?? id;
}

export function resolveDashboardClassId(id: string) {
  return REVERSE_CLASS_MAP[id] ?? id;
}
