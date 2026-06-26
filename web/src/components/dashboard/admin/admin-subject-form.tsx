"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateSubject, useStaffList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";
import {
  ADMIN_STAFF,
  ADMIN_STUDENT_GRADES,
  STAFF_DEPARTMENTS,
  type SubjectRecord,
} from "./admin-entities-data";

export function AdminSubjectForm() {
  const router = useRouter();
  const createSubject = useCreateSubject();
  const { data: staff = ADMIN_STAFF } = useStaffList(ADMIN_STAFF);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("3");
  const [department, setDepartment] = useState<string>(STAFF_DEPARTMENTS[0]);
  const [status, setStatus] = useState<SubjectRecord["status"]>("active");
  const [gradeLevels, setGradeLevels] = useState<string[]>(["10"]);
  const [assignedTeacherIds, setAssignedTeacherIds] = useState<string[]>([]);

  const eligibleTeachers = staff.filter(
    (member) => member.status === "active" && (member.role === "Teacher" || member.role === "HOD"),
  );

  const toggleGrade = (grade: string) => {
    setGradeLevels((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade].sort(),
    );
  };

  const toggleTeacher = (staffId: string) => {
    setAssignedTeacherIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId],
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createSubject.mutateAsync({
      ...(code.trim() ? { code: code.trim() } : {}),
      name,
      description,
      credits: Number(credits),
      department,
      gradeLevels,
      status,
      assignedTeacherIds,
    });
    router.push(`/admin/subjects/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/subjects" label="Back to subjects" />
      <ManagementPageHeader
        title="Add subject"
        description="Create a curriculum subject with credits, grade levels, and optional teacher assignments."
      />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Subject code">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={adminInputClass}
                placeholder="Auto-generated if empty"
              />
            </AdminFormField>
            <AdminFormField label="Credits">
              <input
                required
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="Subject name" className="sm:col-span-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={adminInputClass}
                placeholder="e.g. Algebra II"
              />
            </AdminFormField>
            <AdminFormField label="Description" className="sm:col-span-2">
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={cn(adminInputClass, "h-auto min-h-[88px] py-2")}
                placeholder="Brief syllabus overview"
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
            <AdminFormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubjectRecord["status"])}
                className={adminSelectClass}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </AdminFormField>
          </div>

          <AdminFormField label="Grade levels">
            <div className="flex flex-wrap gap-2">
              {ADMIN_STUDENT_GRADES.map((grade) => {
                const selected = gradeLevels.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Grade {grade}
                  </button>
                );
              })}
            </div>
          </AdminFormField>

          <AdminFormField label="Assign teachers (optional)">
            <div className="space-y-2 rounded-xl border border-border p-3">
              {eligibleTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active teachers available.</p>
              ) : (
                eligibleTeachers.map((member) => (
                  <label key={member.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={assignedTeacherIds.includes(member.id)}
                      onChange={() => toggleTeacher(member.id)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>
                      {member.name} — {member.department}
                    </span>
                  </label>
                ))
              )}
            </div>
          </AdminFormField>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={createSubject.isPending || gradeLevels.length === 0}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {createSubject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create subject
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href="/admin/subjects">Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
