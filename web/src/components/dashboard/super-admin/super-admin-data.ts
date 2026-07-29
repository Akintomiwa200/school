import {
  Building2,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export const SUPER_ADMIN_QUICK_ACTIONS = [
  { href: "/super-admin/schools", label: "Schools", description: "Manage school tenants", icon: Building2 },
  { href: "/super-admin/users", label: "Users", description: "Global account control", icon: Users },
  { href: "/super-admin/audit", label: "Audit logs", description: "Security and activity trail", icon: Shield },
  { href: "/super-admin/settings", label: "Platform settings", description: "Branding and integrations", icon: Settings },
];
