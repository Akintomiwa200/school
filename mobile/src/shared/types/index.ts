export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  TEACHER = "TEACHER",
  NON_TEACHING_STAFF = "NON_TEACHING_STAFF",
  LIBRARIAN = "LIBRARIAN",
  HR = "HR",
  RECEPTIONIST = "RECEPTIONIST",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

export enum Permission {
  // Users
  USERS_VIEW = "users:view",
  USERS_CREATE = "users:create",
  USERS_UPDATE = "users:update",
  USERS_DELETE = "users:delete",

  // Students
  STUDENTS_VIEW = "students:view",
  STUDENTS_CREATE = "students:create",
  STUDENTS_UPDATE = "students:update",
  STUDENTS_DELETE = "students:delete",

  // Staff
  STAFF_VIEW = "staff:view",
  STAFF_CREATE = "staff:create",
  STAFF_UPDATE = "staff:update",
  STAFF_DELETE = "staff:delete",

  // Classes & Subjects
  CLASSES_VIEW = "classes:view",
  CLASSES_MANAGE = "classes:manage",
  SUBJECTS_VIEW = "subjects:view",
  SUBJECTS_MANAGE = "subjects:manage",

  // Courses
  COURSES_VIEW = "courses:view",
  COURSES_CREATE = "courses:create",
  COURSES_UPDATE = "courses:update",
  COURSES_DELETE = "courses:delete",

  // Attendance
  ATTENDANCE_VIEW = "attendance:view",
  ATTENDANCE_MARK = "attendance:mark",
  ATTENDANCE_MANAGE = "attendance:manage",

  // Assignments & Grades
  ASSIGNMENTS_VIEW = "assignments:view",
  ASSIGNMENTS_CREATE = "assignments:create",
  ASSIGNMENTS_GRADE = "assignments:grade",
  GRADES_VIEW = "grades:view",
  GRADES_MANAGE = "grades:manage",

  // Finance
  FEES_VIEW = "fees:view",
  FEES_MANAGE = "fees:manage",
  PAYMENTS_VIEW = "payments:view",
  PAYMENTS_PROCESS = "payments:process",
  EXPENSES_VIEW = "expenses:view",
  EXPENSES_MANAGE = "expenses:manage",
  INVOICES_VIEW = "invoices:view",
  INVOICES_MANAGE = "invoices:manage",
  PAYROLL_VIEW = "payroll:view",
  PAYROLL_MANAGE = "payroll:manage",

  // Audit
  AUDIT_VIEW = "audit:view",
  AUDIT_EXPORT = "audit:export",

  // Materials
  MATERIALS_VIEW = "materials:view",
  MATERIALS_UPLOAD = "materials:upload",
  MATERIALS_MANAGE = "materials:manage",

  // Communication
  ANNOUNCEMENTS_VIEW = "announcements:view",
  ANNOUNCEMENTS_CREATE = "announcements:create",
  MESSAGES_VIEW = "messages:view",
  MESSAGES_SEND = "messages:send",

  // Support
  SUPPORT_VIEW = "support:view",
  SUPPORT_MANAGE = "support:manage",

  // Library
  LIBRARY_VIEW = "library:view",
  LIBRARY_MANAGE = "library:manage",

  // Transport & Hostel
  TRANSPORT_VIEW = "transport:view",
  TRANSPORT_MANAGE = "transport:manage",
  HOSTEL_VIEW = "hostel:view",
  HOSTEL_MANAGE = "hostel:manage",

  // Admissions
  ADMISSIONS_VIEW = "admissions:view",
  ADMISSIONS_MANAGE = "admissions:manage",

  // Reports
  REPORTS_VIEW = "reports:view",
  REPORTS_EXPORT = "reports:export",

  // Settings
  SETTINGS_VIEW = "settings:view",
  SETTINGS_MANAGE = "settings:manage",

  // Online Classes
  ONLINE_CLASSES_VIEW = "online_classes:view",
  ONLINE_CLASSES_HOST = "online_classes:host",

  // HR
  HR_VIEW = "hr:view",
  HR_MANAGE = "hr:manage",
  LEAVE_VIEW = "leave:view",
  LEAVE_MANAGE = "leave:manage",

  // Inventory
  INVENTORY_VIEW = "inventory:view",
  INVENTORY_MANAGE = "inventory:manage",

  // Events & Calendar
  EVENTS_VIEW = "events:view",
  EVENTS_MANAGE = "events:manage",
  CALENDAR_VIEW = "calendar:view",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
  HALF_DAY = "HALF_DAY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CARD = "CARD",
  MOBILE_MONEY = "MOBILE_MONEY",
  CHEQUE = "CHEQUE",
  ONLINE = "ONLINE",
}

export enum CourseMode {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID",
}

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum AssignmentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
  GRADED = "GRADED",
}

export enum SupportTicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum SupportTicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  PAYMENT = "PAYMENT",
  ATTENDANCE = "ATTENDANCE",
  ASSIGNMENT = "ASSIGNMENT",
  MESSAGE = "MESSAGE",
}

export enum ExpenseCategory {
  SALARIES = "SALARIES",
  UTILITIES = "UTILITIES",
  MAINTENANCE = "MAINTENANCE",
  SUPPLIES = "SUPPLIES",
  TRANSPORT = "TRANSPORT",
  EVENTS = "EVENTS",
  EQUIPMENT = "EQUIPMENT",
  OTHER = "OTHER",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  PAYMENT = "PAYMENT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum AdmissionStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ENROLLED = "ENROLLED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export * from "./user";
export * from "./student";
export * from "./course";
export * from "./finance";
export * from "./attendance";
export * from "./api";
export * from "./file";
