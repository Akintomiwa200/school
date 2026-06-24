export function LibrarySkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-[220px] rounded-[28px] bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="h-56 rounded-[24px] bg-muted" />
          <div className="h-56 rounded-[24px] bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-52 rounded-[24px] bg-muted" />
          <div className="h-64 rounded-[24px] bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function LibraryListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-[24px] bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function LibraryDetailSkeleton() {
  return (
    <div className="animate-pulse grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="h-80 rounded-[24px] bg-muted" />
      <div className="h-64 rounded-[24px] bg-muted" />
    </div>
  );
}
