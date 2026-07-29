"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  Users,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTeacherCourseModule, useTeacherCourse } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import { ManagementPanel } from "../management/management-ui";
import { TeacherDetailSkeleton, TeacherLiveBadge, TeacherNotFound } from "./teacher-workflow-ui";

type CourseItem = {
  id: string;
  title: string;
  type: "assignment" | "material";
  dueDate?: string;
  status?: string;
  submitted?: number;
  total?: number;
  fileType?: string;
  fileSize?: string;
  createdAt: string;
};

type CourseDetail = {
  id: string;
  title: string;
  classId: string;
  className: string;
  students: number;
  progress: number;
  items: CourseItem[];
};

export function TeacherCourseDetail({ courseId }: { courseId: string }) {
  const pageLoading = usePageLoading();
  const [moduleTitle, setModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const createModule = useCreateTeacherCourseModule(courseId);
  const {
    data: course,
    isFetching,
    isError,
    isFetched,
  } = useTeacherCourse<CourseDetail | null>(courseId);

  const stats = useMemo(() => {
    if (!course) return null;
    const assignments = course.items.filter((i) => i.type === "assignment");
    const materials = course.items.filter((i) => i.type === "material");
    return { assignments: assignments.length, materials: materials.length, total: course.items.length };
  }, [course]);

  const isLoading = (pageLoading && isFetching) || (isFetching && !isFetched);

  const onAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    await createModule.mutateAsync(moduleTitle.trim());
    setModuleTitle("");
    setShowAddModule(false);
  };

  if (isLoading) return <TeacherDetailSkeleton />;

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

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
              {course.title}
            </h1>
            <TeacherLiveBadge isFetching={isFetching} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.className} · {stats?.assignments ?? 0} assignments ·{" "}
            {stats?.materials ?? 0} materials · {course.students} students
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
          <Link href={`/teacher/classes/${course.classId}`}>
            <Users className="mr-2 h-4 w-4" />
            View class
          </Link>
        </Button>
      </div>

      <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-purple to-brand-blue p-0 text-white shadow-float">
        <div className="relative z-10 p-6 sm:p-8 sm:pr-40">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/85">Course Content</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="text-3xl font-bold tabular-nums sm:text-4xl">{course.progress}%</h2>
              <span className="text-sm font-medium text-white/75">
                {course.progress === 100 ? "Complete" : course.progress >= 80 ? "Almost Done" : course.progress >= 50 ? "Halfway There" : course.progress > 0 ? "Getting Started" : "Not Started"}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1.5">{stats?.total ?? 0} total items</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">{stats?.assignments ?? 0} assignments</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">{stats?.materials ?? 0} materials</span>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
        >
          <BookOpen className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
        </div>
      </ManagementPanel>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Assignments & Materials</h2>
          <p className="text-sm text-muted-foreground">
            {course.items.length === 0 ? "No content yet for this course." : `${course.items.length} items`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => setShowAddModule((prev) => !prev)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add assignment
        </Button>
      </div>

      {showAddModule && (
        <ManagementPanel className="border border-border">
          <form onSubmit={onAddModule} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <AdminFormField label="Assignment title" className="flex-1">
              <input
                required
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className={adminInputClass}
                placeholder="e.g. Chapter 3 Quiz"
              />
            </AdminFormField>
            <Button
              type="submit"
              className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
              disabled={createModule.isPending}
            >
              {createModule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </form>
        </ManagementPanel>
      )}

      {course.items.length === 0 ? (
        <ManagementPanel className="border border-border py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No content yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Assignments and materials added to this course will appear here.
          </p>
        </ManagementPanel>
      ) : (
        <div className="space-y-3">
          {course.items.map((item) => (
            <CourseItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseItemCard({ item }: { item: CourseItem }) {
  const href = item.type === "assignment"
    ? `/teacher/assignments/${item.id}`
    : `/teacher/materials/${item.id}`;

  return (
    <Link href={href}>
      <ManagementPanel className="border border-border transition-all hover:-translate-y-0.5 hover:shadow-float">
        <div className="flex items-start gap-4">
          <span className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            item.type === "assignment" ? "bg-brand-purple/10" : "bg-brand-blue/10"
          )}>
            {item.type === "assignment" ? (
              <ClipboardList className="h-5 w-5 text-brand-purple" />
            ) : (
              <FileText className="h-5 w-5 text-brand-blue" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 capitalize">
                {item.type}
              </span>
              {item.type === "assignment" && item.dueDate && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due {item.dueDate}
                </span>
              )}
              {item.type === "material" && item.fileType && (
                <span>{item.fileType.toUpperCase()} · {item.fileSize ?? "—"}</span>
              )}
            </div>
          </div>
        </div>
      </ManagementPanel>
    </Link>
  );
}
