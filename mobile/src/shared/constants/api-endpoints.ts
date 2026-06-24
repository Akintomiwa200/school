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
  EXPENSES: `${API_BASE}/expenses`,
  EXPENSES_BY_ID: (id: string) => `${API_BASE}/expenses/${id}`,
  INVOICES: `${API_BASE}/invoices`,
  INVOICES_BY_ID: (id: string) => `${API_BASE}/invoices/${id}`,
  PAYROLL: `${API_BASE}/payroll`,

  // Audit
  AUDIT: `${API_BASE}/audit`,
  AUDIT_EXPORT: `${API_BASE}/audit/export`,

  // Materials
  MATERIALS: `${API_BASE}/materials`,
  MATERIALS_BY_ID: (id: string) => `${API_BASE}/materials/${id}`,

  // Communication
  ANNOUNCEMENTS: `${API_BASE}/announcements`,
  MESSAGES: `${API_BASE}/messages`,
  NOTIFICATIONS: `${API_BASE}/notifications`,

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

  // Reports
  REPORTS: `${API_BASE}/reports`,

  // Settings
  SETTINGS: `${API_BASE}/settings`,

  // Upload
  UPLOAD: `${API_BASE}/upload`,

  // Online Classes
  ONLINE_CLASSES: `${API_BASE}/online-classes`,

  // Timetable
  TIMETABLE: `${API_BASE}/timetable`,

  // Leave & HR
  LEAVE: `${API_BASE}/leave`,
  INVENTORY: `${API_BASE}/inventory`,
} as const;
