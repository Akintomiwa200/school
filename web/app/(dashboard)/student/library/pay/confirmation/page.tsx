import { Suspense } from "react";
import { StudentLibraryPayConfirmation, StudentLibraryShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentLibraryShell showActions={false} standalone>
      <Suspense fallback={null}>
        <StudentLibraryPayConfirmation />
      </Suspense>
    </StudentLibraryShell>
  );
}
