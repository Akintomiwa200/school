import { Skeleton } from "@/components/ui/skeleton";
import { FeesPanel } from "./fee-ui";

export function StudentFeesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-[20px]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Skeleton className="h-72 w-full rounded-[20px]" />
        <Skeleton className="h-72 w-full rounded-[20px]" />
      </div>
      <Skeleton className="h-64 w-full rounded-[20px]" />
    </div>
  );
}

export function StudentFeesTableSkeleton() {
  return (
    <FeesPanel className="space-y-4">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-xl" />
      ))}
    </FeesPanel>
  );
}

export function StudentFeesListSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full rounded-[20px]" />
    </div>
  );
}
