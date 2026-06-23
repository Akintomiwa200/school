import { Skeleton } from "@/components/ui/skeleton";
import { CoursesPanel } from "./course-ui";

export function StudentCourseDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
      <div className="space-y-5">
        <CoursesPanel>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-3 h-16 w-full" />
        </CoursesPanel>
        <CoursesPanel>
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="mt-3 h-14 w-full rounded-2xl" />
          ))}
        </CoursesPanel>
      </div>
      <aside className="space-y-4">
        <CoursesPanel>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-4 h-10 w-20" />
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
        </CoursesPanel>
        <CoursesPanel>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-4 h-14 w-full rounded-2xl" />
        </CoursesPanel>
      </aside>
    </div>
  );
}
