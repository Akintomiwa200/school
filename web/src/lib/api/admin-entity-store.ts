import type {
  AdmissionExamSetup,
  AdmissionRecord,
  SchoolType,
  UploadedAdmissionDocument,
} from "@/components/admissions/admissions-workflow-data";
import {
  buildDemoExamQuestions,
  defaultPasswordFromFirstName,
  parseGradeNumber,
  scoreExamAnswers,
} from "@/components/admissions/admissions-workflow-data";
import { getAdmissionConfig } from "@/lib/api/admission-config-store";
import {
  ADMIN_ADMISSIONS,
  ADMIN_CLASSES,
  ADMIN_STUDENTS,
  type ClassRecord,
  type StudentRecord,
} from "@/components/dashboard/admin/admin-entities-data";

const AVATAR_TONES: StudentRecord["avatarTone"][] = ["purple", "blue", "green", "orange"];

let students: StudentRecord[] = [...ADMIN_STUDENTS];
let classes: ClassRecord[] = ADMIN_CLASSES.map((c) => ({
  ...c,
  academicYearId: c.academicYearId ?? "ay1",
}));
let admissions: AdmissionRecord[] = [...ADMIN_ADMISSIONS];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextStudentId() {
  const year = new Date().getFullYear();
  const seq = students.length + 1;
  return `STU-${year}-${String(seq).padStart(3, "0")}`;
}

function nextClassId() {
  return `c${Date.now()}`;
}

function nextAdmissionReference() {
  const seq = admissions.length + 1;
  return `ADM-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
}

export function getMutableStudents() {
  return students;
}

export function getStudentById(id: string) {
  return students.find((s) => s.id === id);
}

export function getStudentsByClass(grade: string, section: string) {
  const className = `${grade}-${section}`;
  return students.filter((s) => s.className === className);
}

export function addStudent(
  input: Omit<StudentRecord, "id" | "studentId" | "avatarTone" | "attendance"> & {
    studentId?: string;
    avatarTone?: StudentRecord["avatarTone"];
    attendance?: number;
  },
): StudentRecord {
  const student: StudentRecord = {
    ...input,
    id: `s${Date.now()}`,
    studentId: input.studentId ?? nextStudentId(),
    avatarTone: input.avatarTone ?? AVATAR_TONES[students.length % AVATAR_TONES.length],
    attendance: input.attendance ?? 100,
  };
  students = [student, ...students];

  const section = input.className.split("-")[1];
  const classRecord = classes.find((c) => c.grade === input.grade && c.section === section);
  if (classRecord) {
    updateClass(classRecord.id, { students: classRecord.students + 1 });
  }

  return student;
}

export function updateStudent(id: string, patch: Partial<StudentRecord>) {
  if (!students.some((s) => s.id === id)) return null;
  students = students.map((s) => (s.id === id ? { ...s, ...patch } : s));
  return students.find((s) => s.id === id) ?? null;
}

export function getMutableClasses() {
  return classes;
}

export function getClassById(id: string) {
  return classes.find((c) => c.id === id);
}

export function addClass(input: {
  grade: string;
  section: string;
  homeroomTeacher: string;
  capacity: number;
  academicYearId?: string;
}): ClassRecord {
  const classRecord: ClassRecord = {
    id: nextClassId(),
    name: `Grade ${input.grade}-${input.section}`,
    grade: input.grade,
    section: input.section,
    homeroomTeacher: input.homeroomTeacher,
    academicYearId: input.academicYearId ?? "ay1",
    students: 0,
    capacity: input.capacity,
  };
  classes = [classRecord, ...classes];
  return classRecord;
}

export function updateClass(id: string, patch: Partial<ClassRecord>) {
  const existing = classes.find((c) => c.id === id);
  if (!existing) return null;
  classes = classes.map((c) => {
    if (c.id !== id) return c;
    const updated = { ...c, ...patch };
    if (patch.grade || patch.section) {
      updated.name = `Grade ${updated.grade}-${updated.section}`;
    }
    return updated;
  });
  return classes.find((c) => c.id === id) ?? null;
}

export function getMutableAdmissions() {
  return admissions;
}

export function getAdmissionById(id: string) {
  return admissions.find((a) => a.id === id);
}

export function getAdmissionByReference(reference: string) {
  return admissions.find((a) => a.reference.toLowerCase() === reference.toLowerCase());
}

export function addAdmission(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gradeApplied: string;
  guardian: string;
  documents?: UploadedAdmissionDocument[];
  authPreference?: AdmissionRecord["authPreference"];
}): AdmissionRecord {
  const config = getAdmissionConfig();
  const admission: AdmissionRecord = {
    id: `adm${Date.now()}`,
    reference: nextAdmissionReference(),
    institutionType: config.schoolType,
    applicantName: `${input.firstName} ${input.lastName}`.trim(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    gradeApplied: input.gradeApplied,
    guardian: input.guardian,
    submittedDate: today(),
    status: "payment_pending",
    paymentStatus: "pending",
    paymentAmount: config.applicationFee,
    documents: input.documents ?? [],
    examStatus: "not_scheduled",
    departmentStatus: "pending",
    authPreference: input.authPreference,
  };
  admissions = [admission, ...admissions];
  return admission;
}

export function updateAdmission(id: string, patch: Partial<AdmissionRecord>) {
  const existing = admissions.find((a) => a.id === id);
  if (!existing) return null;
  admissions = admissions.map((a) => (a.id === id ? { ...a, ...patch } : a));
  return admissions.find((a) => a.id === id) ?? null;
}

export function recordAdmissionPayment(id: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.paymentStatus === "paid") return null;
  const hasDocs = admission.documents.length > 0;
  return updateAdmission(id, {
    paymentStatus: "paid",
    status: hasDocs ? "documents_review" : "paid",
    paymentReference: `PAY-${admission.reference}`,
    paidAt: today(),
  });
}

export function submitAdmissionDocuments(id: string, documents: UploadedAdmissionDocument[]) {
  const admission = getAdmissionById(id);
  if (!admission || admission.paymentStatus !== "paid") return null;
  return updateAdmission(id, {
    documents,
    status: "documents_review",
  });
}

export function vetAdmissionDocument(
  id: string,
  requirementId: string,
  status: "approved" | "rejected",
  reviewNote?: string,
) {
  const admission = getAdmissionById(id);
  if (!admission) return null;
  const documents = admission.documents.map((doc) =>
    doc.requirementId === requirementId ? { ...doc, status, reviewNote } : doc,
  );
  return updateAdmission(id, { documents });
}

export function passAdmissionScreening(id: string, screeningNotes?: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "documents_review") return null;
  const requiredIds = getAdmissionConfig().requiredDocuments.filter((d) => d.required).map((d) => d.id);
  const allApproved = requiredIds.every((reqId) =>
    admission.documents.some((d) => d.requirementId === reqId && d.status === "approved"),
  );
  if (!allApproved) return null;
  return updateAdmission(id, {
    status: "exam_eligible",
    screeningNotes,
  });
}

export function failAdmissionScreening(id: string, screeningNotes?: string) {
  const admission = getAdmissionById(id);
  if (!admission) return null;
  return updateAdmission(id, {
    status: "screening_rejected",
    screeningNotes,
  });
}

export function scheduleAdmissionExam(id: string, setup: AdmissionExamSetup) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "exam_eligible") return null;
  return updateAdmission(id, {
    examSetup: { ...setup, onlineExamEnabled: setup.onlineExamEnabled ?? true },
    examStatus: "scheduled",
    status: "exam_scheduled",
  });
}

export function startOnlineExam(id: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "exam_scheduled") return null;
  return updateAdmission(id, {
    examStatus: "in_progress",
    examStartedAt: new Date().toISOString(),
  });
}

export function submitOnlineExam(id: string, answers: Record<string, number>) {
  const admission = getAdmissionById(id);
  if (!admission || admission.examStatus !== "in_progress" && admission.examStatus !== "scheduled") return null;
  const config = getAdmissionConfig();
  const questions = buildDemoExamQuestions(config);
  const examScore = scoreExamAnswers(questions, answers);
  return updateAdmission(id, {
    examAnswers: answers,
    examScore,
    examStatus: "completed",
    examSubmittedAt: new Date().toISOString(),
    status: "exam_completed",
  });
}

export function publishAdmissionResults(id: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "exam_completed") return null;
  return updateAdmission(id, { status: "results_published" });
}

export function completeAdmissionExam(id: string, examScore: number) {
  const admission = getAdmissionById(id);
  if (!admission) return null;
  return updateAdmission(id, {
    examScore,
    examStatus: "completed",
    status: "exam_completed",
  });
}

export function sendToDepartmentReview(id: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "results_published") return null;
  return updateAdmission(id, { status: "department_review" });
}

export function approveDepartmentAdmission(id: string, departmentNotes?: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "department_review") return null;
  return updateAdmission(id, {
    status: "approved",
    departmentStatus: "approved",
    departmentNotes,
  });
}

export function approveAdmission(id: string, reviewNotes?: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status === "rejected" || admission.status === "enrolled") return null;
  if (admission.status !== "department_review" && admission.status !== "results_published") return null;
  return updateAdmission(id, {
    status: "approved",
    departmentStatus: "approved",
    reviewNotes,
  });
}

export function rejectAdmission(id: string, reviewNotes?: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status === "enrolled") return null;
  return updateAdmission(id, {
    status: "rejected",
    reviewNotes,
  });
}

export function addAdmissionAsStudent(
  id: string,
  input: { grade: string; className: string },
): { admission: AdmissionRecord; student: StudentRecord; temporaryPassword: string } | null {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "approved" || admission.studentId) return null;

  const temporaryPassword = defaultPasswordFromFirstName(admission.firstName);
  const student = addStudent({
    name: admission.applicantName,
    grade: input.grade,
    className: input.className,
    guardian: admission.guardian,
    email: admission.email,
    status: "active",
    enrolledDate: today(),
  });

  const updated = updateAdmission(id, {
    status: "enrolled",
    studentId: student.id,
    enrolledAt: today(),
  });

  if (!updated) return null;
  return { admission: updated, student, temporaryPassword };
}

/** @deprecated Use addAdmissionAsStudent after explicit admin approval */
export function enrollAdmission(id: string) {
  const admission = getAdmissionById(id);
  if (!admission || admission.status !== "approved") return null;
  const grade = parseGradeNumber(admission.gradeApplied);
  const classMatch = classes.find((c) => c.grade === grade);
  const section = classMatch?.section ?? "A";
  return addAdmissionAsStudent(id, { grade, className: `${grade}-${section}` });
}
