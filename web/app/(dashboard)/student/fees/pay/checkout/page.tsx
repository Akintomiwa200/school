import { Suspense } from "react";
import { StudentFeesPayCheckout, StudentFeesShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentFeesShell showActions={false}>
      <Suspense fallback={null}>
        <StudentFeesPayCheckout />
      </Suspense>
    </StudentFeesShell>
  );
}
