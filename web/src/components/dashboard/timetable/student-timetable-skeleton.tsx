import { Skeleton } from "@/components/ui/skeleton";

export function StudentTimetableSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-[520px] w-full rounded-[20px]" />
        <Skeleton className="h-[520px] w-full rounded-[20px]" />
      </div>
    </div>
  );
}
