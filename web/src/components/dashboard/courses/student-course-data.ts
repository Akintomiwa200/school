import {
  addDays,
  buildDateTime,
  formatScheduleTimeRange,
  startOfDay,
} from "@/lib/schedule-time";

export type CourseTab = "all" | "active" | "upcoming" | "completed";
export type StudentCourseStatus = Exclude<CourseTab, "all">;

export type CourseIllustration = {
  bg: string;
  accent: string;
  emoji: string;
};

export type StudentCourseListItem = {
  id: string;
  title: string;
  rating: number;
  description: string;
  tags: string[];
  dateValue: string;
  status: StudentCourseStatus;
  illustration: CourseIllustration;
  teacher: string;
  teacherSubject: string;
  totalChapters: number;
  completedChapters: number;
  grade?: string;
  overview: string;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  chapter: number;
  title: string;
  duration: string;
  summary: string;
  content: string;
  completed: boolean;
  locked: boolean;
};

export type CourseAssignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: "pending" | "submitted" | "graded" | "overdue";
  score?: number;
  instructions: string;
};

export type CourseMaterial = {
  id: string;
  courseId: string;
  title: string;
  fileType: string;
  fileSize: string;
};

export type CourseScheduleItem = {
  id: string;
  courseId: string;
  day: number;
  title: string;
  progress: string;
  time: string;
  startsAt: Date;
  endsAt: Date;
};

export type TimetableSlot = {
  id: string;
  courseId: string;
  courseTitle: string;
  dayOfWeek: number;
  startsAt: Date;
  endsAt: Date;
  time: string;
  room: string;
};

export const COURSE_SUB_NAV = [
  { id: "overview", label: "Overview", segment: "" },
  { id: "lessons", label: "Lessons", segment: "lessons" },
  { id: "assignments", label: "Assignments", segment: "assignments" },
  { id: "materials", label: "Materials", segment: "materials" },
] as const;

export const STUDENT_COURSES: StudentCourseListItem[] = [
  {
    id: "1",
    title: "English Lecture",
    rating: 4.5,
    description: "Language lessons with the most popular teachers and overview.",
    tags: ["Languages"],
    dateValue: "20 July",
    status: "upcoming",
    illustration: { bg: "bg-brand-yellow/35", accent: "bg-brand-yellow", emoji: "👩‍🎓" },
    teacher: "Ms. Sarah Chen",
    teacherSubject: "English Literature",
    totalChapters: 20,
    completedChapters: 0,
    overview:
      "Build reading, writing, and communication skills through guided lectures, discussions, and weekly practice tasks.",
  },
  {
    id: "2",
    title: "Design Strategy",
    rating: 4.0,
    description: "Lesson on planning a design concept and proper planning of work.",
    tags: ["UI/UX Design", "Web Design"],
    dateValue: "22 July",
    status: "upcoming",
    illustration: { bg: "bg-brand-blue/30", accent: "bg-brand-blue", emoji: "🧤" },
    teacher: "James Okonkwo",
    teacherSubject: "Product Design",
    totalChapters: 16,
    completedChapters: 0,
    overview:
      "Learn how to research users, frame problems, and deliver design strategies that align product goals with user needs.",
  },
  {
    id: "3",
    title: "Business Lecture",
    rating: 4.2,
    description: "Lectures on how to build your business safely without fear of new projects.",
    tags: ["Marketing", "Finance"],
    dateValue: "26 July",
    status: "upcoming",
    illustration: { bg: "bg-brand-pink/30", accent: "bg-brand-pink", emoji: "👨‍💼" },
    teacher: "Dr. Amira Hassan",
    teacherSubject: "Business Studies",
    totalChapters: 18,
    completedChapters: 0,
    overview:
      "Explore marketing fundamentals, financial planning, and practical frameworks for launching and growing a business.",
  },
  {
    id: "4",
    title: "Algorithms Structures",
    rating: 4.6,
    description: "Study data structures and algorithmic problem solving for computer science.",
    tags: ["Computer Science"],
    dateValue: "10 July",
    status: "active",
    illustration: { bg: "bg-brand-purple/20", accent: "bg-brand-purple", emoji: "⚙️" },
    teacher: "Prof. David Kim",
    teacherSubject: "Computer Science",
    totalChapters: 24,
    completedChapters: 14,
    grade: "A-",
    overview:
      "Master arrays, trees, graphs, and classic algorithms while practicing problem solving for exams and interviews.",
  },
  {
    id: "5",
    title: "Database Program",
    rating: 4.4,
    description: "Design relational databases and write efficient SQL queries.",
    tags: ["Database", "SQL"],
    dateValue: "5 July",
    status: "completed",
    illustration: { bg: "bg-green/25", accent: "bg-green", emoji: "🗄️" },
    teacher: "Elena Vasquez",
    teacherSubject: "Information Systems",
    totalChapters: 15,
    completedChapters: 15,
    grade: "A",
    overview:
      "Design normalized schemas, write efficient queries, and understand transactions, indexing, and database security.",
  },
];

const LESSON_TITLES: Record<string, string[]> = {
  "1": [
    "Introduction to Academic Writing",
    "Grammar Foundations",
    "Reading Comprehension",
    "Essay Structure",
    "Persuasive Writing",
    "Creative Narratives",
    "Poetry Analysis",
    "Research Methods",
    "Citation Styles",
    "Editing and Proofreading",
    "Public Speaking Basics",
    "Debate Techniques",
    "Media Literacy",
    "Cross-cultural Communication",
    "Business Correspondence",
    "Presentation Skills",
    "Critical Reading",
    "Portfolio Review",
    "Exam Preparation",
    "Final Project",
  ],
  "2": [
    "Design Thinking Overview",
    "User Research Basics",
    "Personas and Journeys",
    "Problem Framing",
    "Ideation Workshops",
    "Wireframing",
    "Visual Hierarchy",
    "Design Systems",
    "Prototyping",
    "Usability Testing",
    "Accessibility",
    "Handoff to Development",
    "Portfolio Case Study",
    "Stakeholder Reviews",
    "Design Metrics",
    "Capstone Presentation",
  ],
  "3": [
    "Entrepreneurship Mindset",
    "Market Research",
    "Value Proposition",
    "Business Models",
    "Financial Forecasting",
    "Pricing Strategy",
    "Marketing Channels",
    "Sales Fundamentals",
    "Operations Planning",
    "Legal Basics",
    "Pitch Decks",
    "Funding Options",
    "Growth Metrics",
    "Customer Retention",
    "Risk Management",
    "Team Building",
    "Scaling Strategies",
    "Final Business Plan",
  ],
  "4": [
    "Complexity Basics",
    "Arrays and Linked Lists",
    "Stacks and Queues",
    "Recursion",
    "Sorting Algorithms",
    "Binary Search",
    "Trees",
    "Binary Search Trees",
    "Heaps",
    "Hash Tables",
    "Graph Representations",
    "BFS and DFS",
    "Shortest Paths",
    "Dynamic Programming I",
    "Dynamic Programming II",
    "Greedy Algorithms",
    "String Algorithms",
    "Advanced Trees",
    "Graph Applications",
    "Interview Patterns",
    "System Design Intro",
    "Practice Contest I",
    "Practice Contest II",
    "Final Assessment",
  ],
  "5": [
    "Relational Model",
    "ER Diagrams",
    "Normalization",
    "SQL SELECT",
    "Joins",
    "Aggregations",
    "Subqueries",
    "Indexes",
    "Transactions",
    "Constraints",
    "Views",
    "Stored Procedures",
    "Security",
    "Backup and Recovery",
    "Capstone Database",
  ],
};

function buildLessons(course: StudentCourseListItem): CourseLesson[] {
  const titles = LESSON_TITLES[course.id] ?? [];
  return titles.map((title, index) => {
    const chapter = index + 1;
    const completed = chapter <= course.completedChapters;
    const locked = !completed && chapter > course.completedChapters + 1;

    return {
      id: `${course.id}-l${chapter}`,
      courseId: course.id,
      chapter,
      title,
      duration: `${35 + (index % 4) * 5} min`,
      summary: `Chapter ${chapter} covers core concepts for ${title.toLowerCase()}.`,
      content: `In this lesson you will study ${title.toLowerCase()} through examples, guided practice, and a short recap quiz. Take notes on key vocabulary and complete the checkpoint questions before moving on.`,
      completed,
      locked,
    };
  });
}

const ALL_LESSONS = STUDENT_COURSES.flatMap(buildLessons);

const ASSIGNMENT_SEEDS: Omit<CourseAssignment, "id" | "courseId">[] = [
  {
    title: "Weekly Reflection Essay",
    description: "Write a 500-word reflection on this week's topics.",
    dueDate: "2026-07-18",
    maxScore: 20,
    status: "pending",
    instructions: "Submit a PDF or DOCX file. Include references where applicable.",
  },
  {
    title: "Practice Problem Set",
    description: "Complete the assigned exercises from chapters 12–13.",
    dueDate: "2026-07-12",
    maxScore: 30,
    status: "submitted",
    instructions: "Show your working for each problem. Partial credit is available.",
  },
  {
    title: "Midterm Project",
    description: "Apply course concepts in a structured project brief.",
    dueDate: "2026-06-28",
    maxScore: 50,
    status: "graded",
    score: 44,
    instructions: "Upload your project files and a one-page summary document.",
  },
  {
    title: "Reading Quiz",
    description: "Short quiz on assigned reading materials.",
    dueDate: "2026-07-05",
    maxScore: 10,
    status: "overdue",
    instructions: "Complete the quiz in one sitting. You have 20 minutes.",
  },
];

const ALL_ASSIGNMENTS: CourseAssignment[] = STUDENT_COURSES.flatMap((course, courseIndex) =>
  ASSIGNMENT_SEEDS.map((seed, seedIndex) => ({
    ...seed,
    id: `${course.id}-a${seedIndex + 1}`,
    courseId: course.id,
    title: `${course.title}: ${seed.title}`,
    status:
      course.status === "completed"
        ? "graded"
        : seedIndex === 0
          ? "pending"
          : seed.status,
    score: course.status === "completed" ? seed.maxScore - 2 : seed.score,
  })).slice(0, course.status === "upcoming" ? 1 : 3 + (courseIndex % 2)),
);

const ALL_MATERIALS: CourseMaterial[] = STUDENT_COURSES.flatMap((course) => [
  {
    id: `${course.id}-m1`,
    courseId: course.id,
    title: `${course.title} — Syllabus`,
    fileType: "PDF",
    fileSize: "1.2 MB",
  },
  {
    id: `${course.id}-m2`,
    courseId: course.id,
    title: "Lecture Slides — Week 1",
    fileType: "PPTX",
    fileSize: "4.8 MB",
  },
  {
    id: `${course.id}-m3`,
    courseId: course.id,
    title: "Reference Reading Pack",
    fileType: "ZIP",
    fileSize: "12.4 MB",
  },
]);

function buildScheduleItem(
  id: string,
  courseId: string,
  dayDate: Date,
  title: string,
  progress: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): CourseScheduleItem {
  const startsAt = buildDateTime(dayDate, startHour, startMinute);
  const endsAt = buildDateTime(dayDate, endHour, endMinute);

  return {
    id,
    courseId,
    day: dayDate.getDate(),
    title,
    progress,
    startsAt,
    endsAt,
    time: formatScheduleTimeRange(startsAt, endsAt),
  };
}

export function getCourseScheduleItems(referenceDate = new Date()): CourseScheduleItem[] {
  const today = startOfDay(referenceDate);
  const courseById = Object.fromEntries(STUDENT_COURSES.map((course) => [course.id, course]));

  return [
    buildScheduleItem(
      "s1",
      "1",
      today,
      courseById["1"].title,
      `0 of ${courseById["1"].totalChapters} chapters`,
      15,
      0,
      16,
      30,
    ),
    buildScheduleItem(
      "s2",
      "4",
      today,
      courseById["4"].title,
      `${courseById["4"].completedChapters} of ${courseById["4"].totalChapters} chapters`,
      9,
      0,
      10,
      30,
    ),
    buildScheduleItem(
      "s3",
      "2",
      addDays(today, 1),
      courseById["2"].title,
      `0 of ${courseById["2"].totalChapters} chapters`,
      10,
      0,
      11,
      0,
    ),
    buildScheduleItem(
      "s4",
      "3",
      addDays(today, 1),
      courseById["3"].title,
      `0 of ${courseById["3"].totalChapters} chapters`,
      9,
      0,
      10,
      30,
    ),
    buildScheduleItem(
      "s5",
      "4",
      addDays(today, 2),
      courseById["4"].title,
      `${courseById["4"].completedChapters} of ${courseById["4"].totalChapters} chapters`,
      10,
      0,
      12,
      0,
    ),
  ];
}

export function getTimetableSlots(referenceDate = new Date()): TimetableSlot[] {
  const today = startOfDay(referenceDate);
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = addDays(today, mondayOffset);

  const slots: TimetableSlot[] = [];
  const schedule = getCourseScheduleItems(referenceDate);

  for (const item of schedule) {
    const dayOffset = Math.round(
      (startOfDay(item.startsAt).getTime() - monday.getTime()) / (24 * 60 * 60 * 1000),
    );
    const course = getStudentCourseById(item.courseId);
    if (!course) continue;

    slots.push({
      id: `tt-${item.id}`,
      courseId: item.courseId,
      courseTitle: course.title,
      dayOfWeek: dayOffset,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      time: item.time,
      room: `Room ${100 + Number(item.courseId) * 3}`,
    });
  }

  return slots;
}

export function getStudentCourseById(id: string) {
  return STUDENT_COURSES.find((course) => course.id === id);
}

export function getCourseLessons(courseId: string) {
  return ALL_LESSONS.filter((lesson) => lesson.courseId === courseId);
}

export function getCourseLesson(courseId: string, lessonId: string) {
  const lessons = getCourseLessons(courseId);
  const byId = lessons.find((lesson) => lesson.id === lessonId);
  if (byId) return byId;

  const chapterMatch = lessonId.match(/^(?:chapter-)?(\d+)$/i);
  if (chapterMatch) {
    const chapter = Number(chapterMatch[1]);
    return lessons.find((lesson) => lesson.chapter === chapter);
  }

  return undefined;
}

export function getCourseAssignments(courseId: string) {
  return ALL_ASSIGNMENTS.filter((assignment) => assignment.courseId === courseId);
}

export function getCourseAssignment(courseId: string, assignmentId: string) {
  const assignments = getCourseAssignments(courseId);
  const byId = assignments.find((assignment) => assignment.id === assignmentId);
  if (byId) return byId;

  const shortMatch = assignmentId.match(/^a?(\d+)$/i);
  if (shortMatch) {
    const index = Number(shortMatch[1]);
    return assignments.find((assignment) => assignment.id === `${courseId}-a${index}`);
  }

  return undefined;
}

export function getAllStudentAssignments() {
  return ALL_ASSIGNMENTS;
}

export function getCourseMaterials(courseId: string) {
  return ALL_MATERIALS.filter((material) => material.courseId === courseId);
}

export function getNextLesson(courseId: string) {
  return getCourseLessons(courseId).find((lesson) => !lesson.completed && !lesson.locked);
}

export function getDatePrefix(status: StudentCourseStatus) {
  if (status === "upcoming") return "Start";
  if (status === "completed") return "Taken";
  return "Started";
}

export function courseHref(courseId: string, segment?: string) {
  const base = `/student/courses/${courseId}`;
  return segment ? `${base}/${segment}` : base;
}

export function assignmentStatusLabel(status: CourseAssignment["status"]) {
  const labels = {
    pending: "Due soon",
    submitted: "Submitted",
    graded: "Graded",
    overdue: "Overdue",
  } as const;
  return labels[status];
}

export function assignmentStatusClass(status: CourseAssignment["status"]) {
  const styles = {
    pending: "bg-brand-orange/15 text-brand-orange",
    submitted: "bg-brand-blue/15 text-brand-blue",
    graded: "bg-green/15 text-green",
    overdue: "bg-destructive/15 text-destructive",
  } as const;
  return styles[status];
}
