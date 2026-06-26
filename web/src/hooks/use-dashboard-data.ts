"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/shared/constants";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { createDefaultAdmissionConfig } from "@/components/admissions/admissions-workflow-data";
import type {
  AcademicYearRecord,
  AdmissionRecord,
  ClassRecord,
  StaffRecord,
  StudentRecord,
  SubjectRecord,
} from "@/components/dashboard/admin/admin-entities-data";

export function useApiData<T>(key: string | readonly string[], endpoint: string, fallback: T) {
  const queryKey = Array.isArray(key) ? [...key] : [key];
  return useQuery({
    queryKey,
    queryFn: () => apiGet<T>(endpoint),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useStudentsList<T>(fallback: T) {
  return useApiData<T>(["students", "all"], `${API_ENDPOINTS.STUDENTS}?limit=100`, fallback);
}

export function useStaffList<T>(fallback: T) {
  return useApiData<T>(["staff", "all"], `${API_ENDPOINTS.STAFF}?limit=100`, fallback);
}

export function useClassesList<T>(fallback: T) {
  return useApiData<T>(["classes", "all"], `${API_ENDPOINTS.CLASSES}?limit=100`, fallback);
}

export function useSubjectsList<T>(fallback: T) {
  return useApiData<T>(["subjects", "all"], `${API_ENDPOINTS.SUBJECTS}?limit=100`, fallback);
}

export function useAdmissionsList<T>(fallback: T) {
  return useApiData<T>(["admissions", "all"], `${API_ENDPOINTS.ADMISSIONS}?limit=100`, fallback);
}

export function useReportsList<T>(fallback: T) {
  return useApiData<T>("reports", API_ENDPOINTS.REPORTS, fallback);
}

export function useAcademicYears<T>(fallback: T) {
  return useApiData<T>(["academic-years", "all"], `${API_ENDPOINTS.ACADEMIC_YEARS}?limit=50`, fallback);
}

export function useUsersList<T>(fallback: T) {
  return useApiData<T>("users", API_ENDPOINTS.USERS, fallback);
}

export function useSchoolsList<T>(fallback: T) {
  return useApiData<T>("schools", API_ENDPOINTS.SCHOOLS, fallback);
}

export function useAuditLog<T>(scope: "platform" | "finance", fallback: T) {
  return useApiData<T>(["audit", scope], `${API_ENDPOINTS.AUDIT}?scope=${scope}`, fallback);
}

export function useLeaveData<T>(fallback: T) {
  return useApiData<T>("leave", API_ENDPOINTS.LEAVE, fallback);
}

export function useSupportTickets<T>(fallback: T) {
  return useApiData<T>("support", API_ENDPOINTS.SUPPORT, fallback);
}

export function useParentDashboard<T>(fallback: T) {
  return useApiData<T>("parent", API_ENDPOINTS.PARENT, fallback);
}

export function useHrData<T>(fallback: T) {
  return useApiData<T>("hr", API_ENDPOINTS.HR, fallback);
}

export function useFinanceFees<T>(fallback: T) {
  return useApiData<T>("fees", API_ENDPOINTS.FEES, fallback);
}

export function useFinancePayments<T>(fallback: T) {
  return useApiData<T>("payments", API_ENDPOINTS.PAYMENTS, fallback);
}

export function useFinanceInvoices<T>(fallback: T) {
  return useApiData<T>("invoices", API_ENDPOINTS.INVOICES, fallback);
}

export function useFinanceExpenses<T>(fallback: T) {
  return useApiData<T>("expenses", API_ENDPOINTS.EXPENSES, fallback);
}

export function useFinancePayroll<T>(fallback: T) {
  return useApiData<T>("payroll", API_ENDPOINTS.PAYROLL, fallback);
}

export function useLibraryData<T>(fallback: T) {
  return useApiData<T>(["library", "overview"], API_ENDPOINTS.LIBRARY, fallback);
}

export function useLibraryBooksList<T>(fallback: T) {
  return useApiData<T>(["library", "books"], `${API_ENDPOINTS.LIBRARY_BOOKS}?limit=100`, fallback);
}

export function useLibraryIssuesList<T>(fallback: T) {
  return useApiData<T>(["library", "issues"], `${API_ENDPOINTS.LIBRARY_ISSUES}?limit=100`, fallback);
}

export type LibraryBookWithIssues = import("@/components/dashboard/librarian/librarian-data").LibraryBookRecord & {
  activeIssues: import("@/components/dashboard/librarian/librarian-data").LibraryIssueRecord[];
};

export function useLibraryBook(bookId: string, withIssues = false, fallback?: LibraryBookWithIssues) {
  const suffix = withIssues ? "?issues=1" : "";
  return useQuery({
    queryKey: ["library", "books", bookId, withIssues ? "issues" : "detail"],
    queryFn: () => apiGet<LibraryBookWithIssues>(`${API_ENDPOINTS.LIBRARY_BOOKS}/${bookId}${suffix}`),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useLibraryIssue(issueId: string, fallback?: import("@/components/dashboard/librarian/librarian-data").LibraryIssueRecord) {
  return useQuery({
    queryKey: ["library", "issues", issueId],
    queryFn: () => apiGet<import("@/components/dashboard/librarian/librarian-data").LibraryIssueRecord>(
      `${API_ENDPOINTS.LIBRARY_ISSUES}/${issueId}`,
    ),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useCreateLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost(API_ENDPOINTS.LIBRARY_BOOKS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useUpdateLibraryBook(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPatch(`${API_ENDPOINTS.LIBRARY_BOOKS}/${bookId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useIssueLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost(API_ENDPOINTS.LIBRARY_ISSUES, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useReturnLibraryBook(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPatch(`${API_ENDPOINTS.LIBRARY_ISSUES}/${issueId}`, { action: "return" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useTransportRoutes<T>(fallback: T) {
  return useApiData<T>("transport", API_ENDPOINTS.TRANSPORT, fallback);
}

export function useHostelRooms<T>(fallback: T) {
  return useApiData<T>("hostel", API_ENDPOINTS.HOSTEL, fallback);
}

export function useInventoryItems<T>(fallback: T) {
  return useApiData<T>("inventory", API_ENDPOINTS.INVENTORY, fallback);
}

export function useTeacherAssignments<T>(fallback: T) {
  return useApiData<T>("assignments", API_ENDPOINTS.ASSIGNMENTS, fallback);
}

export function useTeacherCourses<T>(fallback: T) {
  return useApiData<T>("courses", API_ENDPOINTS.COURSES, fallback);
}

export function useTeacherTimetable<T>(fallback: T) {
  return useApiData<T>("timetable", API_ENDPOINTS.TIMETABLE, fallback);
}

export function useTeacherAttendance<T>(fallback: T) {
  return useApiData<T>("attendance", `${API_ENDPOINTS.ATTENDANCE}?scope=teacher`, fallback);
}

export function useStaffAttendance<T>(fallback: T) {
  return useApiData<T>("staff-attendance", `${API_ENDPOINTS.ATTENDANCE}?scope=staff`, fallback);
}

export function useParentAttendance<T>(fallback: T) {
  return useApiData<T>("parent-attendance", `${API_ENDPOINTS.ATTENDANCE}?scope=parent`, fallback);
}

export function useParentFees<T>(fallback: T) {
  return useApiData<T>("parent-fees", `${API_ENDPOINTS.FEES}?scope=parent`, fallback);
}

export function useSubmitLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; from: string; to: string; reason: string }) =>
      apiPost(API_ENDPOINTS.LEAVE, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leave"] }),
  });
}

export function useSubmitSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { subject: string; category: string; priority: string; description: string }) =>
      apiPost(API_ENDPOINTS.SUPPORT, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support"] }),
  });
}

export function useStudent(studentId: string, fallback?: StudentRecord) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: () => apiGet<StudentRecord>(API_ENDPOINTS.STUDENTS_BY_ID(studentId)),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export type ClassWithRoster = ClassRecord & { roster: StudentRecord[] };

export function useClass(classId: string, withRoster = false, fallback?: ClassWithRoster) {
  const suffix = withRoster ? "?roster=1" : "";
  return useQuery({
    queryKey: ["classes", classId, withRoster ? "roster" : "detail"],
    queryFn: () => apiGet<ClassWithRoster>(`${API_ENDPOINTS.CLASSES_BY_ID(classId)}${suffix}`),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useAdmission(admissionId: string, fallback?: AdmissionRecord) {
  return useQuery({
    queryKey: ["admissions", admissionId],
    queryFn: () => apiGet<AdmissionRecord>(`${API_ENDPOINTS.ADMISSIONS}/${admissionId}`),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StudentRecord>) => apiPost<StudentRecord>(API_ENDPOINTS.STUDENTS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateStudent(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StudentRecord>) =>
      apiPatch<StudentRecord>(API_ENDPOINTS.STUDENTS_BY_ID(studentId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export type StaffDetailResponse = StaffRecord & { assignedClasses: ClassRecord[] };

export function useStaff(staffId: string, fallback?: StaffDetailResponse) {
  return useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => apiGet<StaffDetailResponse>(API_ENDPOINTS.STAFF_BY_ID(staffId)),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StaffRecord>) => apiPost<StaffRecord>(API_ENDPOINTS.STAFF, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StaffRecord>) =>
      apiPatch<StaffDetailResponse>(API_ENDPOINTS.STAFF_BY_ID(staffId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export type AcademicYearDetailResponse = AcademicYearRecord & { classCount: number };

export function useAcademicYear(academicYearId: string, fallback?: AcademicYearDetailResponse) {
  return useQuery({
    queryKey: ["academic-years", academicYearId],
    queryFn: () => apiGet<AcademicYearDetailResponse>(API_ENDPOINTS.ACADEMIC_YEARS_BY_ID(academicYearId)),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; startDate: string; endDate: string; termCount?: number }) =>
      apiPost<AcademicYearDetailResponse>(API_ENDPOINTS.ACADEMIC_YEARS, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["academic-years"] }),
  });
}

export function useUpdateAcademicYear(academicYearId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AcademicYearRecord> & {
      action?: "set_current" | "add_term" | "update_term" | "set_active_term";
      term?: { name: string; startDate: string; endDate: string; status?: import("@/components/dashboard/admin/admin-entities-data").TermRecord["status"] };
      termId?: string;
    }) => apiPatch<AcademicYearDetailResponse>(API_ENDPOINTS.ACADEMIC_YEARS_BY_ID(academicYearId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years", academicYearId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export type SubjectDetailResponse = SubjectRecord & {
  assignedTeachers: StaffRecord[];
  teacherCount: number;
};

export function useSubject(subjectId: string, fallback?: SubjectDetailResponse) {
  return useQuery({
    queryKey: ["subjects", subjectId],
    queryFn: () => apiGet<SubjectDetailResponse>(API_ENDPOINTS.SUBJECTS_BY_ID(subjectId)),
    initialData: fallback,
    staleTime: 30_000,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SubjectRecord>) => apiPost<SubjectDetailResponse>(API_ENDPOINTS.SUBJECTS, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject(subjectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SubjectRecord> & {
      action?: "assign_teacher" | "remove_teacher";
      staffId?: string;
    }) => apiPatch<SubjectDetailResponse>(API_ENDPOINTS.SUBJECTS_BY_ID(subjectId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subjects", subjectId] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      grade: string;
      section: string;
      homeroomTeacher: string;
      capacity: number;
      academicYearId?: string;
    }) => apiPost<ClassRecord>(API_ENDPOINTS.CLASSES, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  });
}

export function useUpdateClass(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ClassRecord>) =>
      apiPatch<ClassRecord>(API_ENDPOINTS.CLASSES_BY_ID(classId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["classes", classId] });
    },
  });
}

export function useUpdateAdmission(admissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AdmissionRecord> & {
      action?:
        | "pay"
        | "submit_documents"
        | "vet_document"
        | "pass_screening"
        | "fail_screening"
        | "schedule_exam"
        | "start_exam"
        | "submit_exam"
        | "publish_results"
        | "department_review"
        | "department_approve"
        | "approve"
        | "reject"
        | "add_student"
        | "enroll"
        | "complete_exam";
      documents?: import("@/components/admissions/admissions-workflow-data").UploadedAdmissionDocument[];
      requirementId?: string;
      documentStatus?: "approved" | "rejected";
      reviewNote?: string;
      examSetup?: import("@/components/admissions/admissions-workflow-data").AdmissionExamSetup;
      examScore?: number;
      examAnswers?: Record<string, number>;
      reviewNotes?: string;
      screeningNotes?: string;
      departmentNotes?: string;
      grade?: string;
      className?: string;
    }) =>
      apiPatch<
        | AdmissionRecord
        | {
            admission: AdmissionRecord;
            student: StudentRecord;
            temporaryPassword?: string;
          }
      >(`${API_ENDPOINTS.ADMISSIONS}/${admissionId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admissions", admissionId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      gradeApplied: string;
      guardian: string;
      documents?: import("@/components/admissions/admissions-workflow-data").UploadedAdmissionDocument[];
      authPreference?: "email" | "google" | "apple";
    }) => apiPost<AdmissionRecord>(API_ENDPOINTS.ADMISSIONS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}

export function useAdmissionConfig() {
  return useQuery({
    queryKey: ["admissions", "config"],
    queryFn: () => apiGet<import("@/components/admissions/admissions-workflow-data").AdmissionConfig>(`${API_ENDPOINTS.ADMISSIONS}/config`),
    placeholderData: createDefaultAdmissionConfig(),
    staleTime: 60_000,
  });
}

export function useUpdateAdmissionConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<import("@/components/admissions/admissions-workflow-data").AdmissionConfig> & {
      action?: "reset" | "set_school_type";
      schoolType?: import("@/components/admissions/admissions-workflow-data").SchoolType;
    }) => apiPatch(`${API_ENDPOINTS.ADMISSIONS}/config`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions", "config"] });
    },
  });
}

export function useAdmissionByReference(reference: string, enabled = true) {
  return useQuery({
    queryKey: ["admissions", "reference", reference],
    queryFn: () =>
      apiGet<AdmissionRecord>(`${API_ENDPOINTS.ADMISSIONS}/reference/${encodeURIComponent(reference)}`),
    enabled: enabled && reference.length > 0,
    staleTime: 15_000,
  });
}

export function usePayAdmissionByReference(reference: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPatch<AdmissionRecord>(`${API_ENDPOINTS.ADMISSIONS}/reference/${encodeURIComponent(reference)}`, {
        action: "pay",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions", "reference", reference] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
