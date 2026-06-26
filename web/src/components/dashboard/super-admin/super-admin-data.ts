import {
  Building2,
  Globe,
  School,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export const SUPER_ADMIN_DASHBOARD_STATS = [
  { id: "schools", label: "Schools", value: "24", hint: "Connected institutions", tone: "purple" as const, icon: School },
  { id: "users", label: "Users", value: "18,420", hint: "All platform accounts", tone: "blue" as const, icon: Users },
  { id: "audit", label: "Audit events", value: "1,284", hint: "Last 30 days", tone: "green" as const, icon: Shield },
  { id: "health", label: "System health", value: "99.9%", hint: "Uptime this month", tone: "orange" as const, icon: Globe },
];

export const SUPER_ADMIN_QUICK_ACTIONS = [
  { href: "/super-admin/schools", label: "Schools", description: "Manage school tenants", icon: Building2 },
  { href: "/super-admin/users", label: "Users", description: "Global account control", icon: Users },
  { href: "/super-admin/audit", label: "Audit logs", description: "Security and activity trail", icon: Shield },
  { href: "/super-admin/settings", label: "Platform settings", description: "Branding and integrations", icon: Settings },
];

export const SUPER_ADMIN_SCHOOLS = [
  { id: "sch-1", name: "Greenfield International School", location: "Lagos, Nigeria", students: 1248, status: "Active" },
  { id: "sch-2", name: "Riverside Academy", location: "Abuja, Nigeria", students: 892, status: "Active" },
  { id: "sch-3", name: "Summit Preparatory School", location: "Nairobi, Kenya", students: 654, status: "Active" },
  { id: "sch-4", name: "Horizon College", location: "Accra, Ghana", students: 1103, status: "Provisioning" },
];

export const SUPER_ADMIN_AUDIT_LOG = [
  { id: "a1", action: "School provisioned", actor: "System", target: "Horizon College", time: "1 hour ago" },
  { id: "a2", action: "User suspended", actor: "Super Admin", target: "user@example.com", time: "3 hours ago" },
  { id: "a3", action: "Platform settings updated", actor: "Super Admin", target: "Branding", time: "Yesterday" },
  { id: "a4", action: "Audit export generated", actor: "Super Admin", target: "March 2026", time: "2 days ago" },
];
