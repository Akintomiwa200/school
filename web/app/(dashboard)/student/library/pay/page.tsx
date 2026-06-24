import { Suspense } from "react";
import { StudentLibraryPay, StudentLibraryShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentLibraryShell showActions={false} standalone>
      <Suspense fallback={null}>
        <StudentLibraryPay />
      </Suspense>
    </StudentLibraryShell>
  );
}
