import { GradesPanel } from "./grade-ui";

export function StudentGradesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GradesPanel key={i} className="h-24 animate-pulse bg-muted/40" />
        ))}
      </div>
      <GradesPanel className="h-64 animate-pulse bg-muted/40" />
      <GradesPanel className="h-48 animate-pulse bg-muted/40" />
    </div>
  );
}

export function StudentGradesListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <GradesPanel key={i} className="h-16 animate-pulse bg-muted/40" />
      ))}
    </div>
  );
}
