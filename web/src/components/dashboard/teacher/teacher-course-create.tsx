"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTeacherCourse, useTeacherCourses } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPanel } from "../management/management-ui";
import { teacherInitialLoading } from "./teacher-workflow-ui";

type CoursesData = {
  classes: { id: string; name: string }[];
  courses: { id: string; title: string; classId: string }[];
  subjects?: { id: string; name: string; code: string; classId: string }[];
};

const COURSES_EMPTY: CoursesData = { classes: [], courses: [] };

function CreateCourseSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-32 rounded bg-muted" />
      <div className="h-96 rounded-[20px] bg-muted" />
    </div>
  );
}

export function TeacherCourseCreate() {
  const pageLoading = usePageLoading();
  const { data: coursesData = COURSES_EMPTY, isFetching, isFetched } = useTeacherCourses<CoursesData>(COURSES_EMPTY);
  const createCourse = useCreateTeacherCourse();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const classes = coursesData.classes ?? [];
  const subjects = coursesData.subjects ?? [];

  const classSubjects = useMemo(
    () => subjects.filter((s) => s.classId === classId),
    [subjects, classId],
  );

  const loading = teacherInitialLoading(pageLoading, isFetching, isFetched);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createCourse.mutateAsync({
      title,
      classId,
      subjectId: subjectId || undefined,
      description,
    });
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/courses/${(created as { id: string }).id}`;
    }
  };

  if (loading) return <CreateCourseSkeleton />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/teacher/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create Course
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new course for one of your classes.
        </p>
      </div>

      <ManagementPanel className="border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <AdminFormField label="Course title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={adminInputClass}
              placeholder="e.g. Grade 10 Mathematics"
            />
          </AdminFormField>

          <AdminFormField label="Class">
            <select
              required
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSubjectId("");
              }}
              className={adminSelectClass}
            >
              <option value="">Select a class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>

          {classId && classSubjects.length > 0 && (
            <AdminFormField label="Subject">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={adminSelectClass}
              >
                <option value="">Auto-select first subject</option>
                {classSubjects.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
                ))}
              </select>
            </AdminFormField>
          )}

          <AdminFormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(adminInputClass, "min-h-[100px] py-2")}
              placeholder="Brief course description..."
              rows={4}
            />
          </AdminFormField>

          <Button
            type="submit"
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={createCourse.isPending || !classId}
          >
            {createCourse.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create course"
            )}
          </Button>
        </form>
      </ManagementPanel>
    </div>
  );
}
