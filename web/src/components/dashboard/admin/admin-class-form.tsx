"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcademicYears, useCreateClass, useStaffList } from "@/hooks/use-dashboard-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";
import { ADMIN_ACADEMIC_YEARS, ADMIN_STAFF, ADMIN_STUDENT_GRADES } from "./admin-entities-data";

export function AdminClassCreateForm() {
  const router = useRouter();
  const createClass = useCreateClass();
  const { data: staff = ADMIN_STAFF } = useStaffList(ADMIN_STAFF);
  const { data: academicYears = ADMIN_ACADEMIC_YEARS } = useAcademicYears(ADMIN_ACADEMIC_YEARS);

  const teachers = useMemo(
    () => staff.filter((member) => member.status === "active" && (member.role === "Teacher" || member.role === "HOD")),
    [staff],
  );

  const defaultYearId = useMemo(
    () => academicYears.find((year) => year.status === "active")?.id ?? academicYears[0]?.id ?? "ay1",
    [academicYears],
  );

  const [grade, setGrade] = useState<string>(ADMIN_STUDENT_GRADES[2] ?? "10");
  const [section, setSection] = useState("A");
  const [homeroomTeacher, setHomeroomTeacher] = useState(teachers[0]?.name ?? "");
  const [academicYearId, setAcademicYearId] = useState(defaultYearId);
  const [capacity, setCapacity] = useState("35");

  useEffect(() => {
    if (!homeroomTeacher && teachers.length > 0) {
      setHomeroomTeacher(teachers[0].name);
    }
  }, [homeroomTeacher, teachers]);

  useEffect(() => {
    if (defaultYearId) setAcademicYearId(defaultYearId);
  }, [defaultYearId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createClass.mutateAsync({
      grade,
      section,
      homeroomTeacher,
      capacity: Number(capacity),
      academicYearId,
    });
    router.push(`/admin/classes/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/classes" label="Back to classes" />
      <ManagementPageHeader
        title="New class"
        description="Create a grade section with homeroom teacher, academic year, and capacity."
      />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Academic year" className="sm:col-span-2">
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className={adminSelectClass}
              >
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.status})
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Grade">
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className={adminSelectClass}>
                {ADMIN_STUDENT_GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Section">
              <select value={section} onChange={(e) => setSection(e.target.value)} className={adminSelectClass}>
                {["A", "B", "C", "D", "E"].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Homeroom teacher" className="sm:col-span-2">
              <select
                value={homeroomTeacher}
                onChange={(e) => setHomeroomTeacher(e.target.value)}
                className={adminSelectClass}
              >
                {teachers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name} — {member.department}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Capacity" className="sm:col-span-2">
              <input
                required
                type="number"
                min={1}
                max={60}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={createClass.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {createClass.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create class
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href="/admin/classes">Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
