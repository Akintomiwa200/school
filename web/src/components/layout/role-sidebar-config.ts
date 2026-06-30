import { UserRole } from "@/shared";
import { getLoginPathForRole, getSupportPathForRole } from "@/shared/permissions";
import { HelpCircle, LifeBuoy, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoleSidebarBranding = {
  title: string;
  subtitle: string;
  initial: string;
  version: string;
};

export type QuickAction = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export const ROLE_SIDEBAR_BRANDING: Record<UserRole, RoleSidebarBranding> = {
  [UserRole.SUPER_ADMIN]: {
    title: "Super Admin",
    subtitle: "Full Platform Control",
    initial: "S",
    version: "v1.0 • Super Admin",
  },
  [UserRole.ADMIN]: {
    title: "Admin Panel",
    subtitle: "Management Dashboard",
    initial: "A",
    version: "v1.0 • Admin",
  },
  [UserRole.ACCOUNTANT]: {
    title: "Finance Portal",
    subtitle: "Fees & Payroll",
    initial: "F",
    version: "v1.0 • Accountant",
  },
  [UserRole.TEACHER]: {
    title: "Teacher Portal",
    subtitle: "Teaching Dashboard",
    initial: "T",
    version: "v1.0 • Teacher",
  },
  [UserRole.NON_TEACHING_STAFF]: {
    title: "Staff Portal",
    subtitle: "Operations Dashboard",
    initial: "O",
    version: "v1.0 • Staff",
  },
  [UserRole.LIBRARIAN]: {
    title: "Library Portal",
    subtitle: "Catalog & Issues",
    initial: "L",
    version: "v1.0 • Librarian",
  },
  [UserRole.HR]: {
    title: "HR Portal",
    subtitle: "People & Leave",
    initial: "H",
    version: "v1.0 • HR",
  },
  [UserRole.RECEPTIONIST]: {
    title: "Reception",
    subtitle: "Front Desk Dashboard",
    initial: "R",
    version: "v1.0 • Reception",
  },
  [UserRole.STUDENT]: {
    title: "Student Portal",
    subtitle: "Learning Dashboard",
    initial: "S",
    version: "v1.0 • Student",
  },
  [UserRole.PARENT]: {
    title: "Parent Portal",
    subtitle: "Family Dashboard",
    initial: "P",
    version: "v1.0 • Parent",
  },
};

export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  "/super-admin": "Platform overview",
  "/admin": "School overview & analytics",
  "/teacher": "Classes & teaching overview",
  "/student": "Progress & schedule",
  "/parent": "Children & family overview",
  "/accountant": "Finance overview",
  "/staff": "Operations overview",
  "/librarian": "Library overview",
  "/admin/library": "Library catalog & circulation",
  "/hr": "HR overview",
  "/receptionist": "Front desk overview",
  "/shared/support": "Get help & tickets",
  "/shared/messages": "Messaging & chats",
  "/shared/settings": "Preferences & config",
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { icon: MessageSquare, label: "Support", href: "/shared/support" },
  { icon: HelpCircle, label: "Help", href: "/shared/support" },
  { icon: LifeBuoy, label: "Contact", href: "/shared/support" },
];

export function getQuickActionsForRole(role: UserRole): QuickAction[] {
  if (role === UserRole.STUDENT) {
    return [];
  }
  const supportPath = getSupportPathForRole(role);
  return DEFAULT_QUICK_ACTIONS.map((action) => ({
    ...action,
    href: action.href === "/shared/support" ? supportPath : action.href,
  }));
}

export function getLogoutRedirect(role: UserRole): string {
  return getLoginPathForRole(role);
}
