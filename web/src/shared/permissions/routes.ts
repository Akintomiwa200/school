import { UserRole } from "../types";

export const ROLE_ROUTES: Record<UserRole, { label: string; path: string; icon: string }[]> = {
  [UserRole.SUPER_ADMIN]: [
    { label: "Dashboard", path: "/super-admin", icon: "LayoutDashboard" },
    { label: "Schools", path: "/super-admin/schools", icon: "Building" },
    { label: "Users", path: "/super-admin/users", icon: "Users" },
    { label: "Settings", path: "/super-admin/settings", icon: "Settings" },
    { label: "Audit Logs", path: "/super-admin/audit", icon: "Shield" },
  ],

  [UserRole.ADMIN]: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { label: "Students", path: "/admin/students", icon: "GraduationCap" },
    { label: "Staff", path: "/admin/staff", icon: "Users" },
    { label: "Classes", path: "/admin/classes", icon: "School" },
    { label: "Subjects", path: "/admin/subjects", icon: "BookOpen" },
    { label: "Academic Years", path: "/admin/academic-years", icon: "Calendar" },
    { label: "Admissions", path: "/admin/admissions", icon: "UserPlus" },
    { label: "Reports", path: "/admin/reports", icon: "BarChart" },
    { label: "Settings", path: "/admin/settings", icon: "Settings" },
  ],

  [UserRole.ACCOUNTANT]: [
    { label: "Dashboard", path: "/accountant", icon: "LayoutDashboard" },
    { label: "Fee Structure", path: "/accountant/fees", icon: "Receipt" },
    { label: "Payments", path: "/accountant/payments", icon: "CreditCard" },
    { label: "Expenses", path: "/accountant/expenses", icon: "Wallet" },
    { label: "Invoices", path: "/accountant/invoices", icon: "FileText" },
    { label: "Payroll", path: "/accountant/payroll", icon: "Banknote" },
    { label: "Audit", path: "/accountant/audit", icon: "Shield" },
    { label: "Reports", path: "/accountant/reports", icon: "BarChart" },
  ],

  [UserRole.TEACHER]: [
    { label: "Dashboard", path: "/teacher", icon: "LayoutDashboard" },
    { label: "My Classes", path: "/teacher/classes", icon: "School" },
    { label: "Courses", path: "/teacher/courses", icon: "BookOpen" },
    { label: "Attendance", path: "/teacher/attendance", icon: "ClipboardCheck" },
    { label: "Assignments", path: "/teacher/assignments", icon: "FileEdit" },
    { label: "Grades", path: "/teacher/grades", icon: "Award" },
    { label: "Materials", path: "/teacher/materials", icon: "FolderOpen" },
    { label: "Timetable", path: "/teacher/timetable", icon: "Clock" },
    { label: "Online Classes", path: "/shared/online-classes", icon: "Video" },
  ],

  [UserRole.NON_TEACHING_STAFF]: [
    { label: "Dashboard", path: "/staff", icon: "LayoutDashboard" },
    { label: "Attendance", path: "/staff/attendance", icon: "ClipboardCheck" },
    { label: "Transport", path: "/staff/transport", icon: "Bus" },
    { label: "Hostel", path: "/staff/hostel", icon: "Home" },
    { label: "Inventory", path: "/staff/inventory", icon: "Package" },
    { label: "Leave", path: "/shared/leave", icon: "CalendarOff" },
  ],

  [UserRole.LIBRARIAN]: [
    { label: "Dashboard", path: "/librarian", icon: "LayoutDashboard" },
    { label: "Books", path: "/librarian/books", icon: "Book" },
    { label: "Issues & Returns", path: "/librarian/issues", icon: "BookMarked" },
  ],

  [UserRole.HR]: [
    { label: "Dashboard", path: "/hr", icon: "LayoutDashboard" },
    { label: "Employees", path: "/hr/employees", icon: "Users" },
    { label: "Leave Management", path: "/hr/leave", icon: "CalendarOff" },
    { label: "Recruitment", path: "/hr/recruitment", icon: "UserPlus" },
  ],

  [UserRole.RECEPTIONIST]: [
    { label: "Dashboard", path: "/receptionist", icon: "LayoutDashboard" },
    { label: "Admissions", path: "/receptionist/admissions", icon: "UserPlus" },
    { label: "Visitors", path: "/receptionist/visitors", icon: "UserCheck" },
    { label: "Support", path: "/shared/support", icon: "Headphones" },
  ],

  [UserRole.STUDENT]: [
    { label: "Dashboard", path: "/student", icon: "LayoutDashboard" },
    { label: "Courses", path: "/student/courses", icon: "BookOpen" },
    { label: "Assignments", path: "/student/assignments", icon: "FileEdit" },
    { label: "Grades", path: "/student/grades", icon: "Award" },
    { label: "Attendance", path: "/student/attendance", icon: "ClipboardCheck" },
    { label: "Fees", path: "/student/fees", icon: "Receipt" },
    { label: "Timetable", path: "/student/timetable", icon: "Clock" },
    { label: "Library", path: "/student/library", icon: "Book" },
    { label: "Online Classes", path: "/shared/online-classes", icon: "Video" },
  ],

  [UserRole.PARENT]: [
    { label: "Dashboard", path: "/parent", icon: "LayoutDashboard" },
    { label: "My Children", path: "/parent/children", icon: "Users" },
    { label: "Fees & Payments", path: "/parent/fees", icon: "CreditCard" },
    { label: "Attendance", path: "/parent/attendance", icon: "ClipboardCheck" },
    { label: "Grades", path: "/parent/grades", icon: "Award" },
    { label: "Messages", path: "/parent/messages", icon: "MessageSquare" },
  ],
};

export const SHARED_ROUTES = [
  { label: "Announcements", path: "/shared/announcements", icon: "Megaphone" },
  { label: "Calendar", path: "/shared/calendar", icon: "Calendar" },
  { label: "Events", path: "/shared/events", icon: "PartyPopper" },
  { label: "Messages", path: "/shared/messages", icon: "MessageSquare" },
  { label: "Notifications", path: "/shared/notifications", icon: "Bell" },
  { label: "Support", path: "/shared/support", icon: "Headphones" },
  { label: "Profile", path: "/shared/profile", icon: "User" },
  { label: "Settings", path: "/shared/settings", icon: "Settings" },
];
