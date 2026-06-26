"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateStaff } from "@/hooks/use-dashboard-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";
import { STAFF_DEPARTMENTS, STAFF_ROLES, type StaffRecord, type StaffRole } from "./admin-entities-data";

export function AdminStaffForm() {
  const router = useRouter();
  const createStaff = useCreateStaff();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("Teacher");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState<string>(STAFF_DEPARTMENTS[0]);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<StaffRecord["status"]>("active");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStaff.mutateAsync({
      name,
      email,
      phone,
      role,
      designation,
      department,
      joiningDate,
      status,
    });
    router.push("/admin/staff");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/staff" label="Back to staff" />
      <ManagementPageHeader
        title="Add staff member"
        description="Onboard a teacher or non-teaching employee to the school directory."
      />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Full name" className="sm:col-span-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={adminInputClass}
                placeholder="Employee full name"
              />
            </AdminFormField>
            <AdminFormField label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={adminInputClass}
                placeholder="name@school.edu"
              />
            </AdminFormField>
            <AdminFormField label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={adminInputClass}
                placeholder="+234 ..."
              />
            </AdminFormField>
            <AdminFormField label="Role">
              <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={adminSelectClass}>
                {STAFF_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Designation">
              <input
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={adminInputClass}
                placeholder="Job title"
              />
            </AdminFormField>
            <AdminFormField label="Department">
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={adminSelectClass}>
                {STAFF_DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Joining date">
              <input
                required
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffRecord["status"])}
                className={adminSelectClass}
              >
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </AdminFormField>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={createStaff.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {createStaff.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save staff member
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href="/admin/staff">Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
