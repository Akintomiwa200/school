"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useDeleteSchool,
  useSchoolDetail,
  useUpdateSchool,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { SCHOOL_STATUS_STYLES } from "./super-admin-entities-data";
import {
  SUPER_ADMIN_AVATAR_TONES,
  SuperAdminDetailSkeleton,
  SuperAdminNotFound,
  getSuperAdminInitials,
  superAdminInitialLoading,
} from "./super-admin-workflow-ui";

const STATUS_BANNER_STYLES: Record<string, string> = {
  active: "from-green to-brand-blue",
  inactive: "from-muted-foreground to-muted",
  suspended: "from-brand-pink to-red-600",
  provisioning: "from-brand-orange to-brand-yellow",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  active: CheckCircle2,
  inactive: XCircle,
  suspended: ShieldAlert,
  provisioning: Clock,
};

const ROLE_BADGES: Record<string, string> = {
  admin: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
  teacher: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  student: "bg-green/10 text-green border-green/20",
  parent: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
};

type SchoolDetail = {
  id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  stats: {
    students: number;
    teachers: number;
    admins: number;
    totalUsers: number;
    activeUsers?: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
    isActive: boolean;
    lastActive?: string;
  }[];
};

export function SuperAdminSchoolDetail({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const pageLoading = usePageLoading(300);
  const {
    data: school,
    isFetching,
    isFetched,
    isError,
  } = useSchoolDetail<SchoolDetail | null>(schoolId);
  const updateSchool = useUpdateSchool(schoolId);
  const deleteSchool = useDeleteSchool(schoolId);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!school) return;
    setName(school.name);
    setLocation(school.location);
    setEmail(school.email);
    setPhone(school.phone);
  }, [school]);

  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!school) return null;

    const activeUsers =
      school.stats.activeUsers ??
      school.recentUsers.filter((u) => u.isActive).length;
    const inactiveUsers = school.stats.totalUsers - activeUsers;
    const adminUsers = school.recentUsers.filter((u) => u.role === "admin").length;

    return {
      activeUsers,
      inactiveUsers,
      adminUsers,
      activationRate:
        school.stats.totalUsers > 0
          ? Math.round((activeUsers / school.stats.totalUsers) * 100)
          : 0,
    };
  }, [school]);

  if (loading) return <SuperAdminDetailSkeleton />;

  if (isFetched && (isError || !school)) {
    return (
      <SuperAdminNotFound
        title="School not found"
        description="This school may have been removed or the link is invalid."
        backHref="/super-admin/schools"
        backLabel="Back to schools"
      />
    );
  }

  if (!school) return <SuperAdminDetailSkeleton />;

  const StatusIcon = STATUS_ICONS[school.status] || Building2;
  const bannerGradient = STATUS_BANNER_STYLES[school.status] || STATUS_BANNER_STYLES.active;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchool.mutateAsync({
      name,
      location: location || undefined,
      email: email || undefined,
      phone: phone || undefined,
    });
    setEditing(false);
  };

  const handleActivate = async () => {
    await updateSchool.mutateAsync({ status: "active" as never });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to suspend this school? All users will lose access.")) return;
    await deleteSchool.mutateAsync();
    router.push("/super-admin/schools");
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href="/super-admin/schools"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to schools
      </Link>

      {/* School Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <span
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-md",
              SUPER_ADMIN_AVATAR_TONES.purple
            )}
          >
            {getSuperAdminInitials(school.name)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
              {school.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {school.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {school.location}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                  SCHOOL_STATUS_STYLES[school.status as keyof typeof SCHOOL_STATUS_STYLES]
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {school.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {school.status === "provisioning" && (
            <Button
              onClick={() => void handleActivate()}
              disabled={updateSchool.isPending}
              className="rounded-full bg-green text-white hover:bg-green/90"
            >
              {updateSchool.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Activate
            </Button>
          )}
          <Button
            variant={editing ? "default" : "outline"}
            onClick={() => setEditing(!editing)}
            className={cn(
              "rounded-full",
              editing && "bg-brand-purple text-white hover:bg-brand-purple/90"
            )}
          >
            {editing ? (
              "Cancel"
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <ManagementPanel
        className={cn(
          "relative overflow-hidden border-0 bg-gradient-to-r p-0 text-white shadow-float",
          bannerGradient
        )}
      >
        <div className="relative z-10 p-6 sm:p-8 sm:pr-40 lg:pr-48">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/85">School Status</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl capitalize">
              {school.status}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
              {school.status === "active"
                ? "This school is fully operational with active users."
                : school.status === "provisioning"
                ? "This school is being set up and awaiting activation."
                : school.status === "suspended"
                ? "This school has been suspended and users cannot access the platform."
                : "School status needs attention."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1.5">
                {school.stats.totalUsers} Total Users
              </span>
              {metrics && (
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {metrics.activeUsers} Active
                </span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1.5">
                Created {school.createdAt}
              </span>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
        >
          <Building2 className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
        </div>
      </ManagementPanel>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementPanel className="border border-brand-purple/15 bg-brand-purple/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple text-white">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {school.stats.totalUsers}
              </p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-brand-blue/15 bg-brand-blue/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {metrics?.activeUsers ?? school.stats.totalUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                Active · {metrics?.activationRate ?? 0}%
              </p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-green/15 bg-green/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {school.stats.admins}
              </p>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-brand-orange/15 bg-brand-orange/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{school.stats.students + school.stats.teachers}</p>
              <p className="text-xs text-muted-foreground">Students & Teachers</p>
            </div>
          </div>
        </ManagementPanel>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "overview"
              ? "bg-brand-purple text-white shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "users"
              ? "bg-brand-purple text-white shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Users ({school.recentUsers.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {editing ? (
            <ManagementPanel className="border-2 border-brand-purple/30 bg-brand-purple/5">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Edit School Details</h2>
                  <p className="text-xs text-muted-foreground">
                    Update the school's information.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="school-name"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    School Name *
                  </label>
                  <input
                    id="school-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-brand-purple/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="school-location"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Location
                  </label>
                  <input
                    id="school-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-brand-purple/40"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="school-email"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="school-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="school@domain.com"
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="school-phone"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Phone
                    </label>
                    <input
                      id="school-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-brand-purple/40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={updateSchool.isPending || !name.trim()}
                    className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
                  >
                    {updateSchool.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setEditing(false)}
                    disabled={updateSchool.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </ManagementPanel>
          ) : (
            <ManagementPanel className="border border-border">
              <h2 className="mb-4 text-base font-bold text-foreground">
                School Information
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    School Name
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {school.name}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {school.location || "—"}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {school.email || "—"}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {school.phone || "—"}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        SCHOOL_STATUS_STYLES[
                          school.status as keyof typeof SCHOOL_STATUS_STYLES
                        ]
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {school.status}
                    </span>
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/30 px-4 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Created
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {school.createdAt}
                  </dd>
                </div>
              </dl>

              {/* Danger Zone */}
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-sm font-bold text-destructive mb-2">Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Suspending a school will revoke access for all users. This action can be reversed.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => void handleDelete()}
                  disabled={deleteSchool.isPending}
                  className="rounded-full"
                >
                  {deleteSchool.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Suspend school
                </Button>
              </div>
            </ManagementPanel>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <ManagementPanel className="overflow-hidden border border-border p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Recent Users</h2>
              <p className="text-xs text-muted-foreground">
                {school.recentUsers.length} account
                {school.recentUsers.length !== 1 ? "s" : ""} in this school
                {metrics && ` · ${metrics.activeUsers} active`}
              </p>
            </div>
            {school.recentUsers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Manage users
              </Button>
            )}
          </div>

          {school.recentUsers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No users in this school
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Users will appear here once they are added to this school.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {school.recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              SUPER_ADMIN_AVATAR_TONES[
                                user.role === "admin"
                                  ? "purple"
                                  : user.role === "teacher"
                                  ? "blue"
                                  : "green"
                              ]
                            )}
                          >
                            {getSuperAdminInitials(user.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            ROLE_BADGES[user.role] || ROLE_BADGES.student
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-muted-foreground">
                            {user.joinedAt}
                          </p>
                          {user.lastActive && (
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              Active: {user.lastActive}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            user.isActive
                              ? "bg-green/10 text-green"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {user.isActive ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs font-semibold text-brand-purple hover:bg-brand-purple/10"
                          asChild
                        >
                          <Link href={`/super-admin/users/${user.id}`}>
                            View <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ManagementPanel>
      )}

      {/* Footer */}
      {school.updatedAt && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: {school.updatedAt}
          </p>
        </div>
      )}
    </div>
  );
}
