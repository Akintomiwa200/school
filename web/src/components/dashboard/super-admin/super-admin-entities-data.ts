export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  status: "active" | "suspended" | "pending";
  lastLogin: string;
};

export type PlatformSchool = {
  id: string;
  name: string;
  location: string;
  students: number;
  admins: number;
  status: "active" | "provisioning" | "suspended";
  createdAt: string;
};

export type PlatformAuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  school?: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
};

export const PLATFORM_USERS: PlatformUser[] = [
  { id: "u1", name: "James Admin", email: "admin@greenfield.edu", role: "Admin", school: "Greenfield International", status: "active", lastLogin: "2026-03-05" },
  { id: "u2", name: "Sarah Chen", email: "s.chen@riverside.edu", role: "Teacher", school: "Riverside Academy", status: "active", lastLogin: "2026-03-04" },
  { id: "u3", name: "blocked@example.com", email: "blocked@example.com", role: "Student", school: "Summit Prep", status: "suspended", lastLogin: "2026-01-12" },
  { id: "u4", name: "New School Admin", email: "admin@horizon.edu", role: "Admin", school: "Horizon College", status: "pending", lastLogin: "—" },
  { id: "u5", name: "Finance Lead", email: "finance@greenfield.edu", role: "Accountant", school: "Greenfield International", status: "active", lastLogin: "2026-03-05" },
];

export const PLATFORM_SCHOOLS: PlatformSchool[] = [
  { id: "sch-1", name: "Greenfield International School", location: "Lagos, Nigeria", students: 1248, admins: 4, status: "active", createdAt: "2023-08-15" },
  { id: "sch-2", name: "Riverside Academy", location: "Abuja, Nigeria", students: 892, admins: 3, status: "active", createdAt: "2024-01-10" },
  { id: "sch-3", name: "Summit Preparatory School", location: "Nairobi, Kenya", students: 654, admins: 2, status: "active", createdAt: "2024-06-01" },
  { id: "sch-4", name: "Horizon College", location: "Accra, Ghana", students: 0, admins: 1, status: "provisioning", createdAt: "2026-03-01" },
];

export const PLATFORM_AUDIT: PlatformAuditEvent[] = [
  { id: "a1", action: "School provisioned", actor: "System", target: "Horizon College", school: "Horizon College", timestamp: "2026-03-05T10:00:00", severity: "info" },
  { id: "a2", action: "User suspended", actor: "Super Admin", target: "blocked@example.com", school: "Summit Prep", timestamp: "2026-03-04T14:22:00", severity: "warning" },
  { id: "a3", action: "Platform settings updated", actor: "Super Admin", target: "Branding", timestamp: "2026-03-03T09:15:00", severity: "info" },
  { id: "a4", action: "Failed login attempt", actor: "Unknown", target: "admin@greenfield.edu", school: "Greenfield International", timestamp: "2026-03-02T22:40:00", severity: "critical" },
  { id: "a5", action: "Audit export generated", actor: "Super Admin", target: "March 2026", timestamp: "2026-03-01T16:30:00", severity: "info" },
  { id: "a6", action: "User password reset", actor: "Super Admin", target: "s.chen@riverside.edu", school: "Riverside Academy", timestamp: "2026-02-28T11:00:00", severity: "info" },
];

export const USER_STATUS_STYLES = {
  active: "bg-green/15 text-green",
  suspended: "bg-destructive/15 text-destructive",
  pending: "bg-brand-orange/15 text-brand-orange",
} as const;

export const SCHOOL_STATUS_STYLES = {
  active: "bg-green/15 text-green",
  provisioning: "bg-brand-blue/15 text-brand-blue",
  suspended: "bg-destructive/15 text-destructive",
} as const;

export const AUDIT_SEVERITY_STYLES = {
  info: "bg-brand-blue/15 text-brand-blue",
  warning: "bg-brand-orange/15 text-brand-orange",
  critical: "bg-destructive/15 text-destructive",
} as const;
