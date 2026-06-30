"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTeacherCourseModule, useTeacherCourse } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { AdminBackLink, AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TEACHER_COURSES, buildTeacherCoursesFallback } from "./teacher-data";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";
type CourseDetail = {
  id: string;
  title: string;
  classId: string;
  className: string;
  modules: { id: string; title: string; lessons: number; order: number }[];
  lessons: number;
  students: number;
  progress: number;
};

export function TeacherCourseDetail({ courseId }: { courseId: string }) {
  const pageLoading = usePageLoading();
  const fallbackCourse = TEACHER_COURSES.find((c) => c.id === courseId);
  const fallbackIndex = TEACHER_COURSES.findIndex((c) => c.id === courseId);
  const { data: course, isFetching, isError, isFetched } = useTeacherCourse<CourseDetail | null>(
    courseId,
    fallbackCourse
      ? {
          id: fallbackCourse.id,
          title: fallbackCourse.title,
          classId: buildTeacherCoursesFallback().courses[fallbackIndex]?.classId ?? "class-a",
          className: buildTeacherCoursesFallback().classes[fallbackIndex]?.name ?? fallbackCourse.title,
          modules: Array.from({ length: fallbackCourse.modules }, (_, moduleIndex) => ({
            id: `${fallbackCourse.id}-m${moduleIndex + 1}`,
            title: `Module ${moduleIndex + 1}`,
            lessons: Math.max(1, Math.round(fallbackCourse.lessons / fallbackCourse.modules)),
            order: moduleIndex + 1,
          })),
          lessons: fallbackCourse.lessons,
          students: fallbackCourse.students,
          progress: fallbackCourse.progress,
        }
      : undefined,
  );  const addModule = useCreateTeacherCourseModule(courseId);
  const [open, setOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !course)) {
    return (
      <TeacherNotFound
        title="Course not found"
        description="This course is not in your teaching load or the link is invalid."
        backHref="/teacher/courses"
        backLabel="Back to courses"
      />
    );
  }

  if (!course) return <TeacherDetailSkeleton />;
  const onAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    await addModule.mutateAsync(moduleTitle);
    setModuleTitle("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/teacher/courses" label="Back to courses" />
      <ManagementPageHeader
        title={course.title}
        description={`${course.className} · ${course.modules.length} modules · ${course.lessons} lessons`}
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Add module
          </Button>
        }
      />

      <ManagementPanel className="border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{course.students} students enrolled</p>
          <p className="text-sm font-bold text-brand-purple">{course.progress}% complete</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand-purple" style={{ width: `${course.progress}%` }} />
        </div>
        <p className="mt-3 text-sm">
          <Link href={`/teacher/classes/${course.classId}`} className="font-medium text-brand-purple hover:underline">
            View class roster
          </Link>
        </p>
      </ManagementPanel>

      <div className="space-y-3">
        {course.modules.map((module) => (
          <ManagementPanel key={module.id} className="border border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Module {module.order}</p>
                <h3 className="font-bold">{module.title}</h3>
                <p className="text-sm text-muted-foreground">{module.lessons} lessons</p>
              </div>
            </div>
          </ManagementPanel>
        ))}
      </div>

      {open ? (
        <ManagementPanel className="border border-border">
          <form onSubmit={onAddModule} className="space-y-4">
            <AdminFormField label="Module title">
              <input required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={addModule.isPending}>
                {addModule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add module"}
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </ManagementPanel>
      ) : null}
    </div>
  );
}
