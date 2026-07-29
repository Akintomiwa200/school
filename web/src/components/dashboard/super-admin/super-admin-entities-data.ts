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

export const EMPTY_PLATFORM_USERS: PlatformUser[] = [];
export const EMPTY_PLATFORM_AUDIT: PlatformAuditEvent[] = [];

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
