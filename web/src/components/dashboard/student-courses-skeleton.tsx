import { Skeleton } from "@/components/ui/skeleton";

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] bg-card p-4 shadow-float sm:p-5 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function StudentCoursesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-16" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Panel key={index} className="flex gap-4 sm:gap-5">
                <Skeleton className="h-[118px] w-[118px] shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex justify-between gap-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-7 w-14" />
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="mx-auto h-12 w-8" />
              ))}
            </div>
          </Panel>
          <Panel className="bg-muted">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="mt-4 space-y-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-[5rem] w-full rounded-lg" />
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
