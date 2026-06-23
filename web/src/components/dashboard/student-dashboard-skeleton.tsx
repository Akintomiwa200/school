import { Skeleton } from "@/components/ui/skeleton";

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] bg-card p-5 sm:p-6 ${className ?? ""}`}>{children}</div>
  );
}

export function StudentDashboardSkeleton() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-8">
            <CardShell className="min-h-[148px]">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-8 w-64 max-w-full" />
              <Skeleton className="mt-4 h-10 w-40 rounded-full" />
            </CardShell>
          </div>

          <div className="lg:col-span-4 lg:row-span-2">
            <CardShell className="flex h-full min-h-[320px] flex-col">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="mt-3 h-4 w-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-2xl" />
                ))}
              </div>
            </CardShell>
          </div>

          <div className="lg:col-span-5 lg:row-start-2">
            <CardShell className="min-h-[340px]">
              <div className="mb-5 flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-40" />
              <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            </CardShell>
          </div>

          <div className="lg:col-span-3 lg:row-span-2 lg:row-start-2">
            <CardShell className="min-h-[340px]">
              <div className="mb-5 flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="mx-auto h-20 w-20 rounded-full" />
                ))}
              </div>
            </CardShell>
          </div>

          <div className="lg:col-span-5 lg:row-start-3">
            <CardShell>
              <Skeleton className="mb-4 h-5 w-32" />
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="mb-3 h-16 w-full rounded-2xl last:mb-0" />
              ))}
            </CardShell>
          </div>

          <div className="lg:col-span-4">
            <CardShell>
              <Skeleton className="mb-4 h-5 w-36" />
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="mb-2.5 h-16 w-full rounded-[20px] last:mb-0" />
              ))}
            </CardShell>
          </div>
        </div>
      </div>
    </div>
  );
}
