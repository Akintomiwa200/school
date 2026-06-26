import { Suspense } from "react";
import { LibraryCatalog } from "@/components/dashboard/librarian";

const BASE = "/admin/library";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-muted" />}>
      <LibraryCatalog basePath={BASE} />
    </Suspense>
  );
}
