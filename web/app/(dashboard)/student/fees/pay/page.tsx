import { Suspense } from "react";
import { StudentFeesPay, StudentFeesShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentFeesShell showActions={false}>
      <Suspense fallback={null}>
        <StudentFeesPay />
      </Suspense>
    </StudentFeesShell>
  );
}
