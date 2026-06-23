"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageLoading } from "@/hooks/use-page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseMaterials, getStudentCourseById } from "./student-course-data";
import { CoursesPanel } from "./course-ui";

export function StudentCourseMaterials({ courseId }: { courseId: string }) {
  const isLoading = usePageLoading();
  const course = getStudentCourseById(courseId);

  if (!course) {
    return null;
  }

  const materials = getCourseMaterials(course.id);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No materials yet"
        description="Course files from your teacher will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <CoursesPanel key={material.id} className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/15">
            <FileText className="h-5 w-5 text-brand-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{material.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {material.fileType} · {material.fileSize}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 rounded-full">
            Download
          </Button>
        </CoursesPanel>
      ))}
    </div>
  );
}
