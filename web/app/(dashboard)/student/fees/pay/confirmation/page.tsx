import { Suspense } from "react";
import { StudentFeesPayConfirmation, StudentFeesShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentFeesShell showActions={false}>
      <Suspense fallback={null}>
        <StudentFeesPayConfirmation />
      </Suspense>
    </StudentFeesShell>
  );
}
