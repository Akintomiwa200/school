import { Suspense } from "react";
import { AdminStudentEnrollForm } from "@/components/dashboard/admin/admin-student-enroll";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-muted" />}>
      <AdminStudentEnrollForm />
    </Suspense>
  );
}
