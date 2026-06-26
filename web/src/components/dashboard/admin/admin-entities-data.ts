export type StudentRecord = {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  className: string;
  guardian: string;
  email: string;
  status: "active" | "inactive" | "graduated";
  enrolledDate: string;
  attendance: number;
  avatarTone: "purple" | "blue" | "green" | "orange";
};

export type StaffRole =
  | "Teacher"
  | "HOD"
  | "Accountant"
  | "Librarian"
  | "IT Support"
  | "Administrator"
  | "Non-teaching";

export type StaffRecord = {
  id: string;
  name: string;
  employeeId: string;
  role: StaffRole;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: "active" | "on_leave" | "inactive";
};

export const STAFF_DEPARTMENTS = [
  "Mathematics",
  "Science",
  "English",
  "Finance",
  "Library",
  "Technology",
  "Administration",
  "Social Studies",
] as const;

export const STAFF_ROLES: StaffRole[] = [
  "Teacher",
  "HOD",
  "Accountant",
  "Librarian",
  "IT Support",
  "Administrator",
  "Non-teaching",
];

export type ClassRecord = {
  id: string;
  name: string;
  grade: string;
  section: string;
  homeroomTeacher: string;
  academicYearId?: string;
  students: number;
  capacity: number;
};

export type SubjectRecord = {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  department: string;
  gradeLevels: string[];
  status: "active" | "archived";
  assignedTeacherIds: string[];
};

export const SUBJECT_STATUS_STYLES = {
  active: "bg-green/15 text-green",
  archived: "bg-muted text-muted-foreground",
} as const;

export type TermRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "completed";
};

export type AcademicYearRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  terms: TermRecord[];
  status: "active" | "upcoming" | "archived";
};

export const TERM_STATUS_STYLES = {
  active: "bg-green/15 text-green",
  upcoming: "bg-brand-purple/15 text-brand-purple",
  completed: "bg-muted text-muted-foreground",
} as const;

export type { AdmissionRecord, SchoolType, AdmissionStatus, AdmissionExamSetup } from "@/components/admissions/admissions-workflow-data";
export {
  ADMISSION_STATUS_STYLES,
  ADMISSION_STATUS_LABELS,
} from "@/components/admissions/admissions-workflow-data";
export const ADMIN_STUDENTS: StudentRecord[] = [
  { id: "s1", name: "Alex Johnson", studentId: "STU-2024-118", grade: "10", className: "10-A", guardian: "Maria Johnson", email: "alex.j@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 96, avatarTone: "purple" },
  { id: "s2", name: "Maya Chen", studentId: "STU-2024-042", grade: "11", className: "11-B", guardian: "Wei Chen", email: "maya.c@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 94, avatarTone: "blue" },
  { id: "s3", name: "Jordan Smith", studentId: "STU-2023-201", grade: "12", className: "12-A", guardian: "Pat Smith", email: "jordan.s@school.edu", status: "active", enrolledDate: "2023-09-01", attendance: 91, avatarTone: "green" },
  { id: "s4", name: "Priya Patel", studentId: "STU-2024-089", grade: "9", className: "9-C", guardian: "Raj Patel", email: "priya.p@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 98, avatarTone: "orange" },
  { id: "s5", name: "Sam Wilson", studentId: "STU-2024-156", grade: "10", className: "10-B", guardian: "Lee Wilson", email: "sam.w@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 88, avatarTone: "blue" },
  { id: "s6", name: "Amina Bello", studentId: "STU-2025-012", grade: "8", className: "8-A", guardian: "Hassan Bello", email: "amina.b@school.edu", status: "active", enrolledDate: "2025-01-15", attendance: 97, avatarTone: "purple" },
  { id: "s7", name: "Evelyn Harper", studentId: "PRE43178", grade: "10", className: "10-A", guardian: "Claire Harper", email: "evelyn.h@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 99, avatarTone: "green" },
  { id: "s8", name: "Diana Plenty", studentId: "PRE43179", grade: "11", className: "11-A", guardian: "Mark Plenty", email: "diana.p@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 93, avatarTone: "orange" },
  { id: "s9", name: "Noah Williams", studentId: "STU-2022-044", grade: "12", className: "12-B", guardian: "Emma Williams", email: "noah.w@school.edu", status: "graduated", enrolledDate: "2022-09-01", attendance: 100, avatarTone: "blue" },
  { id: "s10", name: "Zara Khan", studentId: "STU-2024-203", grade: "9", className: "9-A", guardian: "Imran Khan", email: "zara.k@school.edu", status: "inactive", enrolledDate: "2024-09-01", attendance: 72, avatarTone: "purple" },
  { id: "s11", name: "Chidi Eze", studentId: "STU-2025-031", grade: "10", className: "10-C", guardian: "Ngozi Eze", email: "chidi.e@school.edu", status: "active", enrolledDate: "2025-02-01", attendance: 95, avatarTone: "orange" },
  { id: "s12", name: "Liam O'Brien", studentId: "STU-2025-018", grade: "8", className: "8-B", guardian: "Sarah O'Brien", email: "liam.o@school.edu", status: "active", enrolledDate: "2025-01-20", attendance: 90, avatarTone: "green" },
  { id: "s13", name: "Sofia Martinez", studentId: "STU-2024-221", grade: "9", className: "9-B", guardian: "Carlos Martinez", email: "sofia.m@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 92, avatarTone: "blue" },
  { id: "s14", name: "Ethan Brown", studentId: "STU-2024-198", grade: "11", className: "11-C", guardian: "Lisa Brown", email: "ethan.b@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 87, avatarTone: "purple" },
  { id: "s15", name: "Isabella Rossi", studentId: "STU-2023-167", grade: "12", className: "12-C", guardian: "Marco Rossi", email: "isabella.r@school.edu", status: "active", enrolledDate: "2023-09-01", attendance: 94, avatarTone: "orange" },
  { id: "s16", name: "Kwame Asante", studentId: "STU-2025-044", grade: "8", className: "8-C", guardian: "Abena Asante", email: "kwame.a@school.edu", status: "active", enrolledDate: "2025-02-10", attendance: 89, avatarTone: "green" },
  { id: "s17", name: "Hannah Lee", studentId: "STU-2024-175", grade: "10", className: "10-D", guardian: "Jin Lee", email: "hannah.l@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 97, avatarTone: "blue" },
  { id: "s18", name: "Omar Hassan", studentId: "STU-2024-144", grade: "9", className: "9-D", guardian: "Fatima Hassan", email: "omar.h@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 85, avatarTone: "purple" },
  { id: "s19", name: "Emily Davis", studentId: "STU-2022-088", grade: "12", className: "12-D", guardian: "Robert Davis", email: "emily.d@school.edu", status: "graduated", enrolledDate: "2022-09-01", attendance: 100, avatarTone: "orange" },
  { id: "s20", name: "Ryan Cooper", studentId: "STU-2024-132", grade: "11", className: "11-D", guardian: "Karen Cooper", email: "ryan.c@school.edu", status: "inactive", enrolledDate: "2024-09-01", attendance: 68, avatarTone: "green" },
  { id: "s21", name: "Nina Volkov", studentId: "STU-2025-055", grade: "9", className: "9-E", guardian: "Ivan Volkov", email: "nina.v@school.edu", status: "active", enrolledDate: "2025-02-15", attendance: 91, avatarTone: "blue" },
  { id: "s22", name: "James Okonkwo", studentId: "STU-2024-211", grade: "10", className: "10-E", guardian: "Ada Okonkwo", email: "james.o@school.edu", status: "active", enrolledDate: "2024-09-01", attendance: 93, avatarTone: "purple" },
];

export const ADMIN_STUDENT_GRADES = ["8", "9", "10", "11", "12"] as const;

export const ADMIN_STAFF: StaffRecord[] = [
  { id: "st1", name: "Mr. Adeyemi", employeeId: "EMP-1042", role: "Teacher", designation: "Senior Mathematics Teacher", department: "Mathematics", email: "adeyemi@school.edu", phone: "+234 801 111 1042", joiningDate: "2019-09-01", status: "active" },
  { id: "st2", name: "Ms. Okafor", employeeId: "EMP-1088", role: "Teacher", designation: "Biology Teacher", department: "Science", email: "okafor@school.edu", phone: "+234 802 222 1088", joiningDate: "2020-01-15", status: "active" },
  { id: "st3", name: "Dr. Mensah", employeeId: "EMP-0912", role: "HOD", designation: "Head of English Department", department: "English", email: "mensah@school.edu", phone: "+234 803 333 0912", joiningDate: "2015-08-20", status: "active" },
  { id: "st4", name: "James Okonkwo", employeeId: "EMP-1201", role: "Accountant", designation: "Senior Accountant", department: "Finance", email: "okonkwo@school.edu", phone: "+234 804 444 1201", joiningDate: "2021-03-01", status: "active" },
  { id: "st5", name: "Fatima Yusuf", employeeId: "EMP-1156", role: "Librarian", designation: "Chief Librarian", department: "Library", email: "yusuf@school.edu", phone: "+234 805 555 1156", joiningDate: "2018-11-10", status: "on_leave" },
  { id: "st6", name: "David Kim", employeeId: "EMP-0998", role: "IT Support", designation: "Systems Administrator", department: "Technology", email: "kim@school.edu", phone: "+234 806 666 0998", joiningDate: "2022-06-01", status: "active" },
];

export const ADMIN_CLASSES: ClassRecord[] = [
  { id: "c1", name: "Grade 8-A", grade: "8", section: "A", homeroomTeacher: "Ms. Okafor", academicYearId: "ay1", students: 28, capacity: 32 },
  { id: "c2", name: "Grade 8-B", grade: "8", section: "B", homeroomTeacher: "Mr. Adeyemi", students: 30, capacity: 32 },
  { id: "c3", name: "Grade 8-C", grade: "8", section: "C", homeroomTeacher: "Dr. Mensah", students: 27, capacity: 32 },
  { id: "c4", name: "Grade 8-D", grade: "8", section: "D", homeroomTeacher: "Fatima Yusuf", students: 31, capacity: 32 },
  { id: "c5", name: "Grade 8-E", grade: "8", section: "E", homeroomTeacher: "David Kim", students: 24, capacity: 32 },
  { id: "c6", name: "Grade 9-A", grade: "9", section: "A", homeroomTeacher: "Ms. Okafor", students: 33, capacity: 35 },
  { id: "c7", name: "Grade 9-B", grade: "9", section: "B", homeroomTeacher: "Mr. Adeyemi", students: 32, capacity: 35 },
  { id: "c8", name: "Grade 9-C", grade: "9", section: "C", homeroomTeacher: "Ms. Okafor", students: 34, capacity: 35 },
  { id: "c9", name: "Grade 9-D", grade: "9", section: "D", homeroomTeacher: "Dr. Mensah", students: 29, capacity: 35 },
  { id: "c10", name: "Grade 9-E", grade: "9", section: "E", homeroomTeacher: "David Kim", students: 30, capacity: 35 },
  { id: "c11", name: "Grade 10-A", grade: "10", section: "A", homeroomTeacher: "Mr. Adeyemi", students: 32, capacity: 35 },
  { id: "c12", name: "Grade 10-B", grade: "10", section: "B", homeroomTeacher: "Ms. Okafor", students: 30, capacity: 35 },
  { id: "c13", name: "Grade 10-C", grade: "10", section: "C", homeroomTeacher: "Dr. Mensah", students: 28, capacity: 35 },
  { id: "c14", name: "Grade 10-D", grade: "10", section: "D", homeroomTeacher: "Fatima Yusuf", students: 33, capacity: 35 },
  { id: "c15", name: "Grade 10-E", grade: "10", section: "E", homeroomTeacher: "David Kim", students: 27, capacity: 35 },
  { id: "c16", name: "Grade 11-A", grade: "11", section: "A", homeroomTeacher: "Dr. Mensah", students: 28, capacity: 32 },
  { id: "c17", name: "Grade 11-B", grade: "11", section: "B", homeroomTeacher: "Ms. Okafor", students: 26, capacity: 32 },
  { id: "c18", name: "Grade 11-C", grade: "11", section: "C", homeroomTeacher: "Mr. Adeyemi", students: 30, capacity: 32 },
  { id: "c19", name: "Grade 11-D", grade: "11", section: "D", homeroomTeacher: "David Kim", students: 25, capacity: 32 },
  { id: "c20", name: "Grade 12-A", grade: "12", section: "A", homeroomTeacher: "Mr. Adeyemi", students: 26, capacity: 30 },
  { id: "c21", name: "Grade 12-B", grade: "12", section: "B", homeroomTeacher: "Dr. Mensah", students: 24, capacity: 30 },
  { id: "c22", name: "Grade 12-C", grade: "12", section: "C", homeroomTeacher: "Ms. Okafor", students: 28, capacity: 30 },
  { id: "c23", name: "Grade 12-D", grade: "12", section: "D", homeroomTeacher: "Fatima Yusuf", students: 22, capacity: 30 },
];

export const ADMIN_SUBJECTS: SubjectRecord[] = [
  {
    id: "sub1",
    code: "MATH-101",
    name: "Algebra II",
    description: "Quadratic equations, polynomials, and functions for upper secondary students.",
    credits: 4,
    department: "Mathematics",
    gradeLevels: ["9", "10", "11"],
    status: "active",
    assignedTeacherIds: ["st1"],
  },
  {
    id: "sub2",
    code: "SCI-201",
    name: "Physics",
    description: "Mechanics, waves, and introductory electricity.",
    credits: 4,
    department: "Science",
    gradeLevels: ["10", "11", "12"],
    status: "active",
    assignedTeacherIds: ["st2"],
  },
  {
    id: "sub3",
    code: "ENG-301",
    name: "English Literature",
    description: "Prose, poetry, and drama analysis across classic and modern texts.",
    credits: 3,
    department: "English",
    gradeLevels: ["8", "9", "10", "11", "12"],
    status: "active",
    assignedTeacherIds: ["st3", "st2"],
  },
  {
    id: "sub4",
    code: "CS-401",
    name: "Data Science",
    description: "Statistics, spreadsheets, and introductory data visualization.",
    credits: 4,
    department: "Technology",
    gradeLevels: ["11", "12"],
    status: "active",
    assignedTeacherIds: ["st6"],
  },
  {
    id: "sub5",
    code: "HIS-102",
    name: "World History",
    description: "Global civilizations from the early modern period to the present.",
    credits: 3,
    department: "Social Studies",
    gradeLevels: ["9", "10"],
    status: "active",
    assignedTeacherIds: ["st3"],
  },
  {
    id: "sub6",
    code: "BIO-110",
    name: "Biology",
    description: "Cell structure, genetics, and human physiology.",
    credits: 4,
    department: "Science",
    gradeLevels: ["9", "10"],
    status: "archived",
    assignedTeacherIds: [],
  },
];

export const ADMIN_ACADEMIC_YEARS: AcademicYearRecord[] = [
  {
    id: "ay1",
    name: "2025–2026",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    status: "active",
    terms: [
      { id: "t1-1", name: "Term 1", startDate: "2025-09-01", endDate: "2025-12-20", status: "completed" },
      { id: "t1-2", name: "Term 2", startDate: "2026-01-08", endDate: "2026-03-28", status: "active" },
      { id: "t1-3", name: "Term 3", startDate: "2026-04-14", endDate: "2026-06-30", status: "upcoming" },
    ],
  },
  {
    id: "ay2",
    name: "2024–2025",
    startDate: "2024-09-01",
    endDate: "2025-06-30",
    status: "archived",
    terms: [
      { id: "t2-1", name: "Term 1", startDate: "2024-09-01", endDate: "2024-12-20", status: "completed" },
      { id: "t2-2", name: "Term 2", startDate: "2025-01-08", endDate: "2025-03-28", status: "completed" },
      { id: "t2-3", name: "Term 3", startDate: "2025-04-14", endDate: "2025-06-30", status: "completed" },
    ],
  },
  {
    id: "ay3",
    name: "2026–2027",
    startDate: "2026-09-01",
    endDate: "2027-06-30",
    status: "upcoming",
    terms: [
      { id: "t3-1", name: "Term 1", startDate: "2026-09-01", endDate: "2026-12-18", status: "upcoming" },
      { id: "t3-2", name: "Term 2", startDate: "2027-01-06", endDate: "2027-03-26", status: "upcoming" },
      { id: "t3-3", name: "Term 3", startDate: "2027-04-12", endDate: "2027-06-30", status: "upcoming" },
    ],
  },
];

import type { AdmissionRecord } from "@/components/admissions/admissions-workflow-data";

function normalizeAdmissionSeed(
  partial: Omit<AdmissionRecord, "documents" | "departmentStatus"> & Partial<Pick<AdmissionRecord, "documents" | "departmentStatus">>,
): AdmissionRecord {
  return {
    documents: [],
    departmentStatus: "pending",
    ...partial,
  };
}

export const ADMIN_ADMISSIONS: AdmissionRecord[] = [
  normalizeAdmissionSeed({
    id: "adm1",
    reference: "ADM-2026-0001",
    institutionType: "secondary",
    applicantName: "Amina Bello",
    firstName: "Amina",
    lastName: "Bello",
    email: "amina.bello@example.com",
    phone: "+234 801 234 5678",
    gradeApplied: "Grade 8",
    guardian: "Hassan Bello",
    submittedDate: "2026-03-01",
    status: "exam_scheduled",
    paymentStatus: "paid",
    paymentAmount: 15000,
    paymentReference: "PAY-ADM-0001",
    paidAt: "2026-03-02",
    examStatus: "scheduled",
    examSetup: {
      examDate: "2026-03-20",
      examTime: "09:00",
      venue: "Hall A — Main Campus",
      subjects: ["English", "Mathematics", "General Aptitude"],
      instructions: "Arrive 30 minutes early with this slip and a valid ID.",
    },
  }),
  normalizeAdmissionSeed({
    id: "adm2",
    reference: "ADM-2026-0002",
    institutionType: "secondary",
    applicantName: "Chidi Eze",
    firstName: "Chidi",
    lastName: "Eze",
    email: "chidi.eze@example.com",
    phone: "+234 802 345 6789",
    gradeApplied: "Grade 10",
    guardian: "Ngozi Eze",
    submittedDate: "2026-02-28",
    status: "payment_pending",
    paymentStatus: "pending",
    paymentAmount: 15000,
    examStatus: "not_scheduled",
  }),
  normalizeAdmissionSeed({
    id: "adm3",
    reference: "ADM-2026-0003",
    institutionType: "secondary",
    applicantName: "Liam O'Brien",
    firstName: "Liam",
    lastName: "O'Brien",
    email: "liam.obrien@example.com",
    phone: "+234 803 456 7890",
    gradeApplied: "Grade 6",
    guardian: "Sarah O'Brien",
    submittedDate: "2026-02-25",
    status: "approved",
    paymentStatus: "paid",
    paymentAmount: 15000,
    paymentReference: "PAY-ADM-0003",
    paidAt: "2026-02-26",
    examStatus: "completed",
    examSetup: {
      examDate: "2026-03-05",
      examTime: "10:00",
      venue: "Hall B",
      subjects: ["English", "Mathematics", "General Aptitude"],
    },
    examScore: 78,
    departmentStatus: "approved",
  }),
  normalizeAdmissionSeed({
    id: "adm4",
    reference: "ADM-2026-0004",
    institutionType: "university",
    applicantName: "Zara Khan",
    firstName: "Zara",
    lastName: "Khan",
    email: "zara.khan@example.com",
    phone: "+234 804 567 8901",
    gradeApplied: "BSc Computer Science",
    guardian: "Imran Khan",
    submittedDate: "2026-02-20",
    status: "paid",
    paymentStatus: "paid",
    paymentAmount: 35000,
    paymentReference: "PAY-ADM-0004",
    paidAt: "2026-02-21",
    examStatus: "not_scheduled",
  }),
  normalizeAdmissionSeed({
    id: "adm5",
    reference: "ADM-2026-0005",
    institutionType: "university",
    applicantName: "Noah Williams",
    firstName: "Noah",
    lastName: "Williams",
    email: "noah.williams@example.com",
    phone: "+234 805 678 9012",
    gradeApplied: "BSc Business Administration",
    guardian: "Emma Williams",
    submittedDate: "2026-02-15",
    status: "rejected",
    paymentStatus: "paid",
    paymentAmount: 35000,
    paymentReference: "PAY-ADM-0005",
    paidAt: "2026-02-16",
    examStatus: "completed",
    examSetup: {
      examDate: "2026-02-28",
      examTime: "14:00",
      venue: "Faculty of Management — Room 204",
      subjects: ["English Proficiency", "Program Aptitude", "General Knowledge"],
    },
    examScore: 42,
    reviewNotes: "Did not meet minimum entrance score.",
  }),
  normalizeAdmissionSeed({
    id: "adm6",
    reference: "ADM-2026-0006",
    institutionType: "university",
    applicantName: "Fatima Adeyemi",
    firstName: "Fatima",
    lastName: "Adeyemi",
    email: "fatima.adeyemi@example.com",
    phone: "+234 806 789 0123",
    gradeApplied: "BSc Nursing",
    guardian: "Yusuf Adeyemi",
    submittedDate: "2026-03-08",
    status: "enrolled",
    paymentStatus: "paid",
    paymentAmount: 35000,
    paymentReference: "PAY-ADM-0006",
    paidAt: "2026-03-09",
    examStatus: "completed",
    examSetup: {
      examDate: "2026-03-12",
      examTime: "09:30",
      venue: "Health Sciences Block",
      subjects: ["English Proficiency", "Program Aptitude", "General Knowledge"],
    },
    examScore: 85,
    studentId: "s25",
    enrolledAt: "2026-03-14",
    departmentStatus: "approved",
  }),
  normalizeAdmissionSeed({
    id: "adm7",
    reference: "ADM-2026-0007",
    institutionType: "secondary",
    applicantName: "James Okonkwo Jr",
    firstName: "James",
    lastName: "Okonkwo",
    email: "james.okonkwo@example.com",
    phone: "+234 807 890 1234",
    gradeApplied: "Grade 9",
    guardian: "Ada Okonkwo",
    submittedDate: "2026-03-10",
    status: "payment_pending",
    paymentStatus: "pending",
    paymentAmount: 15000,
    examStatus: "not_scheduled",
  }),
];
export const ADMIN_REPORTS = [
  { id: "r1", name: "Enrollment summary", description: "Students by grade and class", format: "PDF / CSV", lastRun: "2026-03-01" },
  { id: "r2", name: "Staff directory export", description: "All employees with roles", format: "CSV", lastRun: "2026-02-28" },
  { id: "r3", name: "Attendance overview", description: "School-wide attendance rates", format: "PDF", lastRun: "2026-02-25" },
  { id: "r4", name: "Admissions pipeline", description: "Applications by status", format: "PDF / CSV", lastRun: "2026-03-04" },
  { id: "r5", name: "Fee collection", description: "Collections vs outstanding", format: "PDF", lastRun: "2026-03-05" },
];

export const STATUS_STYLES = {
  active: "bg-green/15 text-green",
  inactive: "bg-muted text-muted-foreground",
  graduated: "bg-brand-blue/15 text-brand-blue",
  on_leave: "bg-brand-orange/15 text-brand-orange",
  submitted: "bg-brand-orange/15 text-brand-orange",
  review: "bg-brand-blue/15 text-brand-blue",
  upcoming: "bg-brand-purple/15 text-brand-purple",
  archived: "bg-muted text-muted-foreground",
} as const;
