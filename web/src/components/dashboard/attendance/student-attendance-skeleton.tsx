import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePanel } from "./attendance-ui";

export function StudentAttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[20px]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-72 rounded-[20px]" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-72 rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}

export function StudentAttendanceListSkeleton() {
  return (
    <AttendancePanel className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-2xl" />
      ))}
    </AttendancePanel>
  );
}
