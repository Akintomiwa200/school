export type SchoolType = "primary" | "secondary" | "university" | "college";

export type InstitutionType = SchoolType;

export type AdmissionDocumentRequirement = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

export type AdmissionScreeningRule = {
  id: string;
  label: string;
  description: string;
};

export type AdmissionExamQuestion = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type AdmissionConfig = {
  schoolType: SchoolType;
  schoolName: string;
  applicationOpen: boolean;
  applicationFee: number;
  currency: "NGN";
  programLabel: string;
  programOptions: string[];
  requiredDocuments: AdmissionDocumentRequirement[];
  screeningRules: AdmissionScreeningRule[];
  examDurationMinutes: number;
  examSubjects: string[];
  examPassingScore: number;
  examQuestionsPerSubject: number;
  departmentName: string;
  enableGoogleAuth: boolean;
  enableAppleAuth: boolean;
  enableRealTimePayment: boolean;
  paymentInstructions: string;
  welcomeMessage: string;
  updatedAt: string;
};

export type UploadedAdmissionDocument = {
  requirementId: string;
  fileName: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
};

export type AdmissionStatus =
  | "submitted"
  | "payment_pending"
  | "paid"
  | "documents_review"
  | "screening_rejected"
  | "exam_eligible"
  | "exam_scheduled"
  | "exam_completed"
  | "results_published"
  | "department_review"
  | "approved"
  | "rejected"
  | "enrolled";

export type AdmissionPaymentStatus = "pending" | "paid" | "waived";

export type AdmissionExamStatus =
  | "not_scheduled"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "waived";

export type AdmissionExamSetup = {
  examDate: string;
  examTime: string;
  venue: string;
  subjects: string[];
  instructions?: string;
  onlineExamEnabled?: boolean;
};

export type AdmissionRecord = {
  id: string;
  reference: string;
  institutionType: SchoolType;
  applicantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gradeApplied: string;
  guardian: string;
  submittedDate: string;
  status: AdmissionStatus;
  paymentStatus: AdmissionPaymentStatus;
  paymentAmount: number;
  paymentReference?: string;
  paidAt?: string;
  documents: UploadedAdmissionDocument[];
  screeningNotes?: string;
  examStatus: AdmissionExamStatus;
  examSetup?: AdmissionExamSetup;
  examScore?: number;
  examStartedAt?: string;
  examSubmittedAt?: string;
  examAnswers?: Record<string, number>;
  departmentStatus: "pending" | "approved" | "rejected";
  departmentNotes?: string;
  studentId?: string;
  enrolledAt?: string;
  reviewNotes?: string;
  authPreference?: "email" | "google" | "apple";
};

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  primary: "Primary school",
  secondary: "Secondary school",
  university: "University",
  college: "College / Polytechnic",
};

export const DEFAULT_PROGRAMS: Record<SchoolType, string[]> = {
  primary: ["Nursery", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"],
  secondary: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  university: [
    "BSc Computer Science",
    "BSc Mathematics",
    "BA English Studies",
    "BSc Business Administration",
    "BSc Nursing",
    "LLB Law",
    "BEng Civil Engineering",
  ],
  college: ["ND Computer Science", "ND Business Admin", "HND Accounting", "ND Engineering"],
};

export const DEFAULT_DOCUMENTS: Record<SchoolType, AdmissionDocumentRequirement[]> = {
  primary: [
    { id: "birth", label: "Birth certificate", description: "Scanned copy or photo", required: true },
    { id: "photo", label: "Passport photograph", description: "Recent passport-sized photo", required: true },
    { id: "report", label: "Previous school report", description: "Latest report card if transferring", required: false },
  ],
  secondary: [
    { id: "birth", label: "Birth certificate", description: "Scanned copy or photo", required: true },
    { id: "photo", label: "Passport photograph", description: "Recent passport-sized photo", required: true },
    { id: "report", label: "Previous school results", description: "Last two terms or promotional exam", required: true },
    { id: "guardian_id", label: "Guardian ID", description: "Valid ID of parent or guardian", required: true },
  ],
  university: [
    { id: "jamb", label: "JAMB result", description: "UTME result slip (PDF or clear photo)", required: true },
    { id: "olevel", label: "O'Level / WAEC / NECO", description: "Minimum 5 credits including English & Mathematics", required: true },
    { id: "birth", label: "Birth certificate / affidavit", description: "Age declaration document", required: true },
    { id: "photo", label: "Passport photograph", description: "White background, recent", required: true },
    { id: "post_utme", label: "Post-UTME registration proof", description: "If applicable for your intake", required: false },
  ],
  college: [
    { id: "olevel", label: "O'Level results", description: "WAEC, NECO, or NABTEB", required: true },
    { id: "birth", label: "Birth certificate", description: "Scanned copy", required: true },
    { id: "photo", label: "Passport photograph", description: "Recent photo", required: true },
  ],
};

export const DEFAULT_SCREENING_RULES: Record<SchoolType, AdmissionScreeningRule[]> = {
  primary: [
    { id: "age", label: "Age appropriate", description: "Applicant meets age requirement for the class applied." },
  ],
  secondary: [
    { id: "credits", label: "5 credits rule", description: "Verify English, Mathematics, and three other relevant credits from uploaded results." },
    { id: "reports", label: "Academic standing", description: "Previous school reports meet minimum performance threshold." },
  ],
  university: [
    { id: "jamb_min", label: "JAMB minimum score", description: "UTME score meets institution cut-off for the chosen program." },
    { id: "olevel_credits", label: "O'Level credits", description: "Five credits including English and Mathematics at not more than two sittings." },
    { id: "program_fit", label: "Program requirements", description: "Subject combination matches the course applied for." },
  ],
  college: [
    { id: "olevel", label: "O'Level minimum", description: "Required credits for ND/HND program including English and Mathematics." },
  ],
};

export const DEFAULT_EXAM_SUBJECTS: Record<SchoolType, string[]> = {
  primary: ["English", "Mathematics"],
  secondary: ["English", "Mathematics", "General Aptitude"],
  university: ["English", "Mathematics", "General Paper", "Subject Aptitude"],
  college: ["English", "Mathematics", "Technical Aptitude"],
};

export function createDefaultAdmissionConfig(schoolType: SchoolType = "university"): AdmissionConfig {
  return {
    schoolType,
    schoolName: "Pathway Academy",
    applicationOpen: true,
    applicationFee: schoolType === "university" ? 35000 : schoolType === "secondary" ? 15000 : 10000,
    currency: "NGN",
    programLabel: schoolType === "university" || schoolType === "college" ? "Program / course" : "Class / grade",
    programOptions: [...DEFAULT_PROGRAMS[schoolType]],
    requiredDocuments: DEFAULT_DOCUMENTS[schoolType].map((d) => ({ ...d })),
    screeningRules: DEFAULT_SCREENING_RULES[schoolType].map((r) => ({ ...r })),
    examDurationMinutes: schoolType === "university" ? 120 : 60,
    examSubjects: [...DEFAULT_EXAM_SUBJECTS[schoolType]],
    examPassingScore: schoolType === "university" ? 50 : 40,
    examQuestionsPerSubject: 10,
    departmentName: "Admissions & Records",
    enableGoogleAuth: true,
    enableAppleAuth: false,
    enableRealTimePayment: true,
    paymentInstructions: "Pay the non-refundable application fee to proceed. Document review begins after payment.",
    welcomeMessage: "Complete your application, upload required documents, pay the fee, and follow the admission timeline.",
    updatedAt: new Date().toISOString(),
  };
}

export const ADMISSION_STATUS_LABELS: Record<AdmissionStatus, string> = {
  submitted: "Submitted",
  payment_pending: "Payment pending",
  paid: "Paid — upload documents",
  documents_review: "Documents under review",
  screening_rejected: "Screening failed",
  exam_eligible: "Eligible for exam",
  exam_scheduled: "Exam scheduled",
  exam_completed: "Exam completed",
  results_published: "Results published",
  department_review: "Department review",
  approved: "Admission approved",
  rejected: "Rejected",
  enrolled: "Enrolled as student",
};

export const ADMISSION_STATUS_STYLES: Record<AdmissionStatus, string> = {
  submitted: "bg-brand-orange/15 text-brand-orange",
  payment_pending: "bg-brand-orange/15 text-brand-orange",
  paid: "bg-brand-blue/15 text-brand-blue",
  documents_review: "bg-brand-purple/15 text-brand-purple",
  screening_rejected: "bg-destructive/15 text-destructive",
  exam_eligible: "bg-green/15 text-green",
  exam_scheduled: "bg-brand-purple/15 text-brand-purple",
  exam_completed: "bg-brand-blue/15 text-brand-blue",
  results_published: "bg-brand-blue/15 text-brand-blue",
  department_review: "bg-brand-orange/15 text-brand-orange",
  approved: "bg-green/15 text-green",
  rejected: "bg-destructive/15 text-destructive",
  enrolled: "bg-green/15 text-green",
};

export function formatAdmissionFee(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function examSubjectsFor(institutionType: SchoolType, config?: AdmissionConfig) {
  return config?.examSubjects ?? DEFAULT_EXAM_SUBJECTS[institutionType];
}

export function parseGradeNumber(gradeApplied: string) {
  const match = gradeApplied.match(/\d+/);
  return match?.[0] ?? "10";
}

export function defaultPasswordFromFirstName(firstName: string) {
  return firstName.trim().toLowerCase();
}

export function buildDemoExamQuestions(config: AdmissionConfig): AdmissionExamQuestion[] {
  const questions: AdmissionExamQuestion[] = [];
  for (const subject of config.examSubjects) {
    for (let i = 1; i <= config.examQuestionsPerSubject; i++) {
      questions.push({
        id: `${subject}-${i}`,
        subject,
        question: `${subject} question ${i}: Select the best answer.`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: i % 4,
      });
    }
  }
  return questions;
}

export function scoreExamAnswers(
  questions: AdmissionExamQuestion[],
  answers: Record<string, number>,
): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) correct += 1;
  }
  return Math.round((correct / questions.length) * 100);
}

// Legacy aliases
export const SECONDARY_GRADES = DEFAULT_PROGRAMS.secondary;
export const UNIVERSITY_PROGRAMS = DEFAULT_PROGRAMS.university;
export const ADMISSION_FEES = {
  secondary: 15000,
  university: 35000,
  primary: 10000,
  college: 20000,
} as const;
