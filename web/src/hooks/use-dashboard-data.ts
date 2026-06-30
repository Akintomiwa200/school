"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/shared/constants";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { createDefaultAdmissionConfig } from "@/components/admissions/admissions-workflow-data";
import type {
  TeacherPerformanceTier,
  TeacherStudentProficiency,
} from "@/components/dashboard/teacher/teacher-data";
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
  return useApiData<T>(["audit", scope], `${API_ENDPOINTS.AUDIT}?scope=${scope}&limit=100`, fallback);
}

export function useAuditEvent<T>(auditId: string, fallback: T | undefined) {
  return useQuery({
    queryKey: ["audit", "event", auditId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.AUDIT_BY_ID(auditId)),
    initialData: fallback,
    enabled: auditId.length > 0,
    staleTime: 30_000,
  });
}

export type AuditStats = {
  totalEvents: number;
  eventsThisWeek: number;
  flaggedReconciliation: number;
  reconciliationPeriod: string;
};

export function useAuditStats(fallback: AuditStats) {
  return useApiData<AuditStats>(["audit", "stats"], API_ENDPOINTS.AUDIT_STATS, fallback);
}

export type ReconciliationWorkspace = {
  items: import("@/components/dashboard/accountant/accountant-data").ReconciliationItem[];
  summary: {
    period: string;
    total: number;
    unmatched: number;
    matched: number;
    flagged: number;
    needsReview: number;
  };
  availablePayments: import("@/components/dashboard/accountant/accountant-data").LedgerPayment[];
};

export function useReconciliationWorkspace(fallback: ReconciliationWorkspace) {
  return useApiData<ReconciliationWorkspace>(
    ["audit", "reconciliation"],
    API_ENDPOINTS.AUDIT_RECONCILIATION,
    fallback,
  );
}

export function useReconciliationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; action: "match"; paymentId: string } | { itemId: string; action: "unmatch" } | { itemId: string; action: "flag"; reason: string }) =>
      apiPatch(
        API_ENDPOINTS.AUDIT_RECONCILIATION_ITEM(input.itemId),
        input.action === "match"
          ? { action: "match", paymentId: input.paymentId }
          : input.action === "unmatch"
            ? { action: "unmatch" }
            : { action: "flag", reason: input.reason },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit", "reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["audit", "finance"] });
      queryClient.invalidateQueries({ queryKey: ["audit", "stats"] });
    },
  });
}

export function downloadAuditExport(scope: "finance" | "platform" = "finance") {
  const link = document.createElement("a");
  link.href = `${API_ENDPOINTS.AUDIT_EXPORT}?scope=${scope}`;
  link.download = `audit-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  return useApiData<T>(["expenses"], `${API_ENDPOINTS.EXPENSES}?limit=100`, fallback);
}

export function useFinancePayroll<T>(fallback: T) {
  return useApiData<T>("payroll", API_ENDPOINTS.PAYROLL, fallback);
}

export type PayrollRunDetail = {
  run: import("@/components/dashboard/accountant/accountant-data").PayrollRun;
  payslips: import("@/components/dashboard/accountant/accountant-data").Payslip[];
  summary: {
    staffCount: number;
    totalGross: number;
    totalNet: number;
    pendingCount: number;
    paidCount: number;
  };
  availableStaff: Array<{
    id: string;
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  }>;
};

export function useFinancePayrollRun(runId: string, fallback: PayrollRunDetail) {
  return useQuery({
    queryKey: ["payroll", runId],
    queryFn: () => apiGet<PayrollRunDetail>(API_ENDPOINTS.PAYROLL_BY_ID(runId)),
    placeholderData: fallback,
    staleTime: 30_000,
  });
}

export type FinanceSummary = {
  collected: number;
  outstanding: number;
  expensesMonth: number;
  pendingExpenses: number;
  pendingExpenseTotal: number;
  payrollDue: number;
  activePayrollRunId?: string | null;
  activePayrollPeriod?: string | null;
  overdueInvoices: number;
  paymentCount: number;
  invoiceCount: number;
  expenseCount: number;
};

export function useFinanceSummary(fallback: FinanceSummary) {
  return useApiData<FinanceSummary>(["finance", "summary"], API_ENDPOINTS.FINANCE_SUMMARY, fallback);
}

function invalidateFinanceQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["payments"] });
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  queryClient.invalidateQueries({ queryKey: ["fees"] });
  queryClient.invalidateQueries({ queryKey: ["payroll"] });
  queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
  queryClient.invalidateQueries({ queryKey: ["audit", "finance"] });
  queryClient.invalidateQueries({ queryKey: ["audit", "stats"] });
  queryClient.invalidateQueries({ queryKey: ["audit", "reconciliation"] });
}

export function useExpenseAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { expenseId: string; action: "approve" | "reject" | "mark_paid" }) =>
      apiPatch(API_ENDPOINTS.EXPENSES_BY_ID(input.expenseId), { action: input.action }),
    onSuccess: () => invalidateFinanceQueries(queryClient),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      studentName: string;
      studentId: string;
      description: string;
      amount: number;
      method: string;
      invoiceId?: string;
    }) => apiPost(API_ENDPOINTS.PAYMENTS, body),
    onSuccess: () => invalidateFinanceQueries(queryClient),
  });
}

export function useRecordInvoicePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { invoiceId: string; amount?: number; method?: string }) =>
      apiPatch(API_ENDPOINTS.INVOICES_BY_ID(input.invoiceId), {
        action: "record_payment",
        amount: input.amount,
        method: input.method,
      }),
    onSuccess: () => invalidateFinanceQueries(queryClient),
  });
}

export function useBulkBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost(API_ENDPOINTS.INVOICES, { action: "bulk_billing", term: "Spring 2026" }),
    onSuccess: () => invalidateFinanceQueries(queryClient),
  });
}

export function useCreateFeePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost(API_ENDPOINTS.FEES, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["audit", "finance"] });
    },
  });
}

export function usePayrollAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input:
        | { action: "start"; period: string; notes?: string; duplicateFromRunId?: string }
        | { action: "finalize"; runId: string; finalizedBy?: string; disbursementRef?: string }
        | { action: "activate"; runId: string }
        | { action: "cancel"; runId: string }
        | { action: "delete"; runId: string }
        | { action: "duplicate"; runId: string; period?: string },
    ) => {
      if (input.action === "start") {
        return apiPost(API_ENDPOINTS.PAYROLL, {
          period: input.period,
          notes: input.notes,
          duplicateFromRunId: input.duplicateFromRunId,
        });
      }
      if (input.action === "delete") {
        return apiDelete(API_ENDPOINTS.PAYROLL_BY_ID(input.runId));
      }
      return apiPatch(API_ENDPOINTS.PAYROLL_BY_ID(input.runId), {
        action: input.action,
        finalizedBy: "finalizedBy" in input ? input.finalizedBy : undefined,
        disbursementRef: "disbursementRef" in input ? input.disbursementRef : undefined,
        period: "period" in input ? input.period : undefined,
      });
    },
    onSuccess: (_data, variables) => {
      invalidateFinanceQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["payroll", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["payroll", "settings"] });
      if ("runId" in variables) {
        queryClient.invalidateQueries({ queryKey: ["payroll", variables.runId] });
      }
    },
  });
}

export function usePayrollSettings() {
  return useApiData(["payroll", "settings"], API_ENDPOINTS.PAYROLL_SETTINGS, {
    taxRate: 0.12,
    pensionRate: 0.06,
    healthRate: 0.03,
    housingAllowanceRate: 0.12,
    performanceBonusRate: 0.06,
    payFrequency: "monthly" as const,
    defaultPayDay: 28,
    autoPostExpenseOnFinalize: true,
    currency: "USD",
  });
}

export function useUpdatePayrollSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPatch(API_ENDPOINTS.PAYROLL_SETTINGS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });
}

export type PayrollReports = import("@/lib/api/payroll-reports-service").PayrollReports;

export function usePayrollReports(year = new Date().getFullYear()) {
  return useApiData<PayrollReports>(
    ["payroll", "reports", String(year)],
    `${API_ENDPOINTS.PAYROLL_REPORTS}?year=${year}`,
    {
      year,
      completedRuns: 0,
      totalDisbursed: 0,
      totalGrossYtd: 0,
      totalNetYtd: 0,
      totalTaxYtd: 0,
      activeRun: null,
      byDepartment: [],
      ytdByEmployee: [],
      recentRuns: [],
    },
  );
}

export function useAddPayrollEmployee(runId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { staffId?: string; action?: "add_all" }) =>
      apiPost<PayrollRunDetail>(API_ENDPOINTS.PAYROLL_PAYSLIPS(runId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["payroll", "reports"] });
    },
  });
}

export function useUpdatePayrollPayslip(runId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { payslipId: string; grossPay: number }) =>
      apiPatch(API_ENDPOINTS.PAYROLL_PAYSLIP(runId, input.payslipId), { grossPay: input.grossPay }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

export function useRemovePayrollPayslip(runId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payslipId: string) =>
      apiDelete<PayrollRunDetail>(API_ENDPOINTS.PAYROLL_PAYSLIP(runId, payslipId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

export function downloadPayrollCsv(runId: string) {
  const link = document.createElement("a");
  link.href = `${API_ENDPOINTS.PAYROLL_BY_ID(runId)}?format=csv`;
  link.download = `payroll-${runId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPayslipFromApi(runId: string, payslipId: string) {
  const link = document.createElement("a");
  link.href = `${API_ENDPOINTS.PAYROLL_PAYSLIP(runId, payslipId)}?format=download`;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function printPayslipFromApi(runId: string, payslipId: string) {
  const res = await fetch(`${API_ENDPOINTS.PAYROLL_PAYSLIP(runId, payslipId)}?format=html`);
  if (!res.ok) throw new Error("Unable to load payslip for printing");
  const html = await res.text();

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print payslip");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Unable to open print preview");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    window.setTimeout(() => resolve(), 300);
  });

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  window.setTimeout(() => document.body.removeChild(iframe), 1000);
}

export function downloadPaymentsCsv() {
  const link = document.createElement("a");
  link.href = `${API_ENDPOINTS.PAYMENTS}?format=csv`;
  link.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

export type TeacherDashboardLive = {
  classId: string;
  className: string;
  rosterPreview: { id: string; name: string; initials: string; tone: "purple" | "blue" | "green" | "orange" }[];
  rosterOverflow: number;
  summary: {
    overallScore: number;
    overallGradeAvg: number;
    workAssigned: number;
    workGradeAvg: number;
  };
  segments: {
    tier: TeacherPerformanceTier;
    count: number;
    classPercent: number;
    gradeAvg: number;
    studentName: string;
    initials: string;
    avatarTone: "purple" | "blue" | "green" | "orange";
  }[];
  proficiency: TeacherStudentProficiency[];
  alerts: { total: number; urgent: number };
  assignmentsDue: number;
  sessionsToday: number;
  updatedAt: string;
  classes: { id: string; name: string; label: string; students: number; room: string; schedule: string }[];
};

export function useTeacherDashboard(classId: string, fallback: TeacherDashboardLive) {
  return useQuery({
    queryKey: ["teacher", "dashboard", classId],
    queryFn: () =>
      apiGet<TeacherDashboardLive>(`${API_ENDPOINTS.TEACHER_DASHBOARD}?classId=${encodeURIComponent(classId)}`),
    initialData: fallback,
    staleTime: 5_000,
    refetchInterval: 8_000,
  });
}

export function useTeacherAssignment<T>(assignmentId: string, fallback?: T) {
  return useQuery({
    queryKey: ["assignments", assignmentId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId)),
    initialData: fallback,
    staleTime: 5_000,
    refetchInterval: 8_000,
    enabled: assignmentId.length > 0,
  });
}

export function useTeacherGradebook<T>(classId: string, fallback?: T) {
  return useQuery({
    queryKey: ["teacher", "gradebook", classId],
    queryFn: () =>
      apiGet<T>(`${API_ENDPOINTS.TEACHER_GRADEBOOK}?classId=${encodeURIComponent(classId)}`),
    initialData: fallback,
    staleTime: 5_000,
    refetchInterval: 10_000,
    enabled: classId.length > 0,
  });
}

function invalidateTeacherLiveQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["teacher", "dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["teacher", "gradebook"] });
  queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] });
  queryClient.invalidateQueries({ queryKey: ["teacher", "class"] });
  queryClient.invalidateQueries({ queryKey: ["teacher", "student"] });
  queryClient.invalidateQueries({ queryKey: ["teacher", "students"] });
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
  queryClient.invalidateQueries({ queryKey: ["courses"] });
  queryClient.invalidateQueries({ queryKey: ["materials"] });
}

export function useTeacherMaterials<T>(fallback: T, classId?: string) {
  const suffix = classId ? `?classId=${encodeURIComponent(classId)}` : "";
  return useQuery({
    queryKey: ["materials", classId ?? "all"],
    queryFn: () => apiGet<T>(`${API_ENDPOINTS.MATERIALS}${suffix}`),
    initialData: fallback,
    staleTime: 15_000,
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      classId: string;
      dueDate: string;
      description?: string;
      maxScore?: number;
    }) => apiPost(API_ENDPOINTS.ASSIGNMENTS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useGradeTeacherSubmission(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; score: number }) =>
      apiPost(API_ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId), { action: "grade", ...body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useMarkTeacherAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { sessionId: string; present: number; absent: number }) =>
      apiPatch(API_ENDPOINTS.ATTENDANCE_SESSION(body.sessionId), {
        present: body.present,
        absent: body.absent,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", "dashboard"] });
    },
  });
}

export function useTeacherClassDetail<T>(classId: string, fallback?: T) {
  return useQuery({
    queryKey: ["teacher", "class", classId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.TEACHER_CLASS(classId)),
    initialData: fallback,
    staleTime: 8_000,
    enabled: classId.length > 0,
  });
}

export function useTeacherClassesOverview<T>(fallback: T) {
  return useQuery({
    queryKey: ["teacher", "classes", "overview"],
    queryFn: () => apiGet<T>(API_ENDPOINTS.TEACHER_CLASSES_OVERVIEW),
    initialData: fallback,
    staleTime: 8_000,
    refetchInterval: 12_000,
  });
}

export function useTeacherAttendanceSession<T>(sessionId: string, fallback?: T) {
  return useQuery({
    queryKey: ["teacher", "attendance", sessionId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.TEACHER_ATTENDANCE_DETAIL(sessionId)),
    initialData: fallback,
    staleTime: 5_000,
    enabled: sessionId.length > 0,
  });
}

export function useMarkTeacherAttendanceRecords(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: { studentId: string; status: "present" | "absent" | "late" | "unmarked" }[]) =>
      apiPatch(API_ENDPOINTS.TEACHER_ATTENDANCE_DETAIL(sessionId), { records }),
    onSuccess: () => {
      invalidateTeacherLiveQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance", sessionId] });
    },
  });
}

export function useCreateTeacherAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { classId: string; date: string; time: string }) =>
      apiPost(API_ENDPOINTS.TEACHER_ATTENDANCE, body),
    onSuccess: () => {
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useUpdateTeacherAssignment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; dueDate?: string; status?: string; description?: string }) =>
      apiPatch(API_ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function usePublishTeacherGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { classId: string; term?: string }) => apiPost(API_ENDPOINTS.TEACHER_GRADES_PUBLISH, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "gradebook", variables.classId] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useTeacherCourse<T>(courseId: string, fallback?: T) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.COURSES_BY_ID(courseId)),
    initialData: fallback,
    staleTime: 10_000,
    enabled: courseId.length > 0,
  });
}

export function useCreateTeacherCourseModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => apiPost(API_ENDPOINTS.COURSES_BY_ID(courseId), { action: "add-module", title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useTeacherMaterial<T>(materialId: string, fallback?: T) {
  return useQuery({
    queryKey: ["materials", materialId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.MATERIALS_BY_ID(materialId)),
    initialData: fallback,
    staleTime: 10_000,
    enabled: materialId.length > 0,
  });
}

export function useShareTeacherMaterial(materialId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classIds: string[]) =>
      apiPatch(API_ENDPOINTS.MATERIALS_BY_ID(materialId), { action: "share", classIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials", materialId] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useDeleteTeacherMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => apiDelete(API_ENDPOINTS.MATERIALS_BY_ID(materialId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
}

export function useTeacherStudent<T>(studentId: string, fallback?: T) {
  return useQuery({
    queryKey: ["teacher", "student", studentId],
    queryFn: () => apiGet<T>(API_ENDPOINTS.TEACHER_STUDENT(studentId)),
    initialData: fallback,
    staleTime: 10_000,
    enabled: studentId.length > 0,
  });
}

export function useTeacherStudents<T>(classId?: string) {
  const suffix = classId ? `?classId=${encodeURIComponent(classId)}` : "";
  return useQuery({
    queryKey: ["teacher", "students", classId ?? "all"],
    queryFn: () => apiGet<T>(`${API_ENDPOINTS.TEACHER_STUDENTS}${suffix}`),
    staleTime: 10_000,
    refetchInterval: 12_000,
  });
}

export function useAddTeacherMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; classId: string; type?: string; size?: string }) =>
      apiPost(API_ENDPOINTS.MATERIALS, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      invalidateTeacherLiveQueries(queryClient);
    },
  });
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
