import { UserRole } from "../types";
import { hasPermission } from "./index";
import { ROLE_DASHBOARD_PREFIXES, SHARED_ROUTE_PERMISSIONS } from "./staff-roles";
import {
  getProfilePathForRole,
  isSharedPathOverriddenForRole,
  resolveSharedPathForRole,
} from "./role-paths";

export {
  getAnnouncementsPathForRole,
  getCalendarPathForRole,
  getEventsPathForRole,
  getLeavePathForRole,
  getMessagesPathForRole,
  getProfilePathForRole,
  getSettingsPathForRole,
  getSupportPathForRole,
  resolveSharedPathForRole,
} from "./role-paths";

export const ROLE_ROUTES: Record<UserRole, { label: string; path: string; icon: string }[]> = {
  [UserRole.SUPER_ADMIN]: [
    { label: "Dashboard", path: "/super-admin", icon: "LayoutDashboard" },
    { label: "Schools", path: "/super-admin/schools", icon: "Building" },
    { label: "Admission setup", path: "/super-admin/admissions/settings", icon: "UserPlus" },
    { label: "Users", path: "/super-admin/users", icon: "Users" },
    { label: "Messages", path: "/super-admin/messages", icon: "MessageSquare" },
    { label: "Calendar", path: "/super-admin/calendar", icon: "Calendar" },
    { label: "Announcements", path: "/super-admin/announcements", icon: "Megaphone" },
    { label: "Settings", path: "/super-admin/settings", icon: "Settings" },
    { label: "Audit Logs", path: "/super-admin/audit", icon: "Shield" },
    { label: "Profile", path: "/super-admin/profile", icon: "User" },
    { label: "Notifications", path: "/super-admin/notifications", icon: "Bell" },
  ],

  [UserRole.ADMIN]: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { label: "Students", path: "/admin/students", icon: "GraduationCap" },
    { label: "Staff", path: "/admin/staff", icon: "Users" },
    { label: "Classes", path: "/admin/classes", icon: "School" },
    { label: "Subjects", path: "/admin/subjects", icon: "BookOpen" },
    { label: "Academic Years", path: "/admin/academic-years", icon: "Calendar" },
    { label: "Admissions", path: "/admin/admissions", icon: "UserPlus" },
    { label: "Library", path: "/admin/library", icon: "Book" },
    { label: "Reports", path: "/admin/reports", icon: "BarChart" },
    { label: "Messages", path: "/admin/messages", icon: "MessageSquare" },
    { label: "Calendar", path: "/admin/calendar", icon: "Calendar" },
    { label: "Announcements", path: "/admin/announcements", icon: "Megaphone" },
    { label: "Settings", path: "/admin/settings", icon: "Settings" },
    { label: "Profile", path: "/admin/profile", icon: "User" },
    { label: "Notifications", path: "/admin/notifications", icon: "Bell" },
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
    { label: "Announcements", path: "/accountant/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/accountant/calendar", icon: "Calendar" },
    { label: "Messages", path: "/accountant/messages", icon: "MessageSquare" },
    { label: "Support", path: "/accountant/support", icon: "Headphones" },
    { label: "Settings", path: "/accountant/settings", icon: "Settings" },
    { label: "Profile", path: "/accountant/profile", icon: "User" },
    { label: "Notifications", path: "/accountant/notifications", icon: "Bell" },
  ],

  [UserRole.TEACHER]: [
    { label: "Dashboard", path: "/teacher", icon: "LayoutDashboard" },
    { label: "My Classes", path: "/teacher/classes", icon: "School" },
    { label: "Students", path: "/teacher/students", icon: "Users" },
    { label: "Courses", path: "/teacher/courses", icon: "BookOpen" },
    { label: "Attendance", path: "/teacher/attendance", icon: "ClipboardCheck" },
    { label: "Assignments", path: "/teacher/assignments", icon: "FileEdit" },
    { label: "Grades", path: "/teacher/grades", icon: "Award" },
    { label: "Materials", path: "/teacher/materials", icon: "FolderOpen" },
    { label: "Timetable", path: "/teacher/timetable", icon: "Clock" },
    { label: "Online Classes", path: "/teacher/online-classes", icon: "Video" },
    { label: "Announcements", path: "/teacher/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/teacher/calendar", icon: "Calendar" },
    { label: "Events", path: "/teacher/events", icon: "PartyPopper" },
    { label: "Messages", path: "/teacher/messages", icon: "MessageSquare" },
    { label: "Support", path: "/teacher/support", icon: "Headphones" },
    { label: "Notifications", path: "/teacher/notifications", icon: "Bell" },
  ],

  [UserRole.NON_TEACHING_STAFF]: [
    { label: "Dashboard", path: "/staff", icon: "LayoutDashboard" },
    { label: "Attendance", path: "/staff/attendance", icon: "ClipboardCheck" },
    { label: "Transport", path: "/staff/transport", icon: "Bus" },
    { label: "Hostel", path: "/staff/hostel", icon: "Home" },
    { label: "Inventory", path: "/staff/inventory", icon: "Package" },
    { label: "Leave", path: "/staff/leave", icon: "CalendarOff" },
    { label: "Announcements", path: "/staff/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/staff/calendar", icon: "Calendar" },
    { label: "Messages", path: "/staff/messages", icon: "MessageSquare" },
    { label: "Support", path: "/staff/support", icon: "Headphones" },
    { label: "Notifications", path: "/staff/notifications", icon: "Bell" },
  ],

  [UserRole.LIBRARIAN]: [
    { label: "Dashboard", path: "/librarian", icon: "LayoutDashboard" },
    { label: "Books", path: "/librarian/books", icon: "Book" },
    { label: "Issues & Returns", path: "/librarian/issues", icon: "BookMarked" },
    { label: "Announcements", path: "/librarian/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/librarian/calendar", icon: "Calendar" },
    { label: "Messages", path: "/librarian/messages", icon: "MessageSquare" },
    { label: "Support", path: "/librarian/support", icon: "Headphones" },
    { label: "Notifications", path: "/librarian/notifications", icon: "Bell" },
  ],

  [UserRole.HR]: [
    { label: "Dashboard", path: "/hr", icon: "LayoutDashboard" },
    { label: "Employees", path: "/hr/employees", icon: "Users" },
    { label: "Leave Management", path: "/hr/leave", icon: "CalendarOff" },
    { label: "Recruitment", path: "/hr/recruitment", icon: "UserPlus" },
    { label: "Announcements", path: "/hr/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/hr/calendar", icon: "Calendar" },
    { label: "Messages", path: "/hr/messages", icon: "MessageSquare" },
    { label: "Support", path: "/hr/support", icon: "Headphones" },
    { label: "Notifications", path: "/hr/notifications", icon: "Bell" },
  ],

  [UserRole.RECEPTIONIST]: [
    { label: "Dashboard", path: "/receptionist", icon: "LayoutDashboard" },
    { label: "Admissions", path: "/receptionist/admissions", icon: "UserPlus" },
    { label: "Visitors", path: "/receptionist/visitors", icon: "UserCheck" },
    { label: "Support", path: "/receptionist/support", icon: "Headphones" },
    { label: "Announcements", path: "/receptionist/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/receptionist/calendar", icon: "Calendar" },
    { label: "Events", path: "/receptionist/events", icon: "PartyPopper" },
    { label: "Messages", path: "/receptionist/messages", icon: "MessageSquare" },
    { label: "Notifications", path: "/receptionist/notifications", icon: "Bell" },
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
    { label: "Online Classes", path: "/student/online-classes", icon: "Video" },
    { label: "Announcements", path: "/student/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/student/calendar", icon: "Calendar" },
    { label: "Events", path: "/student/events", icon: "PartyPopper" },
    { label: "Messages", path: "/student/messages", icon: "MessageSquare" },
    { label: "Notifications", path: "/student/notifications", icon: "Bell" },
    { label: "Profile", path: "/student/profile", icon: "User" },
    { label: "Settings", path: "/student/settings", icon: "Settings" },
  ],

  [UserRole.PARENT]: [
    { label: "Dashboard", path: "/parent", icon: "LayoutDashboard" },
    { label: "My Children", path: "/parent/children", icon: "Users" },
    { label: "Fees & Payments", path: "/parent/fees", icon: "CreditCard" },
    { label: "Attendance", path: "/parent/attendance", icon: "ClipboardCheck" },
    { label: "Grades", path: "/parent/grades", icon: "Award" },
    { label: "Messages", path: "/parent/messages", icon: "MessageSquare" },
    { label: "Support", path: "/parent/support", icon: "Headphones" },
    { label: "Announcements", path: "/parent/announcements", icon: "Megaphone" },
    { label: "Calendar", path: "/parent/calendar", icon: "Calendar" },
    { label: "Events", path: "/parent/events", icon: "PartyPopper" },
    { label: "Profile", path: "/parent/profile", icon: "User" },
    { label: "Settings", path: "/parent/settings", icon: "Settings" },
    { label: "Notifications", path: "/parent/notifications", icon: "Bell" },
  ],
};

export const SHARED_ROUTES = [
  { label: "Announcements", path: "/shared/announcements", icon: "Megaphone" },
  { label: "Calendar", path: "/shared/calendar", icon: "Calendar" },
  { label: "Events", path: "/shared/events", icon: "PartyPopper" },
  { label: "Messages", path: "/shared/messages", icon: "MessageSquare" },
  { label: "Support", path: "/shared/support", icon: "Headphones" },
  { label: "Profile", path: "/shared/profile", icon: "User" },
  { label: "Settings", path: "/shared/settings", icon: "Settings" },
];

export function getSharedRoutesForRole(role: UserRole) {
  return SHARED_ROUTES.filter((route) => {
    if (isSharedPathOverriddenForRole(role, route.path)) {
      return false;
    }
    const permission = SHARED_ROUTE_PERMISSIONS[route.path];
    if (!permission) return true;
    return hasPermission(role, permission);
  }).map((route) => ({
    ...route,
    path: resolveSharedPathForRole(route.path, role),
  }));
}

export function canRoleAccessSharedPath(role: UserRole, pathname: string): boolean {
  const route = SHARED_ROUTES.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
  if (!route) return false;
  const permission = SHARED_ROUTE_PERMISSIONS[route.path];
  if (!permission) return true;
  return hasPermission(role, permission);
}

export function canRoleAccessDashboardPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/shared")) {
    return canRoleAccessSharedPath(role, pathname);
  }

  const allowedPrefixes = ROLE_DASHBOARD_PREFIXES[role] ?? [];

  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
