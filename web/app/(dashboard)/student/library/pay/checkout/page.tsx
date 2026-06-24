import { Suspense } from "react";
import { StudentLibraryPayCheckout, StudentLibraryShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentLibraryShell showActions={false} standalone>
      <Suspense fallback={null}>
        <StudentLibraryPayCheckout />
      </Suspense>
    </StudentLibraryShell>
  );
}
