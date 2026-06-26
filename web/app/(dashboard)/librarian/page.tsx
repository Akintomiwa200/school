import { Suspense } from "react";
import { LibraryDashboard } from "@/components/dashboard/librarian";

const BASE = "/librarian";
const fallback = <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

export default function Page() {
  return (
    <Suspense fallback={fallback}>
      <LibraryDashboard basePath={BASE} />
    </Suspense>
  );
}
