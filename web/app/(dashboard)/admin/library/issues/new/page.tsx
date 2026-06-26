import { Suspense } from "react";
import { LibraryIssueForm } from "@/components/dashboard/librarian";

const BASE = "/admin/library";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-muted" />}>
      <LibraryIssueForm basePath={BASE} />
    </Suspense>
  );
}
