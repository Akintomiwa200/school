"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassesList, useCreateStudent } from "@/hooks/use-dashboard-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";
import { ADMIN_CLASSES, ADMIN_STUDENT_GRADES } from "./admin-entities-data";

export function AdminStudentEnrollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createStudent = useCreateStudent();
  const { data: classes = ADMIN_CLASSES } = useClassesList(ADMIN_CLASSES);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guardian, setGuardian] = useState("");
  const [grade, setGrade] = useState<string>(ADMIN_STUDENT_GRADES[2] ?? "10");
  const [className, setClassName] = useState("10-A");

  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    const classParam = searchParams.get("class");
    if (gradeParam) setGrade(gradeParam);
    if (classParam) setClassName(classParam);
  }, [searchParams]);

  const sectionsForGrade = useMemo(
    () => classes.filter((c) => c.grade === grade).map((c) => c.section),
    [classes, grade],
  );

  const onGradeChange = (nextGrade: string) => {
    setGrade(nextGrade);
    const first = classes.find((c) => c.grade === nextGrade);
    setClassName(first ? `${nextGrade}-${first.section}` : `${nextGrade}-A`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent.mutateAsync({
      name,
      email,
      guardian,
      grade,
      className,
      status: "active",
      enrolledDate: new Date().toISOString().slice(0, 10),
    });
    router.push("/admin/students");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/students" label="Back to students" />
      <ManagementPageHeader
        title="Enroll student"
        description="Add a new student to the school roster and assign a class."
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
                placeholder="Student full name"
              />
            </AdminFormField>
            <AdminFormField label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={adminInputClass}
                placeholder="student@school.edu"
              />
            </AdminFormField>
            <AdminFormField label="Guardian">
              <input
                required
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
                className={adminInputClass}
                placeholder="Parent or guardian name"
              />
            </AdminFormField>
            <AdminFormField label="Grade">
              <select
                value={grade}
                onChange={(e) => onGradeChange(e.target.value)}
                className={adminSelectClass}
              >
                {ADMIN_STUDENT_GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Class section">
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={adminSelectClass}
              >
                {(sectionsForGrade.length > 0 ? sectionsForGrade : ["A"]).map((section) => (
                  <option key={section} value={`${grade}-${section}`}>
                    {grade}-{section}
                  </option>
                ))}
              </select>
            </AdminFormField>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={createStudent.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {createStudent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enroll student
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href="/admin/students">Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
