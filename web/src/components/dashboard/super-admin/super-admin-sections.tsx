"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useAuditLog,
  useCreateSchool,
  useSchoolsList,
  useUpdateUserStatus,
  useUsersList,
} from "@/hooks/use-dashboard-data";
import { API_ENDPOINTS } from "@/shared/constants";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import {
  DashboardEmptyCopy,
  DashboardFilterSelect,
  DashboardSearchField,
  dashboardFilterBarClass,
} from "../form-controls";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import {
  AUDIT_SEVERITY_STYLES,
  EMPTY_PLATFORM_AUDIT,
  EMPTY_PLATFORM_USERS,
  SCHOOL_STATUS_STYLES,
  USER_STATUS_STYLES,
  type PlatformSchool,
} from "./super-admin-entities-data";
import {
  SuperAdminListSkeleton,
  SuperAdminModal,
  SuperAdminPageHeader,
  superAdminInitialLoading,
} from "./super-admin-workflow-ui";

const EMPTY_SCHOOLS: PlatformSchool[] = [];

const SCHOOL_CARD_STYLES = [
  "border-brand-purple/15 bg-brand-purple/5",
  "border-brand-blue/15 bg-brand-blue/5",
  "border-green/15 bg-green/5",
  "border-brand-orange/15 bg-brand-orange/5",
] as const;

export function SuperAdminSchools() {
  const pageLoading = usePageLoading();
  const { data: schools = EMPTY_SCHOOLS, isFetching, isFetched } = useSchoolsList(EMPTY_SCHOOLS);
  const createSchool = useCreateSchool();
  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const stats = useMemo(() => ({
    total: schools.length,
    active: schools.filter((s) => s.status === "active").length,
    provisioning: schools.filter((s) => s.status === "provisioning").length,
    students: schools.reduce((sum, s) => sum + s.students, 0),
  }), [schools]);

  const filtered = useMemo(() => {
    let rows = schools;
    if (statusFilter) rows = rows.filter((s) => s.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
  }, [schools, query, statusFilter]);

  const onProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    await createSchool.mutateAsync({
      name: formName,
      location: formLocation || undefined,
      email: formEmail || undefined,
      phone: formPhone || undefined,
    });
    setFormName("");
    setFormLocation("");
    setFormEmail("");
    setFormPhone("");
    setOpen(false);
    toast.success("School provisioned");
  };

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <SuperAdminPageHeader
        title="Schools"
        description={stats.total > 0 ? `${stats.total} schools · ${stats.students.toLocaleString()} total students` : "Manage schools connected to the platform."}
        isFetching={isFetching}
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Provision school
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard icon={Building2} label="Total schools" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="Active" value={String(stats.active)} hint="Live tenants" tone="green" />
        <ManagementStatCard label="Provisioning" value={String(stats.provisioning)} hint="Onboarding" tone="orange" />
        <ManagementStatCard icon={Users} label="Students" value={stats.students.toLocaleString()} tone="blue" />
      </div>

      <div className={dashboardFilterBarClass()} data-filter-bar="true">
        <DashboardSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name or location..."
          type="text"
        />
        <DashboardFilterSelect
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "provisioning", label: "Provisioning" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <ManagementPanel className="dashboard-empty-state border border-dashed border-border py-16">
          <div className="dashboard-empty-state__inner">
            <span className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/10">
              <Building2 className="h-7 w-7 text-brand-purple" />
            </span>
            <h3 className="w-full text-base font-bold">{query || statusFilter ? "No matching schools" : "No schools yet"}</h3>
            <DashboardEmptyCopy className="mt-1">
              {query || statusFilter
                ? "Try adjusting your search or filter."
                : "Provision your first school to begin onboarding students and staff."}
            </DashboardEmptyCopy>
            {!query && !statusFilter ? (
              <Button onClick={() => setOpen(true)} className="mt-5 rounded-full bg-brand-purple px-6 text-white hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" />
                Provision your first school
              </Button>
            ) : null}
          </div>
        </ManagementPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((school, index) => (
            <ManagementPanel
              key={school.id}
              className={cn("border transition-shadow hover:shadow-md", SCHOOL_CARD_STYLES[index % SCHOOL_CARD_STYLES.length])}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-white">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-snug">{school.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{school.location || "No location set"}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", SCHOOL_STATUS_STYLES[school.status])}>
                  {school.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-background/60 px-2 py-2">
                  <p className="font-bold tabular-nums">{school.students}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="rounded-xl bg-background/60 px-2 py-2">
                  <p className="font-bold tabular-nums">{school.admins}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
                <div className="rounded-xl bg-background/60 px-2 py-2">
                  <p className="text-xs font-bold">{school.createdAt}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
              <Link
                href={`/super-admin/schools/${school.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-purple hover:underline"
              >
                Manage school
                <ChevronRight className="h-4 w-4" />
              </Link>
            </ManagementPanel>
          ))}
        </div>
      )}

      <SuperAdminModal open={open} title="Provision school" description="Add a new school tenant to the platform." onClose={() => setOpen(false)}>
        <form onSubmit={onProvision} className="space-y-4">
          <AdminFormField label="School name">
            <input required value={formName} onChange={(e) => setFormName(e.target.value)} className={adminInputClass} placeholder="Greenfield International" />
          </AdminFormField>
          <AdminFormField label="Location">
            <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className={adminInputClass} placeholder="Lagos, Nigeria" />
          </AdminFormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField label="Email">
              <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Phone">
              <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className={adminInputClass} />
            </AdminFormField>
          </div>
          <Button type="submit" disabled={createSchool.isPending} className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            {createSchool.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create school
          </Button>
        </form>
      </SuperAdminModal>
    </div>
  );
}

export function SuperAdminUsers() {
  const pageLoading = usePageLoading();
  const { data: users = EMPTY_PLATFORM_USERS, isFetching, isFetched } = useUsersList(EMPTY_PLATFORM_USERS);
  const updateUser = useUpdateUserStatus();
  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const roles = useMemo(
    () => Array.from(new Set(users.map((u) => u.role))).sort(),
    [users],
  );

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    pending: users.filter((u) => u.status === "pending").length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter && u.status !== statusFilter) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, query, statusFilter, roleFilter]);

  const onAction = async (userId: string, action: "suspend" | "restore") => {
    setPendingId(userId);
    try {
      await updateUser.mutateAsync({ userId, action });
      toast.success(action === "suspend" ? "User suspended" : "User restored");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <SuperAdminPageHeader
        title="Users"
        description={stats.total > 0 ? `${stats.total} accounts · ${stats.active} active · ${stats.suspended} suspended` : "Global user accounts across all schools and roles."}
        isFetching={isFetching}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard icon={Users} label="Total users" value={String(stats.total)} tone="purple" />
        <ManagementStatCard icon={UserCheck} label="Active" value={String(stats.active)} hint="Can sign in" tone="green" />
        <ManagementStatCard icon={UserX} label="Suspended" value={String(stats.suspended)} hint="Access blocked" tone="orange" />
        <ManagementStatCard label="Pending" value={String(stats.pending)} hint="Awaiting setup" tone="blue" />
      </div>

      <div className={dashboardFilterBarClass()} data-filter-bar="true">
        <DashboardSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name, email, or school..."
          type="text"
        />
        <DashboardFilterSelect
          label="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[{ value: "", label: "All roles" }, ...roles.map((role) => ({ value: role, label: role }))]}
        />
        <DashboardFilterSelect
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "pending", label: "Pending" },
          ]}
        />
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">School</th>
              <th className="px-5 py-3">Last login</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No users found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {query ? "Try a different search term." : "User accounts will appear here when created."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground">{u.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.role}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.school}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", USER_STATUS_STYLES[u.status])}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                        disabled={pendingId === u.id}
                        onClick={() => void onAction(u.id, "suspend")}
                      >
                        {pendingId === u.id && updateUser.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Suspend"
                        )}
                      </Button>
                    ) : u.status === "suspended" ? (
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-green text-white hover:bg-green/90"
                        disabled={pendingId === u.id}
                        onClick={() => void onAction(u.id, "restore")}
                      >
                        {pendingId === u.id && updateUser.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Restore"
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function SuperAdminAudit() {
  const pageLoading = usePageLoading();
  const { data: audit = EMPTY_PLATFORM_AUDIT, isFetching, isFetched } = useAuditLog("platform", EMPTY_PLATFORM_AUDIT);
  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => ({
    total: audit.length,
    info: audit.filter((e) => e.severity === "info").length,
    warning: audit.filter((e) => e.severity === "warning").length,
    critical: audit.filter((e) => e.severity === "critical").length,
  }), [audit]);

  const filtered = useMemo(() => {
    let rows = audit;
    if (severityFilter) rows = rows.filter((e) => e.severity === severityFilter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        (e.school ?? "").toLowerCase().includes(q),
    );
  }, [audit, query, severityFilter]);

  const onExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.AUDIT_EXPORT}?scope=platform`, { credentials: "include" });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Audit log exported");
    } catch {
      toast.error("Failed to export audit log");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <SuperAdminPageHeader
        title="Audit logs"
        description={stats.total > 0 ? `${stats.total} events · ${stats.warning} warnings · ${stats.critical} critical` : "Security and activity trail for platform-wide actions."}
        isFetching={isFetching}
        action={
          <Button variant="outline" className="rounded-full px-5" disabled={exporting} onClick={() => void onExport()}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard icon={Shield} label="Total events" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="Info" value={String(stats.info)} tone="blue" />
        <ManagementStatCard label="Warnings" value={String(stats.warning)} hint="Needs review" tone="orange" />
        <ManagementStatCard label="Critical" value={String(stats.critical)} hint="High priority" tone="green" />
      </div>

      <div className={dashboardFilterBarClass()} data-filter-bar="true">
        <DashboardSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by action, actor, or target..."
          type="text"
        />
        <DashboardFilterSelect
          label="Filter by severity"
          value={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: "", label: "All severities" },
            { value: "info", label: "Info" },
            { value: "warning", label: "Warning" },
            { value: "critical", label: "Critical" },
          ]}
        />
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No audit events found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {query ? "Try a different search term." : "Platform activity will be recorded here."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5 font-semibold text-foreground">{event.action}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{event.actor}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {event.target}
                    {event.school ? <span className="block text-xs text-muted-foreground/70">{event.school}</span> : null}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", AUDIT_SEVERITY_STYLES[event.severity])}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
