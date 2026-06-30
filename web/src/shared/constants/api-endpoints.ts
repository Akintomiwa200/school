const API_BASE = "/api/v1";

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_LOGOUT: `${API_BASE}/auth/logout`,
  AUTH_REFRESH: `${API_BASE}/auth/refresh`,
  AUTH_FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  AUTH_VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
  AUTH_VERIFY_CODE: `${API_BASE}/auth/verify-code`,
  AUTH_SESSION: `${API_BASE}/auth/session`,
  AUTH_ONBOARDING: `${API_BASE}/auth/onboarding`,
  AUTH_ME: `${API_BASE}/auth/me`,

  // Users
  USERS: `${API_BASE}/users`,
  USERS_BY_ID: (id: string) => `${API_BASE}/users/${id}`,

  // Students
  STUDENTS: `${API_BASE}/students`,
  STUDENTS_BY_ID: (id: string) => `${API_BASE}/students/${id}`,

  // Staff
  STAFF: `${API_BASE}/staff`,
  STAFF_BY_ID: (id: string) => `${API_BASE}/staff/${id}`,

  // Classes & Subjects
  CLASSES: `${API_BASE}/classes`,
  CLASSES_BY_ID: (id: string) => `${API_BASE}/classes/${id}`,
  SUBJECTS: `${API_BASE}/subjects`,
  SUBJECTS_BY_ID: (id: string) => `${API_BASE}/subjects/${id}`,

  // Courses
  COURSES: `${API_BASE}/courses`,
  COURSES_BY_ID: (id: string) => `${API_BASE}/courses/${id}`,

  // Attendance
  ATTENDANCE: `${API_BASE}/attendance`,
  ATTENDANCE_BY_ID: (id: string) => `${API_BASE}/attendance/${id}`,
  ATTENDANCE_BULK: `${API_BASE}/attendance/bulk`,
  ATTENDANCE_REPORT: `${API_BASE}/attendance/report`,

  // Assignments & Grades
  ASSIGNMENTS: `${API_BASE}/assignments`,
  ASSIGNMENTS_BY_ID: (id: string) => `${API_BASE}/assignments/${id}`,
  GRADES: `${API_BASE}/grades`,

  // Finance
  FEES: `${API_BASE}/fees`,
  FEES_BY_ID: (id: string) => `${API_BASE}/fees/${id}`,
  PAYMENTS: `${API_BASE}/payments`,
  PAYMENTS_BY_ID: (id: string) => `${API_BASE}/payments/${id}`,
  PAYMENT_RECEIPT: (id: string) => `${API_BASE}/payments/${id}/receipt`,
  EXPENSES: `${API_BASE}/expenses`,
  EXPENSES_BY_ID: (id: string) => `${API_BASE}/expenses/${id}`,
  INVOICES: `${API_BASE}/invoices`,
  INVOICES_BY_ID: (id: string) => `${API_BASE}/invoices/${id}`,
  PAYROLL: `${API_BASE}/payroll`,
  PAYROLL_REPORTS: `${API_BASE}/payroll/reports`,
  PAYROLL_SETTINGS: `${API_BASE}/payroll/settings`,
  PAYROLL_BY_ID: (id: string) => `${API_BASE}/payroll/${id}`,
  PAYROLL_PAYSLIPS: (runId: string) => `${API_BASE}/payroll/${runId}/payslips`,
  PAYROLL_PAYSLIP: (runId: string, payslipId: string) =>
    `${API_BASE}/payroll/${runId}/payslips/${payslipId}`,
  FINANCE_SUMMARY: `${API_BASE}/finance/summary`,

  // Audit
  AUDIT: `${API_BASE}/audit`,
  AUDIT_BY_ID: (id: string) => `${API_BASE}/audit/${id}`,
  AUDIT_EXPORT: `${API_BASE}/audit/export`,
  AUDIT_STATS: `${API_BASE}/audit/stats`,
  AUDIT_RECONCILIATION: `${API_BASE}/audit/reconciliation`,
  AUDIT_RECONCILIATION_ITEM: (id: string) => `${API_BASE}/audit/reconciliation/${id}`,

  // Materials
  MATERIALS: `${API_BASE}/materials`,
  MATERIALS_BY_ID: (id: string) => `${API_BASE}/materials/${id}`,

  // Communication
  CONTACT: `${API_BASE}/contact`,
  ANNOUNCEMENTS: `${API_BASE}/announcements`,
  MESSAGES: `${API_BASE}/messages`,
  NOTIFICATIONS: `${API_BASE}/notifications`,
  NOTIFICATIONS_BY_ID: (id: string) => `${API_BASE}/notifications/${id}`,

  // Support
  SUPPORT: `${API_BASE}/support`,
  SUPPORT_BY_ID: (id: string) => `${API_BASE}/support/${id}`,

  // Events & Calendar
  EVENTS: `${API_BASE}/events`,
  CALENDAR: `${API_BASE}/calendar`,

  // Library
  LIBRARY: `${API_BASE}/library`,
  LIBRARY_BOOKS: `${API_BASE}/library/books`,
  LIBRARY_ISSUES: `${API_BASE}/library/issues`,

  // Transport & Hostel
  TRANSPORT: `${API_BASE}/transport`,
  HOSTEL: `${API_BASE}/hostel`,

  // Admissions
  ADMISSIONS: `${API_BASE}/admissions`,
  ACADEMIC_YEARS: `${API_BASE}/academic-years`,
  ACADEMIC_YEARS_BY_ID: (id: string) => `${API_BASE}/academic-years/${id}`,
  SCHOOLS: `${API_BASE}/schools`,

  // Reports
  REPORTS: `${API_BASE}/reports`,

  // Parent & HR portals
  PARENT: `${API_BASE}/parent`,
  HR: `${API_BASE}/hr`,

  // Settings
  SETTINGS: `${API_BASE}/settings`,

  // Upload
  UPLOAD: `${API_BASE}/upload`,

  // Online Classes
  ONLINE_CLASSES: `${API_BASE}/online-classes`,

  // Timetable
  TIMETABLE: `${API_BASE}/timetable`,

  // Teacher portal
  TEACHER_DASHBOARD: `${API_BASE}/teacher/dashboard`,
  TEACHER_GRADEBOOK: `${API_BASE}/teacher/gradebook`,
  TEACHER_GRADES_PUBLISH: `${API_BASE}/teacher/grades/publish`,
  TEACHER_CLASS: (id: string) => `${API_BASE}/teacher/classes/${id}`,
  TEACHER_CLASSES_OVERVIEW: `${API_BASE}/teacher/classes/overview`,
  TEACHER_STUDENTS: `${API_BASE}/teacher/students`,
  TEACHER_STUDENT: (id: string) => `${API_BASE}/teacher/students/${id}`,
  TEACHER_ATTENDANCE: `${API_BASE}/teacher/attendance`,
  TEACHER_ATTENDANCE_DETAIL: (id: string) => `${API_BASE}/teacher/attendance/${id}`,
  ATTENDANCE_SESSION: (id: string) => `${API_BASE}/attendance/${id}`,

  // Leave & HR
  LEAVE: `${API_BASE}/leave`,
  INVENTORY: `${API_BASE}/inventory`,
} as const;
