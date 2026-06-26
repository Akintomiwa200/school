import { Suspense } from "react";
import { AdminClasses } from "@/components/dashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-muted" />}>
      <AdminClasses />
    </Suspense>
  );
}
