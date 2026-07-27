"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Building2, Loader2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useSchoolDetail, useUpdateSchool, useDeleteSchool } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel, ManagementStatCard } from "@/components/dashboard/management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass } from "@/components/dashboard/admin/admin-workflow-ui";
import { SCHOOL_STATUS_STYLES } from "@/components/dashboard/super-admin/super-admin-entities-data";

export default function SchoolDetailPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const router = useRouter();
  const loading = usePageLoading(300);
  const { data: school, isFetching } = useSchoolDetail(schoolId);
  const updateSchool = useUpdateSchool(schoolId);
  const deleteSchool = useDeleteSchool(schoolId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const loaded = useState(false);

  if (loading || isFetching) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  if (!school) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">School not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/super-admin/schools">Back to schools</Link>
        </Button>
      </ManagementPanel>
    );
  }

  if (!loaded[0]) {
    loaded[1](true);
    setName(school.name);
    setLocation(school.location);
    setEmail(school.email);
    setPhone(school.phone);
  }

  const stats = [
    { id: "students", label: "Students", value: String(school.stats.students), hint: "Enrolled", tone: "purple" as const },
    { id: "teachers", label: "Teachers", value: String(school.stats.teachers), hint: "Active staff", tone: "blue" as const },
    { id: "admins", label: "Admins", value: String(school.stats.admins), hint: "System access", tone: "green" as const },
    { id: "total", label: "Total users", value: String(school.stats.totalUsers), hint: "All accounts", tone: "orange" as const },
  ];

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchool.mutateAsync({ name, location: location || undefined, email: email || undefined, phone: phone || undefined });
    setEditing(false);
  };

  const onActivate = async () => {
    await updateSchool.mutateAsync({ status: "active" as never });
  };

  const onDelete = async () => {
    if (!confirm("Suspend this school? Users will lose access.")) return;
    await deleteSchool.mutateAsync();
    router.push("/super-admin/schools");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/super-admin/schools" label="Back to schools" />
      <ManagementPageHeader
        title={school.name}
        description={school.location ? `${school.location} · ${school.status}` : school.status}
        action={
          <div className="flex gap-2">
            {school.status === "provisioning" && (
              <Button onClick={onActivate} disabled={updateSchool.isPending} className="h-10 rounded-full bg-green px-5 text-white hover:bg-green/90">
                Activate
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditing(!editing)} className="h-10 rounded-full px-5">
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <ManagementStatCard key={stat.id} {...stat} />
        ))}
      </div>

      {editing ? (
        <ManagementPanel className="mx-auto max-w-2xl border border-border">
          <form onSubmit={onSave} className="space-y-4">
            <AdminFormField label="School name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={adminInputClass} />
              </AdminFormField>
              <AdminFormField label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={adminInputClass} />
              </AdminFormField>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateSchool.isPending} className="h-10 rounded-full bg-brand-purple px-5 text-white">
                {updateSchool.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)} className="h-10 rounded-full px-5">Cancel</Button>
            </div>
          </form>
        </ManagementPanel>
      ) : (
        <ManagementPanel className="border border-border">
          <h2 className="mb-4 text-base font-bold">School details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{school.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{school.location || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{school.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{school.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", SCHOOL_STATUS_STYLES[school.status as keyof typeof SCHOOL_STATUS_STYLES])}>
                  {school.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{school.createdAt}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <Button variant="destructive" onClick={onDelete} disabled={deleteSchool.isPending} className="h-9 rounded-full px-5">
              {deleteSchool.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Suspend school
            </Button>
          </div>
        </ManagementPanel>
      )}

      <ManagementPanel className="border border-border">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-bold">Recent users</h2>
        </div>
        {school.recentUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users in this school yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {school.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  u.isActive ? "bg-green/15 text-green" : "bg-destructive/15 text-destructive",
                )}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ManagementPanel>
    </div>
  );
}
