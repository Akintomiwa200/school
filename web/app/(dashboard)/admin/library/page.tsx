import { Suspense } from "react";
import { AdminLibraryDashboard } from "@/components/dashboard/admin/admin-library-dashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-muted" />}>
      <AdminLibraryDashboard />
    </Suspense>
  );
}
