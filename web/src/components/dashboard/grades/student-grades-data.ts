import { getStudentCourseById, STUDENT_COURSES } from "../courses/student-course-data";

export type GradeAssessmentType = "assignment" | "quiz" | "exam" | "project" | "participation";
export type GradeAssessmentStatus = "graded" | "pending" | "missing" | "excused";
export type GradeTrend = "up" | "down" | "steady";

export type GradeAssessment = {
  id: string;
  courseId: string;
  assignmentId?: string;
  title: string;
  type: GradeAssessmentType;
  score: number | null;
  maxScore: number;
  weight: number;
  date: string;
  status: GradeAssessmentStatus;
  feedback?: string;
  teacherComment?: string;
};

export type CourseGradeSummary = {
  courseId: string;
  termId: string;
  letterGrade: string | null;
  percentage: number | null;
  credits: number;
  rank?: number;
  classAverage?: number;
  trend: GradeTrend;
  teacherComment?: string;
};

export type ReportCard = {
  id: string;
  termName: string;
  termLabel: string;
  schoolYear: string;
  publishedAt: string;
  gpa: number;
  weightedGpa: number;
  honorRoll: boolean;
  principalComment: string;
  courseGrades: CourseGradeSummary[];
  attendanceSummary: { present: number; absent: number; late: number };
};

export type TranscriptTerm = {
  termId: string;
  termName: string;
  schoolYear: string;
  courses: {
    courseId: string;
    courseName: string;
    credits: number;
    letterGrade: string;
    percentage: number | null;
  }[];
  termGpa: number;
};

export const CURRENT_TERM_ID = "spring-2026";
export const CURRENT_TERM_LABEL = "Spring 2026";

export const ASSESSMENT_TYPE_LABELS: Record<GradeAssessmentType, string> = {
  assignment: "Assignment",
  quiz: "Quiz",
  exam: "Exam",
  project: "Project",
  participation: "Participation",
};

export const ASSESSMENT_STATUS_LABELS: Record<GradeAssessmentStatus, string> = {
  graded: "Graded",
  pending: "Pending",
  missing: "Missing",
  excused: "Excused",
};

const COURSE_CREDITS: Record<string, number> = {
  "1": 3,
  "2": 3,
  "3": 4,
  "4": 4,
  "5": 3,
};

const GRADE_ASSESSMENTS: GradeAssessment[] = [
  {
    id: "ga-4-1",
    courseId: "4",
    assignmentId: "4-a1",
    title: "Arrays & Linked Lists Lab",
    type: "assignment",
    score: 18,
    maxScore: 20,
    weight: 10,
    date: "2026-02-10",
    status: "graded",
    feedback: "Strong implementation. Watch edge cases on empty lists.",
    teacherComment: "Prof. David Kim",
  },
  {
    id: "ga-4-2",
    courseId: "4",
    assignmentId: "4-a2",
    title: "Stacks & Queues Problem Set",
    type: "assignment",
    score: 42,
    maxScore: 50,
    weight: 15,
    date: "2026-02-24",
    status: "graded",
    feedback: "Good work on amortized analysis section.",
    teacherComment: "Prof. David Kim",
  },
  {
    id: "ga-4-3",
    courseId: "4",
    title: "Midterm Exam — Data Structures",
    type: "exam",
    score: 84,
    maxScore: 100,
    weight: 25,
    date: "2026-03-05",
    status: "graded",
    feedback: "Solid performance on trees and graphs.",
    teacherComment: "Prof. David Kim",
  },
  {
    id: "ga-4-4",
    courseId: "4",
    assignmentId: "4-a3",
    title: "Graph Algorithms Project",
    type: "project",
    score: null,
    maxScore: 100,
    weight: 20,
    date: "2026-04-15",
    status: "pending",
  },
  {
    id: "ga-4-5",
    courseId: "4",
    title: "Class participation",
    type: "participation",
    score: 9,
    maxScore: 10,
    weight: 5,
    date: "2026-03-20",
    status: "graded",
    teacherComment: "Consistent engagement in discussions.",
  },
  {
    id: "ga-4-6",
    courseId: "4",
    title: "Quiz — Sorting Algorithms",
    type: "quiz",
    score: 17,
    maxScore: 20,
    weight: 10,
    date: "2026-03-18",
    status: "graded",
  },
  {
    id: "ga-5-1",
    courseId: "5",
    assignmentId: "5-a1",
    title: "Schema Design Assignment",
    type: "assignment",
    score: 48,
    maxScore: 50,
    weight: 15,
    date: "2025-11-12",
    status: "graded",
    feedback: "Excellent normalization and ER diagram.",
    teacherComment: "Elena Vasquez",
  },
  {
    id: "ga-5-2",
    courseId: "5",
    assignmentId: "5-a2",
    title: "SQL Query Optimization",
    type: "assignment",
    score: 46,
    maxScore: 50,
    weight: 15,
    date: "2025-11-28",
    status: "graded",
    feedback: "Indexes used effectively.",
    teacherComment: "Elena Vasquez",
  },
  {
    id: "ga-5-3",
    courseId: "5",
    title: "Final Exam — Database Systems",
    type: "exam",
    score: 92,
    maxScore: 100,
    weight: 30,
    date: "2025-12-10",
    status: "graded",
    feedback: "Outstanding understanding of transactions and ACID.",
    teacherComment: "Elena Vasquez",
  },
  {
    id: "ga-5-4",
    courseId: "5",
    title: "Capstone Database Project",
    type: "project",
    score: 95,
    maxScore: 100,
    weight: 30,
    date: "2025-12-18",
    status: "graded",
    feedback: "Production-quality schema and documentation.",
    teacherComment: "Elena Vasquez",
  },
  {
    id: "ga-5-5",
    courseId: "5",
    title: "Weekly quizzes (avg)",
    type: "quiz",
    score: 18,
    maxScore: 20,
    weight: 10,
    date: "2025-12-01",
    status: "graded",
  },
  {
    id: "ga-1-1",
    courseId: "1",
    title: "Diagnostic writing sample",
    type: "assignment",
    score: 16,
    maxScore: 20,
    weight: 5,
    date: "2026-04-01",
    status: "graded",
    feedback: "Clear thesis and structure.",
    teacherComment: "Ms. Sarah Chen",
  },
  {
    id: "ga-2-1",
    courseId: "2",
    title: "Design brief draft",
    type: "project",
    score: null,
    maxScore: 50,
    weight: 10,
    date: "2026-04-20",
    status: "pending",
  },
  {
    id: "ga-3-1",
    courseId: "3",
    title: "Market analysis quiz",
    type: "quiz",
    score: 14,
    maxScore: 20,
    weight: 5,
    date: "2026-03-28",
    status: "graded",
  },
];

const COURSE_GRADES: CourseGradeSummary[] = [
  {
    courseId: "4",
    termId: CURRENT_TERM_ID,
    letterGrade: "A-",
    percentage: 88,
    credits: 4,
    rank: 5,
    classAverage: 79,
    trend: "up",
    teacherComment: "Alex shows strong problem-solving skills and participates actively.",
  },
  {
    courseId: "5",
    termId: "fall-2025",
    letterGrade: "A",
    percentage: 94,
    credits: 3,
    rank: 2,
    classAverage: 81,
    trend: "steady",
    teacherComment: "Excellent work throughout the term.",
  },
  {
    courseId: "1",
    termId: CURRENT_TERM_ID,
    letterGrade: null,
    percentage: null,
    credits: 3,
    trend: "steady",
  },
  {
    courseId: "2",
    termId: CURRENT_TERM_ID,
    letterGrade: null,
    percentage: null,
    credits: 3,
    trend: "steady",
  },
  {
    courseId: "3",
    termId: CURRENT_TERM_ID,
    letterGrade: null,
    percentage: 70,
    credits: 4,
    trend: "down",
  },
];

const REPORT_CARDS: ReportCard[] = [
  {
    id: "fall-2025",
    termName: "Fall 2025",
    termLabel: "Term 1",
    schoolYear: "2025–2026",
    publishedAt: "2025-12-20",
    gpa: 3.85,
    weightedGpa: 3.92,
    honorRoll: true,
    principalComment:
      "Alex continues to excel academically. Keep up the excellent work in computer science.",
    courseGrades: COURSE_GRADES.filter((g) => g.courseId === "5"),
    attendanceSummary: { present: 42, absent: 1, late: 2 },
  },
  {
    id: "spring-2025",
    termName: "Spring 2025",
    termLabel: "Term 2",
    schoolYear: "2024–2025",
    publishedAt: "2025-06-15",
    gpa: 3.72,
    weightedGpa: 3.78,
    honorRoll: true,
    principalComment: "A strong finish to the academic year with consistent improvement.",
    courseGrades: [
      {
        courseId: "4",
        termId: "spring-2025",
        letterGrade: "B+",
        percentage: 87,
        credits: 4,
        trend: "up",
      },
    ],
    attendanceSummary: { present: 40, absent: 2, late: 1 },
  },
];

const TRANSCRIPT: TranscriptTerm[] = [
  {
    termId: "spring-2025",
    termName: "Spring 2025",
    schoolYear: "2024–2025",
    termGpa: 3.72,
    courses: [
      {
        courseId: "4",
        courseName: "Algorithms Structures",
        credits: 4,
        letterGrade: "B+",
        percentage: 87,
      },
      {
        courseId: "5",
        courseName: "Database Program",
        credits: 3,
        letterGrade: "A-",
        percentage: 91,
      },
    ],
  },
  {
    termId: "fall-2025",
    termName: "Fall 2025",
    schoolYear: "2025–2026",
    termGpa: 3.85,
    courses: [
      {
        courseId: "5",
        courseName: "Database Program",
        credits: 3,
        letterGrade: "A",
        percentage: 94,
      },
    ],
  },
  {
    termId: CURRENT_TERM_ID,
    termName: CURRENT_TERM_LABEL,
    schoolYear: "2025–2026",
    termGpa: 3.68,
    courses: [
      {
        courseId: "4",
        courseName: "Algorithms Structures",
        credits: 4,
        letterGrade: "A-",
        percentage: 88,
      },
    ],
  },
];

export function courseGradeHref(courseId: string) {
  return `/student/grades/courses/${courseId}`;
}

export function assessmentHref(assessmentId: string) {
  return `/student/grades/assessments/${assessmentId}`;
}

export function reportCardHref(termId: string) {
  return `/student/grades/report-cards/${termId}`;
}

export function parentCourseGradeHref(courseId: string) {
  return `/parent/grades/courses/${courseId}`;
}

export function parentReportCardHref(termId: string) {
  return `/parent/grades/report-cards/${termId}`;
}

export function getAllAssessments() {
  return GRADE_ASSESSMENTS;
}

export function getAssessmentById(id: string) {
  return GRADE_ASSESSMENTS.find((a) => a.id === id);
}

export function getAssessmentsByCourse(courseId: string) {
  return GRADE_ASSESSMENTS.filter((a) => a.courseId === courseId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getCourseGrades(termId = CURRENT_TERM_ID) {
  return COURSE_GRADES.filter((g) => g.termId === termId);
}

export function getCourseGrade(courseId: string, termId = CURRENT_TERM_ID) {
  return COURSE_GRADES.find((g) => g.courseId === courseId && g.termId === termId);
}

export function getReportCards() {
  return REPORT_CARDS.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getReportCardById(id: string) {
  return REPORT_CARDS.find((r) => r.id === id);
}

export function getTranscript() {
  return TRANSCRIPT;
}

export function getCumulativeGpa() {
  const terms = TRANSCRIPT.filter((t) => t.termId !== CURRENT_TERM_ID);
  if (terms.length === 0) return 3.68;
  return terms.reduce((sum, t) => sum + t.termGpa, 0) / terms.length;
}

export function computeRunningPercentage(courseId: string) {
  const assessments = getAssessmentsByCourse(courseId).filter((a) => a.status === "graded");
  if (assessments.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const a of assessments) {
    if (a.score === null) continue;
    const pct = (a.score / a.maxScore) * 100;
    weightedSum += pct * a.weight;
    totalWeight += a.weight;
  }

  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}

export function getGradeStats() {
  const currentGrades = getCourseGrades();
  const graded = currentGrades.filter((g) => g.letterGrade || g.percentage);
  const termGpa = 3.68;
  const cumulativeGpa = getCumulativeGpa();
  const avgScore =
    graded.length > 0
      ? Math.round(
          graded.reduce((sum, g) => sum + (g.percentage ?? computeRunningPercentage(g.courseId) ?? 0), 0) /
            graded.length,
        )
      : 0;

  return {
    termGpa,
    cumulativeGpa,
    averageScore: avgScore,
    coursesGraded: graded.filter((g) => g.letterGrade).length,
    totalCourses: STUDENT_COURSES.length,
    honorRoll: true,
    pendingAssessments: GRADE_ASSESSMENTS.filter((a) => a.status === "pending").length,
  };
}

export function getRecentAssessments(limit = 5) {
  return [...GRADE_ASSESSMENTS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getCourseCredits(courseId: string) {
  return COURSE_CREDITS[courseId] ?? 3;
}

export function getCourseGradeWithMeta(courseId: string, termId = CURRENT_TERM_ID) {
  const course = getStudentCourseById(courseId);
  const grade = getCourseGrade(courseId, termId);
  if (!course) return null;

  return {
    course,
    grade: grade ?? {
      courseId,
      termId,
      letterGrade: course.grade ?? null,
      percentage: computeRunningPercentage(courseId),
      credits: getCourseCredits(courseId),
      trend: "steady" as GradeTrend,
    },
  };
}

export function getGradedCoursesForTerm(termId = CURRENT_TERM_ID) {
  return getCourseGrades(termId)
    .map((g) => getCourseGradeWithMeta(g.courseId, termId))
    .filter(Boolean);
}

export function formatAssessmentScore(assessment: GradeAssessment) {
  if (assessment.status === "pending") return "—";
  if (assessment.score === null) return "—";
  return `${assessment.score}/${assessment.maxScore}`;
}

export function getAssessmentPercentage(assessment: GradeAssessment) {
  if (assessment.score === null) return null;
  return Math.round((assessment.score / assessment.maxScore) * 100);
}

export function getTrendIcon(trend: GradeTrend) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}
